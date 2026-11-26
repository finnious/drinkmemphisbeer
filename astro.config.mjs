import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';

// Last-edit dates per URL, generated from git by scripts/page-dates.mjs.
const pageDates = JSON.parse(fs.readFileSync(new URL('./src/data/page-dates.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: 'https://www.drinkmemphisbeer.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname;
        const d = pageDates[path];
        if (d) item.lastmod = new Date(d.modified).toISOString();
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
