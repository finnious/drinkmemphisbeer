// Site-wide schema.org graph. Every page gets WebSite, Organization, Will (Person),
// a WebPage of the right type with dates, and a BreadcrumbList. Page-specific
// entities (Brewery, Product, NewsArticle, ItemList...) are merged into the same @graph.

export type Crumb = { name: string; url: string };

const SITE = 'https://www.drinkmemphisbeer.com';
export const IDS = {
  website: `${SITE}/#website`,
  org: `${SITE}/#organization`,
  will: `${SITE}/about/#will`,
};

const SECTION_NAMES: Record<string, string> = {
  breweries: 'Breweries',
  guides: 'Guides',
  neighborhoods: 'Neighborhoods',
  festivals: 'Festivals',
  news: 'News',
  'beyond-beer': 'Beyond Beer',
  distilleries: 'Distilleries',
  wineries: 'Wineries',
};
const titleCase = (s: string) => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const website = {
  '@type': 'WebSite',
  '@id': IDS.website,
  url: `${SITE}/`,
  name: 'Drink Memphis Beer',
  description: 'Every Memphis-area brewery and beer, judged against the best tap water in America.',
  inLanguage: 'en-US',
  publisher: { '@id': IDS.org },
};

export const organization = {
  '@type': 'Organization',
  '@id': IDS.org,
  name: 'Drink Memphis Beer',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/images/logo-512.png`, width: 512, height: 512 },
  email: 'will@drinkmemphisbeer.com',
  sameAs: ['https://x.com/drinkmemphis'],
  founder: { '@id': IDS.will },
};

export const will = {
  '@type': 'Person',
  '@id': IDS.will,
  name: 'Will Finney',
  url: `${SITE}/about/`,
  image: `${SITE}/images/will/will-headshot-800.jpg`,
  jobTitle: 'Editor',
  worksFor: { '@id': IDS.org },
  sameAs: ['https://x.com/willfinneymem', 'https://www.linkedin.com/in/will-finney'],
};

export function breadcrumbs(path: string, title: string, crumbs?: Crumb[]) {
  let trail: Crumb[] = [{ name: 'Home', url: `${SITE}/` }];
  if (path !== '/') {
    if (crumbs) trail = trail.concat(crumbs.map((c) => ({ name: c.name, url: new URL(c.url, SITE).href })));
    else {
      const parts = path.split('/').filter(Boolean);
      parts.forEach((p, i) => {
        const url = `${SITE}/${parts.slice(0, i + 1).join('/')}/`;
        const last = i === parts.length - 1;
        trail.push({ name: last ? title : SECTION_NAMES[p] ?? titleCase(p), url });
      });
    }
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE}${path}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  };
}

const strip = (o: any) => {
  if (!o || typeof o !== 'object') return o;
  const { ['@context']: _c, ...rest } = o;
  return rest;
};

export function buildGraph(opts: {
  site: URL; path: string; title: string; description: string; pageType: string; image: string;
  published: string; modified: string; crumbs?: Crumb[]; extra?: object | object[];
}) {
  const url = new URL(opts.path, opts.site).href;
  const page: Record<string, unknown> = {
    '@type': opts.pageType,
    '@id': `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': IDS.website },
    publisher: { '@id': IDS.org },
    author: { '@id': IDS.will },
    datePublished: opts.published,
    dateModified: opts.modified,
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.image },
    breadcrumb: { '@id': `${url}#breadcrumb` },
  };
  if (opts.pageType === 'Article') {
    page.headline = opts.title;
    page.image = opts.image;
    page.mainEntityOfPage = url;
  }
  const extras = (Array.isArray(opts.extra) ? opts.extra : opts.extra ? [opts.extra] : []).map(strip);
  // Point the page at its main entity, if the page supplied one.
  const main = extras.find((e: any) => e && e['@id']);
  if (main) page.mainEntity = { '@id': (main as any)['@id'] };
  else if (opts.pageType === 'ProfilePage') page.mainEntity = { '@id': IDS.will };
  return {
    '@context': 'https://schema.org',
    '@graph': [website, organization, will, page, breadcrumbs(opts.path, opts.title, opts.crumbs), ...extras],
  };
}

/** "206 E. G.E. Patterson Ave, Memphis, TN 38103" -> PostalAddress. Falls back to streetAddress only. */
export function postalAddress(addr: string) {
  const m = addr.match(/^(.*),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?$/);
  if (!m) return { '@type': 'PostalAddress', streetAddress: addr, addressCountry: 'US' };
  return {
    '@type': 'PostalAddress',
    streetAddress: m[1].trim(),
    addressLocality: m[2].trim(),
    addressRegion: m[3],
    ...(m[4] ? { postalCode: m[4] } : {}),
    addressCountry: 'US',
  };
}
