# Drink Memphis Beer

drinkmemphisbeer.com: an independent guide to every Memphis brewery and beer, by Will Finney.

Built with [Astro](https://astro.build/), styled with [Tailwind CSS](https://tailwindcss.com/), hosted on [Cloudflare](https://cloudflare.com/) Pages.

## Run it

```
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # static site in dist/
```

## Cloudflare Pages settings

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22 (set `NODE_VERSION=22` if needed)

## Adding content

Everything lives in `src/content/` as Markdown with a short header block.

| To add | Create a file in | Example |
| --- | --- | --- |
| Brewery | `src/content/breweries/<slug>.md` | `ghost-river.md` |
| Beer | `src/content/beers/<brewery-slug>/<beer-slug>.md` | `wiseacre/tiny-bomb.md` |
| Neighborhood | `src/content/neighborhoods/<slug>.md` | `uptown.md` |
| Festival | `src/content/festivals/<slug>.md` | `cooper-young-beerfest.md` |
| News post | `src/content/news/<yyyy-mm-dd-slug>.md` | `2026-12-04-weekly-roundup.md` |

The fields each file needs are defined (and checked at build time) in `src/content.config.ts`.

## House rules

- **Pour Scores and "Will's Take" are Will's own words only.** Never fill `pourScore`, `tapWaterTest` or `willsTake` for him.
- Every status gets a `verified` month. Every fact gets a source in `sources`.
- AI images are labeled "Illustration" and never depict a real brewery's products or places.
- Never use brewery logos or label art without permission.

## Will's Pour Score sheet

Will's scores live in a Google Sheet, "Drink Memphis Beer — Will's Pour Scores"
(spreadsheet ID `1GW3KnsPewGeM7ipnzbTJN0MShcc40_dvxjjP03uI0yI`, tab `Pour Scores`).
Columns: Brewery, Beer, Style, ABV, Pour Score (0–5, 0 = Tap Water), Tap Water Test (passes/fails),
Will's take, Page (URL), Notes for Claude.

- Only Will fills in Pour Score, Tap Water Test and Will's take. Copy them to the matching beer's
  `pourScore`, `tapWaterTest` and `willsTake` exactly as written. Never invent or "fill in" a score.
- When you add a beer to the site, append a row to the sheet with the yellow columns left blank.
- Act on anything Will writes in "Notes for Claude", then clear the note.

## Dates and schema

- `npm run build` first runs `scripts/page-dates.mjs`, which reads git history and writes
  `src/data/page-dates.json` (published = first commit, last updated = latest commit, per URL;
  list pages use their collection's latest change). Commit that file with your changes.
- Every page shows "Published · Last updated" and emits one JSON-LD `@graph` (built in
  `src/lib/schema.ts`): WebSite, Organization, Will (Person), the page (WebPage/CollectionPage/
  Article/...) with datePublished/dateModified, and a BreadcrumbList, plus page entities.
- Beers only get `Product` markup once Will has scored them (Google requires a review).
- Festivals only get `Festival` (Event) markup once `startDate` is set in their front matter.
