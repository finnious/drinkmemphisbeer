# Will's cartoon scenes

`sticker-*.png` are cutouts of Will (real photos, white sticker border). `scenes.py` composes them with
cartoon props (sunburst, pint, crowned water glass, banners) and renders PNGs with headless Chrome via Playwright.

    python3 scenes.py   # writes scenes/*.png; export web sizes into public/images/will/

House rules: props stay cartoon. Never put a real brewery's can, logo or label in Will's hands.
