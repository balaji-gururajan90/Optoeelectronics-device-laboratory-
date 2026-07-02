import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        research: resolve(__dirname, 'research.html'),
        publications: resolve(__dirname, 'publications.html'),
        lab: resolve(__dirname, 'lab.html'),
        team: resolve(__dirname, 'team.html'),
        projects: resolve(__dirname, 'projects.html'),
        partnerships: resolve(__dirname, 'partnerships.html'),
        news: resolve(__dirname, 'news.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
