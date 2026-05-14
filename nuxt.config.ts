// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-05-15",
  modules: ["@nuxt/ui"],
  ui: {
    fonts: false,
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },
  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
  },
});
