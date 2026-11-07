// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://estebanandrade.com',
  trailingSlash: 'ignore',
  integrations: [vue(), sitemap({ filter: (page) => !page.includes('/admin') })],
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  image: {
    // Permite optimizar fotos alojadas en CDNs externos si más adelante se migra a Cloudinary/Sanity
    remotePatterns: [{ protocol: 'https' }],
  },
  vite: { plugins: [tailwindcss()] },
});
