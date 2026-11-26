import { getBreweries } from './data';

export type Pin = {
  slug: string;
  name: string;
  label: string;
  address: string;
  status: string;
  lat: number;
  lng: number;
  url: string;
};

export const LANDMARKS = {
  fedexforum: { name: 'FedExForum', lat: 35.13823, lng: -90.05077 },
  beale: { name: 'Beale Street (Handy Park)', lat: 35.13998, lng: -90.05137 },
};

export async function getPins(opts: { includeClosed?: boolean } = {}): Promise<Pin[]> {
  const breweries = await getBreweries();
  const pins: Pin[] = [];
  for (const b of breweries) {
    if (!opts.includeClosed && b.data.status === 'closed') continue;
    for (const loc of b.data.locations) {
      if (loc.lat == null || loc.lng == null) continue;
      pins.push({
        slug: b.id,
        name: b.data.name,
        label: loc.label,
        address: loc.address,
        status: b.data.status,
        lat: loc.lat,
        lng: loc.lng,
        url: `/breweries/${b.id}/`,
      });
    }
  }
  return pins;
}

/** Straight-line distance in miles. */
export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough walking minutes: straight line x 1.3 for the street grid, at 20 minutes a mile. */
export function walkMinutes(mi: number) {
  return Math.max(1, Math.round(mi * 1.3 * 20));
}

export async function nearby(point: { lat: number; lng: number }, maxMiles: number) {
  const pins = (await getPins()).filter((p) => p.status === 'open');
  return pins
    .map((p) => ({ ...p, mi: miles(point, p) }))
    .filter((p) => p.mi <= maxMiles)
    .sort((a, b) => a.mi - b.mi);
}
