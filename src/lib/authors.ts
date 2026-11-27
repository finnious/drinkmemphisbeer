import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { IDS } from './schema';

const SITE = 'https://www.drinkmemphisbeer.com';
export const FOUNDER = 'will-finney';

export type Author = CollectionEntry<'authors'>;

/** Will's profile lives at /about/; everyone else at /authors/<slug>/. */
export const authorUrl = (slug: string) => (slug === FOUNDER ? '/about/' : `/authors/${slug}/`);
export const authorId = (slug: string) => (slug === FOUNDER ? IDS.will : `${SITE}/authors/${slug}/#person`);

export async function getAuthors() {
  return (await getCollection('authors')).sort(
    (a, b) => Number(b.data.editor) - Number(a.data.editor) || a.data.joined.getTime() - b.data.joined.getTime(),
  );
}

export async function getAuthor(slug: string) {
  return getEntry('authors', slug);
}

/** schema.org Person for an author. Will's node is already in every page's graph. */
export function personNode(a: Author) {
  const d = a.data;
  const sameAs = [
    d.links.x && `https://x.com/${d.links.x.replace(/^@/, '')}`,
    d.links.instagram && `https://www.instagram.com/${d.links.instagram.replace(/^@/, '')}/`,
    d.links.linkedin,
    d.links.website,
  ].filter(Boolean);
  return {
    '@type': 'Person',
    '@id': authorId(a.id),
    name: d.name,
    url: new URL(authorUrl(a.id), SITE).href,
    description: d.bio,
    jobTitle: d.role,
    ...(d.avatar ? { image: new URL(d.avatar, SITE).href } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { '@id': IDS.org },
  };
}

export async function getStories() {
  return (await getCollection('stories', (s) => import.meta.env.DEV || !s.data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
