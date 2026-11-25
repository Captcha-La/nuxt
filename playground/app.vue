<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="page">
    <h1>CaptchaLa + Nuxt</h1>
    <nav>
      <NuxtLink id="nav-captcha" :to="{ path: '/', query: route.query }">Captcha</NuxtLink>
      <NuxtLink id="nav-other" :to="{ path: '/other', query: route.query }">Other page</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>

<style>
body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
nav a { margin-right: 12px; }
.box { max-width: 400px; margin-top: 16px; }
button { margin: 4px 4px 4px 0; }
pre { background: #f1f5f9; padding: 8px; font-size: 12px; white-space: pre-wrap; }
</style>
