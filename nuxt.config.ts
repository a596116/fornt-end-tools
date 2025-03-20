import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    'nuxt-monaco-editor',
  ],
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/styles/tailwindcss.css',
    '~/styles/variables.scss',
  ],

  components: [
    {
      global: true,
      path: '~/components/',
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ['vuetify'],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
    plugins: [
      // 添加 SVG 加載器插件

      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'assets/svgs')],
      }),
    ],
    resolve: {
      alias: {
        // 可能需要的別名
      },
    },
    optimizeDeps: {
      include: ['monaco-editor'],
    },
  },

  monacoEditor: {
    // These are default values:
    locale: 'en',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor',
    },
  },
})
