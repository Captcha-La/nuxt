# @captcha-la/nuxt

**English** · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Official Captchala CAPTCHA Nuxt module - Smart CAPTCHA protection for your Nuxt applications.

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- Auto-registers a client-only `<Captchala>` component (built on [`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue))
- Server utils `validateCaptchalaToken()` and `issueCaptchalaServerToken()`, auto-imported in your server routes
- The app secret stays in the private runtime config and is never sent to the browser
- Loads the CAPTCHA SDK from the CDN at runtime, so you always get the latest protection

## Installation

```bash
npm install @captcha-la/nuxt
# or
yarn add @captcha-la/nuxt
# or
pnpm add @captcha-la/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@captcha-la/nuxt'],
  captchala: {
    appKey: 'your-app-key' // public; or NUXT_PUBLIC_CAPTCHALA_APP_KEY
  }
})
```

```bash
# .env — server only
NUXT_CAPTCHALA_APP_SECRET=your-app-secret
```

## Quick Start

```vue
<template>
  <Captchala
    product="popup"
    action="login"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup>
function handleSuccess(result) {
  console.log('Verification successful!')
  console.log('Token:', result.token)
  // Send token to your server for validation
}

function handleError(error) {
  console.error('Verification failed:', error)
}
</script>
```

No import is needed. `app-key` defaults to the module's `appKey`; pass it to
override. The component is client-only: on the server it renders an empty
placeholder, and the SDK loads in the browser.

## Module Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | Public app key: default `app-key` of the component, and the key for the server utils. Runtime override: `NUXT_PUBLIC_CAPTCHALA_APP_KEY` (component) / `NUXT_CAPTCHALA_APP_KEY` (server utils) |
| `appSecret` | `string` | `''` | App secret for the server utils (private runtime config). Prefer `NUXT_CAPTCHALA_APP_SECRET` |
| `componentName` | `string` | `'Captchala'` | Name of the auto-registered component |
| `serverUtils` | `boolean` | `true` | Register the server utils |
| `verifyUrl` | `string` | `'https://verify.captcha.la'` | Base URL of the validation API |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appKey` | `string` | module `appKey` | Your Captchala application key |
| `serverToken` | `string` | - | One-time, server-issued challenge token. Required when the app has `server_token_required=true`. See [Production: serverToken mode](#production-using-servertoken) below. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Display mode |
| `action` | `string` | `'default'` | Action identifier (e.g., 'login', 'register', 'checkout') |
| `lang` | `string` | browser language | Language code (`'zh-CN'`, `'en'`, `'ja'`, etc.); unset = the browser language |
| `theme` | `string \| object` | - | Preset string or `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | Element or selector to bind to (only for `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Called when `serverToken` is rejected. Return a new token to retry once, or `null` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | Fired when verification succeeds |
| `error` | `error` | Fired when verification fails |
| `close` | - | Fired when CAPTCHA is closed |
| `expired` | - | The pass token expired before it was used (fires once; with a listener, instead of `error`; the widget shows the expiry). See [Token expiry](#token-expiry) |
| `ready` | - | Fired when CAPTCHA is ready |

## Methods (via ref)

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| Method | Description |
|--------|-------------|
| `verify()` | Trigger verification |
| `reset()` | Reset CAPTCHA state |
| `destroy()` | Destroy CAPTCHA instance |
| `bindTo(selector)` | Bind to element (for 'bind' mode) |
| `setLang(lang)` | Switch the language in place |
| `getInstance()` | The underlying SDK instance |

The ref is set once the component has mounted in the browser.

## Server-side Validation

`validateCaptchalaToken(event, passToken, options?)` is auto-imported in
`server/`. It calls `POST https://verify.captcha.la/v1/validate` with
`pass_token` and `client_ip`, using the key and secret from the private runtime
config:

```ts
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password, captchaToken } = await readBody(event)

  // captchaToken = result.token from @success
  const captcha = await validateCaptchalaToken(event, captchaToken)
  if (!captcha.valid) {
    throw createError({ statusCode: 400, statusMessage: 'CAPTCHA verification failed' })
  }
  // Token is valid, proceed with the request
})
```

Result: `{ valid, code, message?, data? }`. `valid` is `true` only when the API
returned `code: 0` and `data.valid: true`; a missing token, network error or
refusal gives `valid: false` (fail closed). Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | request IP | The end user's IP; `false` omits it |
| `xForwardedFor` | `boolean` | `false` | Read the IP from `X-Forwarded-For`. Enable only behind a proxy that sets it |

It is the same request as calling the API yourself:

```js
const response = await fetch('https://verify.captcha.la/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': process.env.CAPTCHALA_APP_KEY,
    'X-App-Secret': process.env.CAPTCHALA_APP_SECRET
  },
  // pass_token = result.token from @success; client_ip is optional but recommended
  body: JSON.stringify({ pass_token: token, client_ip: clientIp })
})

const result = await response.json()
if (result.code === 0 && result.data.valid === true) {
  // Token is valid, proceed with the request
}
```

For CI or local development you can use the public
[test keys](https://docs.captcha.la/api-reference#test-keys) as
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET` to exercise this path
without solving a CAPTCHA.

## Production: using `serverToken`

For production (login, registration, payment, etc.) we recommend the
**server-issued token flow**. Your server mints a one-time `server_token`
(5-minute TTL) with `POST /v1/server/challenge/issue` and the browser renders the
widget with it. `issueCaptchalaServerToken(event, { action, ttl })` does the call:

```ts
// server/api/captcha-token.get.ts
export default defineEventHandler(async (event) => ({
  server_token: await issueCaptchalaServerToken(event, { action: 'login' })
}))
```

```vue
<template>
  <Captchala v-if="data" :server-token="data.server_token" action="login" @success="onSuccess" />
  <div v-else>Loading...</div>
</template>

<script setup>
// Fetched in the browser on every mount: each token can be used once.
const { data } = await useFetch('/api/captcha-token', { server: false })

function onSuccess(result) {
  console.log('pass_token:', result.token)
}
</script>
```

Notes:
- Never embed `X-App-Secret` in browser code. The module keeps it in the private runtime config.
- Each `server_token` can be used exactly once. Regenerate before every widget mount.
- Legacy apps with `server_token_required=false` can still use the public `appKey`-only flow.

## Token expiry

The pass token from `@success` is valid for a limited time. If the user waits too
long before submitting, the widget shows that the verification expired (the bar
or checkbox asks to verify again; in `bind` mode nothing is shown, since the
button is yours) and `@expired` fires once, instead of `@error`. You decide what
else happens, for example show your own message and call `reset()` then `verify()`
to start a new verification (the same pattern as an `expired-callback` +
`reset()` + `execute()` in other CAPTCHA widgets):

```vue
<template>
  <Captchala
    ref="captcha"
    @success="(r) => { token = r.token; expired = false }"
    @expired="() => { token = ''; expired = true }"
  />
  <p v-if="expired">Token expired. <button @click="verifyAgain">Verify again</button></p>
</template>

<script setup>
const captcha = ref()
const token = ref('')
const expired = ref(false)

function verifyAgain() {
  expired.value = false
  captcha.value?.reset()
  captcha.value?.verify()
}
</script>
```

Without an `@expired` listener, `@error` fires once (class `expired`), as before.
`@expired` never fires for offline or degraded tokens.

## Display Modes

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## TypeScript Support

The module options are typed (`captchala` key in `nuxt.config.ts`), and the server
utils are typed when auto-imported. Component types come from `@captcha-la/vue`:

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) is a small Nuxt app with two routes and a server route
that validates the token. Run `npm install && npm run dev:prepare && npm run dev`,
then open `http://localhost:3000/?appKey=your-app-key`.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- [Website](https://captcha.la)
- [Documentation](https://docs.captcha.la/sdk/web)
- [Dashboard](https://dash.captcha.la)
