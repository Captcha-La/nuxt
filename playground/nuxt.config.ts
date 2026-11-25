export default defineNuxtConfig({
  // Set CAPTCHALA_MODULE=../dist/module.mjs to try the built package instead of the source.
  modules: [process.env.CAPTCHALA_MODULE || '../src/module'],
  captchala: {
    // Public app key; can also be set with NUXT_PUBLIC_CAPTCHALA_APP_KEY.
    // The secret for the server utils comes from NUXT_CAPTCHALA_APP_SECRET.
    appKey: 'YOUR_APP_KEY'
  },
  devtools: { enabled: false },
  compatibilityDate: '2025-01-01'
})
