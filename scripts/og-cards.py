#!/usr/bin/env python3
"""Generate 1200x630 share cards into public/og/ for every brewery, beer, neighborhood,
festival, Beyond Beer listing, news post and main page.

    python3 scripts/og-cards.py          # only cards that are missing or out of date
    python3 scripts/og-cards.py --all    # rebuild everything

Needs Pillow and PyYAML (pip install pillow pyyaml). Base.astro uses /og/<path>.jpg
when the file exists and falls back to the default image otherwise.
"""
import hashlib, json, os, re, sys
import yaml
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og")
MANIFEST = os.path.join(OUT, "manifest.json")
FONTS = os.path.join(ROOT, "node_modules", "@fontsource")
BEBAS = os.path.join(FONTS, "bebas-neue/files/bebas-neue-latin-400-normal.woff")
MONO = os.path.join(FONTS, "ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff")
MONO4 = os.path.join(FONTS, "ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff")
STICKERS = os.path.join(ROOT, "design", "will")

MUD, GOLD, FOAM, BRICK, AQUIFER, OPEN = "#3b2416", "#f2b632", "#fbf6ec", "#b23a2e", "#1f4e79", "#2f6b3a"
W, H = 1200, 630


def font(path, size):
    return ImageFont.truetype(path, size)


def front(path):
    raw = open(path, encoding="utf-8").read()
    parts = raw.split("---")
    return yaml.safe_load(parts[1]) or {}


def short_brewery(name):
    m = re.search(r"\(([^)]+)\)", name)
    if m and not re.search(r"memphis|southaven", m.group(1), re.I):
        return m.group(1).strip()
    n = re.sub(r"\s*\(.*?\)\s*", " ", name)
    n = re.sub(r"\s+(Restaurant & )?(Brewing|Brew)( Co\.?| Company)?$", "", n.strip(), flags=re.I)
    n = re.sub(r"\s+(Pizza\s+)?&\s+Brewery$", "", n, flags=re.I)
    n = re.sub(r"\s+Brewery$", "", n, flags=re.I)
    n = re.sub(r"\s+& Brew Pub$", "", n, flags=re.I)
    return n.strip()


def fit_title(draw, text, max_w, max_lines, max_h=10_000, sizes=(150, 132, 116, 100, 88, 76, 66, 58)):
    """Largest Bebas size whose word-wrapped text fits max_w, max_lines and max_h."""
    words = text.upper().split()
    for size in sizes:
        f = font(BEBAS, size)
        lines, cur = [], ""
        for w in words:
            trial = (cur + " " + w).strip()
            if draw.textlength(trial, font=f) <= max_w:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        lines.append(cur)
        if len(lines) <= max_lines and len(lines) * int(size * 0.92) <= max_h and all(draw.textlength(l, font=f) <= max_w for l in lines):
            return f, lines
    f = font(BEBAS, sizes[-1])
    return f, lines[:max_lines]


def sunburst(img, cx, cy, r, color, rays=20):
    d = ImageDraw.Draw(img)
    import math
    for i in range(rays):
        a0 = 2 * math.pi * i / rays
        a1 = a0 + math.pi / rays
        d.polygon([(cx, cy), (cx + r * math.cos(a0), cy + r * math.sin(a0)), (cx + r * math.cos(a1), cy + r * math.sin(a1))], fill=color)


STICKER_CACHE = {}


def sticker(name, height):
    key = (name, height)
    if key not in STICKER_CACHE:
        im = Image.open(os.path.join(STICKERS, f"sticker-{name}.png")).convert("RGBA")
        ratio = height / im.height
        STICKER_CACHE[key] = im.resize((int(im.width * ratio), height), Image.LANCZOS)
    return STICKER_CACHE[key]


def card(out_path, kicker, title, sub="", badge=None, pose="crossed-smile"):
    img = Image.new("RGB", (W, H), FOAM)
    d = ImageDraw.Draw(img)
    # Right side: sunburst + Will sticker
    sunburst(img, 980, 300, 520, "#f6d27a")
    d.ellipse((790, 110, 1170, 490), fill=GOLD)
    st = sticker(pose, 520)
    img.paste(st, (980 - st.width // 2, H - 92 - st.height + 30), st)
    d = ImageDraw.Draw(img)
    # Left text block
    x, max_w = 64, 700
    d.text((x, 56), kicker.upper(), font=font(MONO, 26), fill=BRICK)
    reserved = (58 if sub else 0) + (70 if badge else 0)
    f, lines = fit_title(d, title, max_w, 3, max_h=(H - 92 - 24) - 100 - reserved)
    y = 100
    lh = int(f.size * 0.92)
    for ln in lines:
        d.text((x, y), ln, font=f, fill=MUD)
        y += lh
    if sub:
        y += 14
        d.text((x, y), sub.upper(), font=font(MONO4, 26), fill=MUD)
        y += 44
    if badge:
        text, color = badge
        bf = font(MONO, 24)
        tw = d.textlength(text, font=bf)
        y = max(y + 10, 0)
        d.rounded_rectangle((x, y, x + tw + 36, y + 50), radius=25, fill=color)
        d.text((x + 18, y + 11), text, font=bf, fill=FOAM if color != GOLD else MUD)
    # Bottom bar
    d.rectangle((0, H - 92, W, H), fill=MUD)
    d.text((x, H - 76), "DRINK MEMPHIS BEER", font=font(BEBAS, 64), fill=GOLD)
    url = "drinkmemphisbeer.com"
    uf = font(MONO, 24)
    d.text((W - 64 - d.textlength(url, font=uf), H - 58), url, font=uf, fill=FOAM)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "JPEG", quality=84, optimize=True, progressive=True)


def out_for(url):
    return os.path.join(OUT, "home.jpg" if url == "/" else url.strip("/") + ".jpg")


def collect():
    C = os.path.join(ROOT, "src", "content")
    jobs = []  # (url, kwargs)
    hoods = {f[:-3]: front(os.path.join(C, "neighborhoods", f)) for f in os.listdir(os.path.join(C, "neighborhoods"))}
    breweries = {f[:-3]: front(os.path.join(C, "breweries", f)) for f in os.listdir(os.path.join(C, "breweries"))}
    status_word = {"open": ("OPEN", OPEN), "closed": ("CLOSED", BRICK), "changed-hands": ("CHANGED HANDS", GOLD),
                   "no-taproom": ("NO TAPROOM", AQUIFER), "unverified": ("UNCONFIRMED", "#8a7f74")}
    for bid, b in breweries.items():
        hood = hoods.get(b.get("neighborhood") or "", {}).get("name") or b.get("town") or "Memphis"
        n_beers = len(os.listdir(os.path.join(C, "beers", bid))) if os.path.isdir(os.path.join(C, "beers", bid)) else 0
        sub = f"{hood}" + (f" · {n_beers} beers" if n_beers else "") + (f" · since {b['founded']}" if b.get("founded") else "")
        jobs.append((f"/breweries/{bid}/", dict(kicker="Brewery guide", title=b["name"], sub=sub, badge=status_word.get(b.get("status")), pose="pointing")))
    for bid in sorted(os.listdir(os.path.join(C, "beers"))):
        for f in sorted(os.listdir(os.path.join(C, "beers", bid))):
            be = front(os.path.join(C, "beers", bid, f))
            sub = " · ".join(x for x in [f"{be['abv']}%" if be.get("abv") is not None else "", be.get("style", "")] if x)
            badge = None
            if be.get("pourScore") is not None:
                s = be["pourScore"]
                verdict = {"passes": "PASSES THE TAP WATER TEST", "fails": "I'LL HAVE THE TAP WATER"}.get(be.get("tapWaterTest"), "")
                badge = (f"POUR SCORE {'TAP WATER' if s == 0 else f'{s}/5'}" + (f" · {verdict}" if verdict else ""), OPEN if be.get("tapWaterTest") == "passes" else BRICK)
            pose = "crossed-smile" if be.get("tapWaterTest") != "fails" else "crossed-serious"
            jobs.append((f"/breweries/{bid}/{f[:-3]}/", dict(kicker=short_brewery(breweries[bid]["name"]), title=be["name"], sub=sub, badge=badge, pose=pose)))
    for hid, h in hoods.items():
        n = sum(1 for b in breweries.values() if b.get("neighborhood") == hid or hid in (b.get("alsoIn") or []))
        jobs.append((f"/neighborhoods/{hid}/", dict(kicker="Neighborhood", title=f"Breweries in {h['name']}", sub=f"{n} {'brewery' if n == 1 else 'breweries'}", pose="standing-smile")))
    for f in os.listdir(os.path.join(C, "festivals")):
        fe = front(os.path.join(C, "festivals", f))
        jobs.append((f"/festivals/{f[:-3]}/", dict(kicker="Festival", title=fe["name"], sub=f"{fe.get('when','')} · {fe.get('where','')}", pose="standing-smile")))
    for f in os.listdir(os.path.join(C, "beyond")):
        be = front(os.path.join(C, "beyond", f))
        jobs.append((f"/beyond-beer/{f[:-3]}/", dict(kicker=f"Beyond beer · {be.get('kind','')}", title=be["name"], sub=be.get("town") or "Memphis", pose="seated-steeple")))
    for f in os.listdir(os.path.join(C, "news")):
        ne = front(os.path.join(C, "news", f))
        jobs.append((f"/news/{f[:-3]}/", dict(kicker="Memphis beer news", title=ne["title"], sub=str(ne.get("date", ""))[:10], pose="pointing")))
    pages = [
        ("/", "Memphis beer guide", "Every brewery. Every beer. Judged against the tap water.", "", "crossed-smile"),
        ("/breweries/", "Directory", "Memphis Breweries", f"{len(breweries)} breweries", "pointing"),
        ("/status/", "Updated weekly", "Brewery Status Board", "Who's open, who's closed", "crossed-serious"),
        ("/map/", "Map", "Memphis Brewery Map", "Every taproom, one map", "pointing"),
        ("/guides/", "Guides", "Memphis Beer Guides", "Crawls, maps and where to drink", "standing-smile"),
        ("/guides/downtown-brewery-crawl/", "Guide", "Downtown Brewery Crawl", "Six taprooms · one walk", "pointing"),
        ("/guides/breweries-near-fedexforum/", "Guide", "Breweries Near FedExForum", "Before the Grizzlies game", "pointing"),
        ("/guides/breweries-near-beale-street/", "Guide", "Breweries Near Beale Street", "Local beer within a walk", "pointing"),
        ("/guides/where-to-buy-memphis-beer/", "Guide", "Where to Buy Memphis Beer", "Beer bars & bottle shops", "standing-smile"),
        ("/guides/beer-styles/", "Guide", "Beer Styles, Explained", "With a Memphis beer for each", "seated-steeple"),
        ("/history/", "History", "A Short History of Memphis Beer", "Goldcrest 51 to the 2013 boom", "seated-steeple"),
        ("/water/", "The water", "Memphis Tap Water", "The Memphis Sand Aquifer head start", "crossed-smile"),
        ("/neighborhoods/", "Neighborhoods", "Memphis Beer by Neighborhood", "", "standing-smile"),
        ("/festivals/", "Festivals", "Memphis Beer Festivals", "", "standing-smile"),
        ("/news/", "News", "Memphis Beer News", "Every Thursday", "pointing"),
        ("/beyond-beer/", "Beyond beer", "Memphis Distilleries & Wineries", "", "seated-steeple"),
        ("/about/", "About", "Will Finney", "Editor, Drink Memphis Beer", "crossed-smile"),
        ("/spotted/", "Spotted", "Memphis Beer in the Wild", "Send us your sightings", "pointing"),
        ("/merch/", "Merch", "I'll Have the Tap Water", "Shirts, koozies & stickers", "crossed-smile"),
    ]
    for url, k, t, s, pose in pages:
        jobs.append((url, dict(kicker=k, title=t, sub=s, pose=pose)))
    return jobs


def main():
    rebuild = "--all" in sys.argv
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) and not rebuild else {}
    script_hash = hashlib.sha1(open(__file__, "rb").read()).hexdigest()[:10]
    made = 0
    jobs = collect()
    new_manifest = {}
    for url, kw in jobs:
        h = hashlib.sha1((script_hash + json.dumps(kw, sort_keys=True, default=str)).encode()).hexdigest()[:12]
        new_manifest[url] = h
        path = out_for(url)
        if manifest.get(url) == h and os.path.exists(path):
            continue
        card(path, **kw)
        made += 1
    json.dump(new_manifest, open(MANIFEST, "w"), indent=1, sort_keys=True)
    print(f"og-cards: {made} generated, {len(jobs)} total")


if __name__ == "__main__":
    main()
