// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-lucide-icons',
  ],

  devtools: {
    enabled: true
  },
  runtimeConfig: {
    public: {
      apiUrl: 'https://dreamless-subhemispherically-sharleen.ngrok-free.dev/graphql'
    }
  },
  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2026-02-21',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})