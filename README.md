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
