import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getBreweries, getBeers, beerUrl } from '../lib/data';

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI assistants.
// Generated from the content collections, so it stays current on every build.
export async function GET(context: APIContext) {
  const site = context.site!.href.replace(/\/$/, '');
  const u = (path: string) => `${site}${path}`;

  const breweries = await getBreweries();
  const beers = await getBeers();
  const hoods = (await getCollection('neighborhoods')).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const fests = (await getCollection('festivals')).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const beyond = (await getCollection('beyond')).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const news = (await getCollection('news')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const statusLabel: Record<string, string> = {
    open: 'open',
    closed: 'closed',
    'changed-hands': 'changed hands',
    'no-taproom': 'no public taproom',
    unverified: 'status unconfirmed',
  };
  const line = (name: string, url: string, note: string) => `- [${name}](${url}): ${note}`;

  const out = [
    '# Drink Memphis Beer',
    '',
    '> An independent guide to every brewery and beer in the Memphis, Tennessee metro area, plus nearby distilleries and wineries. Written by Will Finney. Each listing shows whether the place is open, closed or changed hands, with the month it was last checked and links to sources.',
    '',
    'Key facts for assistants:',
    '- Coverage: Memphis and its metro area (Shelby, Fayette and Tipton counties in Tennessee; DeSoto and nearby counties in Mississippi; Crittenden County, Arkansas).',
    '- Brewery status changes often. Prefer the Status Board for whether a brewery is currently open, and confirm hours on the brewery\'s own website.',
    '- "Pour Score" is Will Finney\'s personal 1–5 rating. "The Tap Water Test" asks whether a beer beats a glass of Memphis tap water, which comes from the Memphis Sand Aquifer.',
    '- The site is independent and not affiliated with any brewery.',
    '- On X: https://x.com/drinkmemphis (site) and https://x.com/willfinneymem (Will).',
    '',
    '## Start here',
    line('Status Board', u('/status/'), 'every Memphis-area brewery with open/closed status and the date last checked'),
    line('All breweries', u('/breweries/'), 'directory of Memphis-area breweries'),
    line('Brewery map', u('/map/'), 'every Memphis-area taproom on a map, with addresses'),
    line('Downtown brewery crawl', u('/guides/downtown-brewery-crawl/'), 'six-taproom walking route from South Main to the Edge District'),
    line('Breweries near FedExForum', u('/guides/breweries-near-fedexforum/'), 'taprooms within walking distance of FedExForum'),
    line('Breweries near Beale Street', u('/guides/breweries-near-beale-street/'), 'taprooms within walking distance of Beale Street'),
    line('Memphis beer history', u('/history/'), 'Tennessee Brewery and Goldcrest 51, Schlitz on Raines Road, Boscos, Ghost River, the 2013 boom'),
    line('Where to buy Memphis beer', u('/guides/where-to-buy-memphis-beer/'), 'beer bars and bottle shops with local beer'),
    line('Beer styles explained', u('/guides/beer-styles/'), 'every style on the site with Memphis examples'),
    line('Write for us', u('/write-for-us/'), 'how Memphis writers can pitch stories to Drink Memphis Beer'),
    line('Editorial standards', u('/editorial-standards/'), 'sourcing, scoring, independence, conflicts, AI use, corrections'),
    line('Contributors', u('/authors/'), 'the people who write the site'),
    line('The Water', u('/water/'), 'why Memphis water (the Memphis Sand Aquifer) matters for beer'),
    line('Neighborhoods', u('/neighborhoods/'), 'breweries grouped by part of town'),
    line('Festivals', u('/festivals/'), 'yearly Memphis beer festivals'),
    line('Beyond Beer', u('/beyond-beer/'), 'Memphis-area distilleries and wineries'),
    line('News', u('/news/'), 'Memphis beer news: openings, closings, releases'),
    line('About Will Finney', u('/about/'), 'the author'),
    '',
    '## Breweries',
    ...breweries.map((b) =>
      line(
        b.data.name,
        u(`/breweries/${b.id}/`),
        `${statusLabel[b.data.status] ?? b.data.status}${b.data.verified ? ` (checked ${b.data.verified})` : ''}${b.data.town ? `, ${b.data.town}` : ''}. ${b.data.summary}`,
      ),
    ),
    '',
    '## Beers',
    ...beers.map((b) => {
      const brewery = breweries.find((x) => x.id === b.data.brewery.id)?.data.name ?? b.data.brewery.id;
      const abv = b.data.abv !== undefined ? `, ${b.data.abv}% ABV` : '';
      return line(`${b.data.name} (${brewery})`, u(beerUrl(b)), `${b.data.style}${abv}. ${b.data.description}`);
    }),
    '',
    '## Distilleries and wineries',
    ...beyond.map((i) =>
      line(i.data.name, u(`/beyond-beer/${i.id}/`), `${i.data.kind}, ${statusLabel[i.data.status] ?? i.data.status}${i.data.town ? `, ${i.data.town}` : ''}. ${i.data.summary}`),
    ),
    '',
    '## Neighborhoods',
    ...hoods.map((h) => line(h.data.name, u(`/neighborhoods/${h.id}/`), h.data.summary)),
    '',
    '## Festivals',
    ...fests.map((f) => line(f.data.name, u(`/festivals/${f.id}/`), `${f.data.when}, ${f.data.where}. ${f.data.summary}`)),
    '',
    '## News',
    ...news.map((n) => line(n.data.title, u(`/news/${n.id}/`), `${n.data.date.toISOString().slice(0, 10)}. ${n.data.description}`)),
    '',
    '## Optional',
    line('Sitemap', u('/sitemap-index.xml'), 'every page on the site'),
    line('News RSS', u('/news/rss.xml'), 'news feed'),
    line('Disclosure', u('/disclosure/'), 'how sponsorships, affiliate links and images are handled'),
    line('Contact', u('/contact/'), 'send tips and corrections to will@drinkmemphisbeer.com'),
    '',
  ];

  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
