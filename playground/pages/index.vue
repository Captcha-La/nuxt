<script setup lang="ts">
// Pass ?appKey=...&serverToken=... in the URL; otherwise the module's appKey is used.
const route = useRoute()
const appKey = computed(() => (route.query.appKey as string) || undefined)
const serverToken = computed(() => (route.query.serverToken as string) || undefined)

const captcha = ref()
const lang = ref('en')
const token = ref('')
const events = ref<string[]>([])
const validation = ref('')

function log(name: string, detail?: unknown) {
  events.value.push(detail === undefined ? name : `${name}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
}

function onSuccess(result: { token: string }) {
  token.value = result.token
  log('success')
}

// Sends the pass token to this app's own server route, which calls validateCaptchalaToken().
async function validate() {
  const res = await $fetch('/api/validate', { method: 'POST', body: { token: token.value } })
  validation.value = JSON.stringify(res)
}
</script>

<template>
  <section class="box">
    <h2>&lt;Captchala&gt; (client-only, float mode)</h2>
    <div id="widget">
      <Captchala
        ref="captcha"
        :app-key="appKey"
        :server-token="serverToken"
        :lang="lang"
        product="float"
        action="login"
        @ready="log('ready')"
        @success="onSuccess"
        @expired="token = ''; log('expired')"
        @error="(e: unknown) => log('error', e)"
        @close="log('close')"
      />
    </div>
    <button id="lang-ja" @click="lang = 'ja'">Language: ja</button>
    <button id="lang-en" @click="lang = 'en'">Language: en</button>
    <button id="reset" @click="captcha?.reset()">Reset</button>
    <button id="validate" :disabled="!token" @click="validate">Validate on server</button>
    <p>Token: <code id="token">{{ token || '-' }}</code></p>
    <p>Server: <code id="validation">{{ validation || '-' }}</code></p>
  </section>
  <pre id="events">{{ events.join('\n') }}</pre>
</template>
