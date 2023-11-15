import path from 'path';

// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/scss/settings.scss',
      },
    }),
    ViteFonts({
      google: {
        families: [{
          name: 'Source+Sans+3',
          styles: 'wght@300;400;700',
        }],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~noty': path.resolve(__dirname, 'node_modules/noty'),
    },
    extensions: [
      '.js',
      '.json',
      '.vue',
      '.scss',
    ],
  },
  server: {
    port: 3000,
    watch: {
        ignored: ['!**/node_modules/**'],
    },
  },
})
