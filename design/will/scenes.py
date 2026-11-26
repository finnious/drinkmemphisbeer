"""Comic cutout scenes of Will for drinkmemphisbeer.com, rendered with headless Chrome."""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.abspath(os.path.dirname(__file__))
NM = '/home/claude/drinkmemphisbeer/node_modules/@fontsource'
OUT = os.path.join(HERE, 'scenes'); os.makedirs(OUT, exist_ok=True)

MUD, GOLD, GOLD2, FOAM, BRICK, AQ = '#3B2416', '#F2B632', '#F7C75A', '#FBF6EC', '#B23A2E', '#1F4E79'

CSS = f"""
@font-face {{ font-family: Bebas; src: url('file://{NM}/bebas-neue/files/bebas-neue-latin-400-normal.woff2'); }}
@font-face {{ font-family: Plex; src: url('file://{NM}/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2'); }}
html,body {{ margin:0; padding:0; background: transparent; }}
.scene {{ position: relative; overflow: hidden; }}
.layer {{ position: absolute; }}
.sticker {{ filter: drop-shadow(9px 11px 0 rgba(59,36,22,.55)); }}
.banner {{ position:absolute; background:{MUD}; color:{GOLD}; font-family:Bebas; letter-spacing:2px; padding: 6px 34px 2px; white-space: nowrap; }}
.banner:before, .banner:after {{ content:''; position:absolute; top:0; bottom:0; width:0; border-style:solid; }}
.banner:before {{ left:-30px; border-width: 0.66em 30px 0.66em 0; border-color: transparent #2a190f transparent transparent; }}
.banner:after {{ right:-30px; border-width: 0.66em 0 0.66em 30px; border-color: transparent transparent transparent #2a190f; }}
.mono {{ font-family: Plex; color:{MUD}; }}
.disp {{ font-family: Bebas; color:{MUD}; line-height:.88; }}
"""


def rays(w, h, cx, cy, c1=GOLD, c2=GOLD2, n=28):
    import math
    R = max(w, h) * 2
    paths = []
    for i in range(0, n, 2):
        a0, a1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        paths.append(f'<path d="M{cx} {cy} L{cx+R*math.cos(a0):.0f} {cy+R*math.sin(a0):.0f} L{cx+R*math.cos(a1):.0f} {cy+R*math.sin(a1):.0f}Z" fill="{c2}"/>')
    return f'''<svg class="layer" style="inset:0" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
      <defs><pattern id="d" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="{MUD}" opacity=".13"/></pattern></defs>
      <rect width="{w}" height="{h}" fill="{c1}"/>{''.join(paths)}<rect width="{w}" height="{h}" fill="url(#d)"/></svg>'''


def water_glass(face='smug', crown=True):
    """Cartoon glass of Memphis tap water. viewBox 0 0 220 320."""
    faces = {
        'smug': f'<path d="M62 160 q12 -10 24 0" fill="none" stroke="{MUD}" stroke-width="6" stroke-linecap="round"/><path d="M118 160 q12 -10 24 0" fill="none" stroke="{MUD}" stroke-width="6" stroke-linecap="round"/><path d="M75 200 q30 14 52 -8" fill="none" stroke="{MUD}" stroke-width="7" stroke-linecap="round"/>',
        'happy': f'<circle cx="78" cy="160" r="9" fill="{MUD}"/><circle cx="132" cy="160" r="9" fill="{MUD}"/><path d="M70 192 q35 30 70 0" fill="none" stroke="{MUD}" stroke-width="8" stroke-linecap="round"/>',
    }
    c = f'<path d="M32 50 l12 -44 l24 26 l22 -36 l22 36 l24 -26 l12 44 z" fill="{GOLD}" stroke="{MUD}" stroke-width="7" stroke-linejoin="round" transform="rotate(10 110 30)"/>' if crown else ''
    return f'''<svg viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs><clipPath id="wc"><path d="M20 60 h180 l-22 240 a16 16 0 0 1 -16 14 h-104 a16 16 0 0 1 -16 -14 z"/></clipPath></defs>
      <path d="M20 60 h180 l-22 240 a16 16 0 0 1 -16 14 h-104 a16 16 0 0 1 -16 -14 z" fill="#eef8ff"/>
      <g clip-path="url(#wc)"><path d="M0 110 q27 -14 55 0 t55 0 t55 0 t55 0 v240 h-220z" fill="#7cc4f2"/>
        <rect x="45" y="120" width="16" height="170" fill="#fff" opacity=".5"/><circle cx="150" cy="260" r="5" fill="#fff" opacity=".8"/><circle cx="165" cy="215" r="4" fill="#fff" opacity=".8"/></g>
      <path d="M20 60 h180 l-22 240 a16 16 0 0 1 -16 14 h-104 a16 16 0 0 1 -16 -14 z" fill="none" stroke="{MUD}" stroke-width="9" stroke-linejoin="round"/>
      {faces[face]}{c}</svg>'''


def pint(face='nervous', empty=False):
    """Cartoon pint. viewBox 0 0 240 360."""
    fill = '' if empty else f'''<g clip-path="url(#pc)"><rect x="0" y="40" width="240" height="330" fill="#F5A623"/>
        <rect x="40" y="80" width="22" height="240" fill="{FOAM}" opacity=".35"/><circle cx="150" cy="260" r="7" fill="{FOAM}" opacity=".6"/><circle cx="170" cy="200" r="5" fill="{FOAM}" opacity=".6"/></g>
      <path d="M8 44 c0 -46 38 -56 58 -42 c10 -38 66 -38 76 -4 c20 -24 66 -14 66 24 c20 0 28 18 18 36 c-28 -10 -48 14 -76 0 s-58 14 -86 0 s-48 14 -56 -14 z" fill="{FOAM}" stroke="{MUD}" stroke-width="8" stroke-linejoin="round"/>'''
    faces = {
        'nervous': f'<circle cx="85" cy="150" r="24" fill="#fff" stroke="{MUD}" stroke-width="6"/><circle cx="91" cy="155" r="10" fill="{MUD}"/><circle cx="155" cy="150" r="24" fill="#fff" stroke="{MUD}" stroke-width="6"/><circle cx="149" cy="156" r="10" fill="{MUD}"/><path d="M88 215 q32 26 64 0" fill="none" stroke="{MUD}" stroke-width="8" stroke-linecap="round"/><path d="M205 95 q11 20 0 28 q-11 -8 0 -28z" fill="#9fd3ff" stroke="{MUD}" stroke-width="4"/>',
        'sad': f'<path d="M66 150 q18 14 36 0" fill="none" stroke="{MUD}" stroke-width="7" stroke-linecap="round"/><path d="M138 150 q18 14 36 0" fill="none" stroke="{MUD}" stroke-width="7" stroke-linecap="round"/><path d="M90 230 q30 -24 60 0" fill="none" stroke="{MUD}" stroke-width="8" stroke-linecap="round"/><path d="M80 170 q-6 18 0 26 q8 -6 0 -26z" fill="#9fd3ff" stroke="{MUD}" stroke-width="3"/>',
    }
    return f'''<svg viewBox="0 0 240 380" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs><clipPath id="pc"><path d="M12 44 h216 l-28 300 a18 18 0 0 1 -18 16 h-124 a18 18 0 0 1 -18 -16 z"/></clipPath></defs>
      <path d="M12 44 h216 l-28 300 a18 18 0 0 1 -18 16 h-124 a18 18 0 0 1 -18 -16 z" fill="{'#fff7e6' if empty else '#E09A1E'}"/>
      {fill}
      <path d="M12 44 h216 l-28 300 a18 18 0 0 1 -18 16 h-124 a18 18 0 0 1 -18 -16 z" fill="none" stroke="{MUD}" stroke-width="9" stroke-linejoin="round"/>
      {faces[face]}</svg>'''


def img(name):
    return f'file://{HERE}/sticker-{name}.png'


SCENES = {}

# 1) Social share image (1200x630)
SCENES['og-default'] = (1200, 630, f'''
{rays(1200, 630, 900, 300)}
<div class="layer disp" style="left:60px; top:70px; font-size:56px; letter-spacing:14px">DRINK</div>
<div class="layer disp" style="left:56px; top:118px; font-size:170px">MEMPHIS<br>BEER</div>
<div class="layer mono" style="left:62px; top:452px; font-size:27px; width:560px; line-height:1.35">Every Memphis brewery. Every beer.<br>One honest opinion.</div>
<div class="layer mono" style="left:62px; top:552px; font-size:22px; background:{MUD}; color:{GOLD}; padding:8px 16px">drinkmemphisbeer.com</div>
<img class="layer sticker" src="{img('crossed-smile')}" style="right:40px; top:40px; height:640px; transform:rotate(3deg)">
''')

# 2) Water page hero (1200x700): Will points at a giant crowned water glass he's holding
SCENES['water-hero'] = (1200, 700, f'''
{rays(1200, 700, 760, 380, '#9fd3ff', '#bfe3ff')}
<div class="banner" style="left:70px; top:52px; font-size:84px; transform:rotate(-4deg)">THE HEAD START</div>
<div class="layer mono" style="left:72px; top:210px; font-size:30px; width:470px; line-height:1.35">Memphis tap water: filtered through sand for 2,000 years before it ever hits a mash tun.</div>
<div class="layer mono" style="left:72px; top:420px; font-size:24px; background:{MUD}; color:{FOAM}; padding:10px 18px; line-height:1.4">Every beer has to<br>beat this glass.</div>
<div class="layer" style="right:150px; top:50px; height:740px; width:{740*1059/1367:.0f}px; transform:rotate(-2deg)">
  <img class="sticker" src="{img('pointing')}" style="height:100%; display:block">
  <div class="layer" style="left:55%; top:40%; width:42%; transform:rotate(8deg)">{water_glass('smug')}</div>
</div>
''')

# 3) 404 (1000x640): Will next to a sad, empty pint
SCENES['will-404'] = (1000, 640, f'''
{rays(1000, 640, 300, 360)}
<div class="layer" style="left:90px; top:200px; width:230px; transform:rotate(-8deg)">{pint('sad', empty=True)}</div>
<div class="layer mono" style="left:330px; top:60px; font-size:28px; background:#fff; border:5px solid {MUD}; border-radius:20px; padding:16px 22px; width:300px; line-height:1.3">This page? Never brewed it.</div>
<img class="layer sticker" src="{img('standing-smile')}" style="right:60px; top:50px; height:640px">
''')

# 4) Verdict badges (square, transparent outside the circle)
for key, pose, label, glass in [
    ('verdict-pass', 'crossed-smile', 'PASSES THE<br>TAP WATER TEST', pint('nervous').replace('nervous', 'nervous')),
    ('verdict-fail', 'crossed-serious', "I'LL HAVE THE<br>TAP WATER", water_glass('happy', crown=True)),
]:
    ring = GOLD if key == 'verdict-pass' else '#9fd3ff'
    SCENES[key] = (600, 600, f'''
<div class="layer" style="inset:0; border-radius:50%; overflow:hidden; border:10px solid {MUD}; box-sizing:border-box; background:{ring}">
  {rays(600, 600, 300, 300, ring, '#ffffff55')}
  <img class="layer sticker" src="{img(pose)}" style="left:150px; top:40px; height:600px">
  <div class="layer" style="left:40px; top:250px; width:120px; transform:rotate(-10deg)">{glass}</div>
</div>
<div class="banner" style="left:50%; transform:translateX(-50%) rotate(-3deg); bottom:20px; font-size:44px; text-align:center; line-height:.95; padding:10px 26px 6px">{label}</div>
''')

# 5) News header (1200x480): Will scheming
SCENES['news-header'] = (1200, 480, f'''
{rays(1200, 480, 900, 260, AQ, '#2a5f90')}
<div class="layer disp" style="left:60px; top:60px; font-size:120px; color:{GOLD}">THIS WEEK IN<br>MEMPHIS BEER</div>
<div class="layer mono" style="left:64px; top:300px; font-size:28px; color:{FOAM}; width:560px; line-height:1.35">Openings, closings, new releases, and whatever Will has been plotting.</div>
<img class="layer sticker" src="{img('seated-steeple')}" style="right:60px; top:30px; height:560px">
<div class="layer" style="right:420px; top:40px; width:90px; transform:rotate(-14deg)">{pint('nervous')}</div>
''')


def render():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for name, (w, h, body) in SCENES.items():
            html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="s" class="scene" style="width:{w}px;height:{h}px">{body}</div></body></html>'
            path = os.path.join(OUT, f'{name}.html'); open(path, 'w').write(html)
            pg = b.new_page(viewport={'width': w, 'height': h})
            pg.goto('file://' + path); pg.wait_for_timeout(600)
            pg.locator('#s').screenshot(path=os.path.join(OUT, f'{name}.png'), omit_background=True)
            pg.close(); print('rendered', name)
        b.close()


if __name__ == '__main__':
    render()
