import { getCollection, type CollectionEntry } from 'astro:content';

export type Brewery = CollectionEntry<'breweries'>;
export type Beer = CollectionEntry<'beers'>;

const statusRank: Record<string, number> = {
  open: 0,
  'no-taproom': 1,
  unverified: 2,
  'changed-hands': 3,
  closed: 4,
};

export async function getBreweries() {
  const all = await getCollection('breweries');
  return all.sort(
    (a, b) =>
      (statusRank[a.data.status] ?? 9) - (statusRank[b.data.status] ?? 9) ||
      a.data.name.localeCompare(b.data.name),
  );
}

export async function getBeers() {
  const all = await getCollection('beers');
  return all.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export function beerSlug(beer: Beer) {
  return beer.id.split('/').pop()!;
}

export function beerUrl(beer: Beer) {
  return `/breweries/${beer.data.brewery.id}/${beerSlug(beer)}/`;
}

export function breweryUrl(id: string) {
  return `/breweries/${id}/`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export const CONTACT_EMAIL = 'will@drinkmemphisbeer.com';
