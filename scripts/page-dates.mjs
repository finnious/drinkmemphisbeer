// Builds src/data/page-dates.json: { "/url/": { published, modified } } from git history.
// Run before every build. If git history is missing or shallow (some CI clones),
// it keeps the committed JSON and only fills in URLs it has never seen.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/page-dates.json');
const sh = (cmd) => execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let git = true;
try {
  if (sh('git rev-parse --is-shallow-repository') === 'true') git = false;
} catch {
  git = false;
}

const now = new Date().toISOString();
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

// One `git log` pass: file -> [oldest, newest] commit dates.
const fileDates = new Map();
if (git) {
  const log = sh('git log --name-only --format=__C__%aI -- src/pages src/content');
  let date = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('__C__')) { date = line.slice(5); continue; }
    if (!line.trim() || !date) continue;
    const f = line.trim();
    const cur = fileDates.get(f);
    if (!cur) fileDates.set(f, [date, date]); // log is newest-first, so first seen = newest
    else cur[0] = date; // keep pushing oldest back
  }
}
const datesFor = (files) => {
  let pub = null, mod = null;
  for (const f of files) {
    const d = fileDates.get(f);
    const [p, m] = d ?? [now, now]; // not committed yet = new or edited now
    let dirty = false;
    if (git) { try { dirty = sh(`git status --porcelain -- "${f}"`) !== ''; } catch {} }
    const mm = dirty ? now : m;
    if (!pub || p < pub) pub = p;
    if (!mod || mm > mod) mod = mm;
  }
  return { published: pub, modified: mod };
};

const list = (dir) => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...list(rel));
    else out.push(rel);
  }
  return out;
};
const content = (c) => list(`src/content/${c}`).filter((f) => f.endsWith('.md'));
const stem = (f) => path.basename(f, '.md');

const map = {}; // url -> files
const add = (url, files) => { map[url] = [...(map[url] ?? []), ...files]; };

// Static pages.
for (const f of list('src/pages')) {
  if (!f.endsWith('.astro') || f.includes('[')) continue;
  let url = f.replace(/^src\/pages/, '').replace(/\.astro$/, '').replace(/\/index$/, '');
  url = url === '' ? '/' : `${url}/`;
  if (url === '/404/') continue;
  add(url, [f]);
}

// Detail pages from content.
const breweries = content('breweries');
const beers = content('beers');
for (const f of breweries) {
  const id = stem(f);
  add(`/breweries/${id}/`, [f, ...beers.filter((b) => b.includes(`/beers/${id}/`))]);
}
for (const f of beers) {
  const [br, slug] = f.replace('src/content/beers/', '').replace('.md', '').split('/');
  add(`/breweries/${br}/${slug}/`, [f]);
}
for (const f of content('neighborhoods')) add(`/neighborhoods/${stem(f)}/`, [f]);
for (const f of content('festivals')) add(`/festivals/${stem(f)}/`, [f]);
for (const f of content('news')) add(`/news/${stem(f)}/`, [f]);
for (const f of content('beyond')) add(`/beyond-beer/${stem(f)}/`, [f]);
for (const f of content('stories')) add(`/stories/${stem(f)}/`, [f]);
for (const f of content('authors')) if (stem(f) !== 'will-finney') add(`/authors/${stem(f)}/`, [f]);
add('/stories/', content('stories'));
add('/missions/', [...breweries, ...beers, ...content('festivals'), ...content('beyond')]);
add('/authors/', content('authors'));

// List pages change when their collection changes.
add('/breweries/', [...breweries, ...beers]);
add('/status/', breweries);
add('/map/', breweries);
add('/guides/downtown-brewery-crawl/', breweries);
add('/guides/breweries-near-fedexforum/', breweries);
add('/guides/breweries-near-beale-street/', breweries);
add('/guides/beer-styles/', beers);
add('/neighborhoods/', content('neighborhoods'));
add('/festivals/', content('festivals'));
add('/news/', content('news'));
add('/beyond-beer/', content('beyond'));
add('/beyond-beer/distilleries/', content('beyond'));
add('/beyond-beer/wineries/', content('beyond'));
add('/', [...breweries, ...content('news')]);

const result = {};
for (const [url, files] of Object.entries(map).sort()) {
  const fresh = datesFor([...new Set(files)]);
  // Without git, trust what was committed; only new URLs get today's date.
  result[url] = git ? fresh : (existing[url] ?? { published: now, modified: now });
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 1) + '\n');
// Thin-page rule: an unscored beer whose own write-up is under 30 words stays out of
// search (noindex + not in the sitemap) until Will scores it or the page gets more text.
const noindex = [];
for (const f of beers) {
  const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const parts = raw.split(/^---$/m);
  const fm = parts[1] ?? '';
  const body = parts.slice(2).join('---');
  const words = body.split(/\s+/).filter(Boolean).length;
  const scored = /^pourScore:\s*\d/m.test(fm);
  if (!scored && words < 30) {
    const [br, slug] = f.replace('src/content/beers/', '').replace('.md', '').split('/');
    noindex.push(`/breweries/${br}/${slug}/`);
  }
}
fs.writeFileSync(path.join(ROOT, 'src/data/noindex.json'), JSON.stringify(noindex.sort(), null, 1) + '\n');
console.log(`noindex: ${noindex.length} thin beer pages`);
console.log(`page-dates: ${Object.keys(result).length} URLs (${git ? 'from git' : 'kept committed dates'})`);
