// Families, checked in order. First match wins.
export const FAMILIES: { key: string; name: string; match: RegExp; blurb: string; tapWater: string }[] = [
  { key: 'light-lager', name: 'Pilsners & light lagers', match: /pils|helles|light|pale lager|rice lager|mexican lager|american lager|premium lager|^lager$|festbier|kölsch/i,
    blurb: 'Crisp, clean and pale. Lagers ferment cold and slow, so there\'s nowhere for flaws to hide, and the water matters more here than in any other style. Soft Memphis water is a natural fit for pilsners and helles.',
    tapWater: 'The toughest test on the board. These beers are competing directly with the glass of water next to them.' },
  { key: 'dark-lager', name: 'Amber & dark lagers', match: /amber lager|dark lager|schwarz|märzen|marzen|bock|rauch|smoked/i,
    blurb: 'Lagers with more malt: toasty, caramel or roasty, but still clean and smooth because of the cold fermentation. Includes Oktoberfest märzens, smoked rauchbiers and strong doppelbocks.',
    tapWater: 'These win on flavor. Water can\'t do toast.' },
  { key: 'hazy', name: 'Hazy & New England IPAs', match: /hazy|new england/i,
    blurb: 'Soft, juicy and cloudy. Brewers add most of the hops late, so you get tropical fruit and citrus without much bitterness. Oats and wheat give them a pillowy body.',
    tapWater: 'Usually passes. Memphis drinkers love these.' },
  { key: 'ipa', name: 'IPAs & pale ales', match: /ipa|pale ale|bitter/i,
    blurb: 'Hop-forward beers. West Coast and American IPAs are clear, dry and bitter, with pine and grapefruit. Pale ales are the lighter, more balanced cousins. English bitters are lighter still.',
    tapWater: 'Depends how much you like bitterness.' },
  { key: 'wheat', name: 'Wheat beers & witbiers', match: /wheat|wit|hefe|weizen/i,
    blurb: 'Made with a big share of wheat for a soft, hazy body. German hefeweizens taste of banana and clove from the yeast. Belgian witbiers add orange peel and coriander. American wheats are cleaner and often fruited.',
    tapWater: 'The summer pick. Strong contenders on a July afternoon.' },
  { key: 'blonde', name: 'Blonde, golden & cream ales', match: /blonde|golden|cream ale/i,
    blurb: 'Easygoing ales: light malt, low bitterness, nothing to argue about. Often the brewery\'s gateway beer.',
    tapWater: 'Close calls. These are the closest thing to water that still counts as beer.' },
  { key: 'amber', name: 'Ambers, reds, browns & Scottish ales', match: /amber|red|brown|scottish|scotch/i,
    blurb: 'Malt-forward ales with caramel, toffee, nutty or toasty flavors. Scottish and Scotch ales lean even sweeter and maltier, and a Scotch ale can get strong.',
    tapWater: 'Good food beers. Barbecue helps them pass.' },
  { key: 'dark', name: 'Stouts & porters', match: /stout|porter/i,
    blurb: 'Dark beers made with roasted malts: coffee, chocolate and caramel. Oatmeal stouts are silky, milk stouts are sweet, and porters are usually a bit lighter than stouts.',
    tapWater: 'Different job entirely. Nobody\'s comparing a coffee stout to water.' },
  { key: 'sour', name: 'Sours & fruit beers', match: /sour|fruit|shandy|rosé|rose/i,
    blurb: 'Tart, fruity and often brightly colored. Most are fruited, and Memphis breweries tend to rotate them often.',
    tapWater: 'Wildly variable. Some are better than water, some make you want water.' },
  { key: 'strong', name: 'Big beers: double IPAs, barleywines & malt liquor', match: /double|imperial|barleywine|malt liquor/i,
    blurb: 'Anything that gets strong. Double IPAs, barrel-aged barleywines and the occasional craft malt liquor. Share them.',
    tapWater: 'Drink a glass of water between these regardless.' },
];

export function familyOf(style: string) {
  // Strong beers first if explicitly double/imperial/barleywine, so a "Hazy Double IPA" lands there.
  if (/double|imperial|barleywine|malt liquor/i.test(style)) return 'strong';
  if (/blonde|golden|cream ale/i.test(style)) return 'blonde';
  for (const f of FAMILIES) if (f.match.test(style)) return f.key;
  return 'other';
}

export function familyFor(style: string) {
  const k = familyOf(style);
  return FAMILIES.find((f) => f.key === k);
}

/** "Memphis Filling Station (MFS Brewing)" -> "MFS Brewing"; "Crosstown Brewing Co." -> "Crosstown". */
export function shortBrewery(name: string) {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren && !/memphis|southaven/i.test(paren[1])) return paren[1].trim();
  return name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+(Restaurant & )?(Brewing|Brew)( Co\.?| Company)?$/i, '')
    .replace(/\s+(Pizza\s+)?&\s+Brewery$/i, '')
    .replace(/\s+Brewery$/i, '')
    .replace(/\s+& Brew Pub$/i, '')
    .trim();
}
