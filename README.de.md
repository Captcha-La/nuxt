# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · **Deutsch**

Offizielles Captchala-CAPTCHA-Modul für Nuxt - intelligenter CAPTCHA-Schutz für Ihre Nuxt-Anwendungen.

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- Registriert automatisch eine reine Client-Komponente `<Captchala>` (basierend auf [`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue))
- Server-Utils `validateCaptchalaToken()` und `issueCaptchalaServerToken()`, in Ihren Server-Routen automatisch importiert
- Das App-Secret bleibt in der privaten Runtime-Config und wird nie an den Browser gesendet
- Lädt das CAPTCHA SDK zur Laufzeit vom CDN, sodass Sie immer den aktuellen Schutz erhalten

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

## Schnellstart

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

Ein Import ist nicht nötig. `app-key` verwendet standardmäßig den `appKey` des Moduls; übergeben Sie ihn,
um ihn zu überschreiben. Die Komponente läuft nur im Client: Auf dem Server rendert sie einen leeren
Platzhalter, und das SDK wird im Browser geladen.

## Moduloptionen

| Option | Typ | Standard | Beschreibung |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | Öffentlicher App-Key: Standardwert für `app-key` der Komponente und der Key für die Server-Utils. Überschreibung zur Laufzeit: `NUXT_PUBLIC_CAPTCHALA_APP_KEY` (Komponente) / `NUXT_CAPTCHALA_APP_KEY` (Server-Utils) |
| `appSecret` | `string` | `''` | App-Secret für die Server-Utils (private Runtime-Config). Besser `NUXT_CAPTCHALA_APP_SECRET` verwenden |
| `componentName` | `string` | `'Captchala'` | Name der automatisch registrierten Komponente |
| `serverUtils` | `boolean` | `true` | Server-Utils registrieren |
| `verifyUrl` | `string` | `'https://verify.captcha.la'` | Basis-URL der Validierungs-API |

## Props

| Prop | Typ | Standard | Beschreibung |
|------|------|---------|-------------|
| `appKey` | `string` | `appKey` des Moduls | Ihr Captchala-Anwendungsschlüssel |
| `serverToken` | `string` | - | Einmaliges, vom Server ausgestelltes Challenge-Token. Erforderlich, wenn die App `server_token_required=true` hat. Siehe [Produktion: serverToken-Modus](#production-using-servertoken) unten. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Anzeigemodus |
| `action` | `string` | `'default'` | Aktionskennung (z. B. 'login', 'register', 'checkout') |
| `lang` | `string` | Browsersprache | Sprachcode (`'zh-CN'`, `'en'`, `'ja'` usw.); nicht gesetzt = Browsersprache |
| `theme` | `string \| object` | - | Preset-String oder `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | Element oder Selektor zum Binden (nur für `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Wird aufgerufen, wenn `serverToken` abgelehnt wird. Geben Sie ein neues Token zurück, um einmal erneut zu versuchen, oder `null` |

## Events

| Event | Nutzdaten | Beschreibung |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | Wird ausgelöst, wenn die Verifizierung erfolgreich ist |
| `error` | `error` | Wird ausgelöst, wenn die Verifizierung fehlschlägt |
| `close` | - | Wird ausgelöst, wenn das CAPTCHA geschlossen wird |
| `expired` | - | Das pass token ist abgelaufen, bevor es verwendet wurde (wird einmal ausgelöst; mit Listener statt `error`; das Widget zeigt den Ablauf an). Siehe [Ablauf des Tokens](#token-expiry) |
| `ready` | - | Wird ausgelöst, wenn das CAPTCHA bereit ist |

## Methoden (über ref)

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| Methode | Beschreibung |
|--------|-------------|
| `verify()` | Verifizierung auslösen |
| `reset()` | CAPTCHA-Zustand zurücksetzen |
| `destroy()` | CAPTCHA-Instanz zerstören |
| `bindTo(selector)` | An ein Element binden (für den 'bind'-Modus) |
| `setLang(lang)` | Sprache direkt umschalten |
| `getInstance()` | Die zugrunde liegende SDK-Instanz |

Die ref ist gesetzt, sobald die Komponente im Browser gemountet wurde.

## Serverseitige Validierung

`validateCaptchalaToken(event, passToken, options?)` wird in `server/` automatisch
importiert. Es ruft `POST https://verify.captcha.la/v1/validate` mit
`pass_token` und `client_ip` auf und verwendet dabei Key und Secret aus der privaten
Runtime-Config:

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

Ergebnis: `{ valid, code, message?, data? }`. `valid` ist nur dann `true`, wenn die API
`code: 0` und `data.valid: true` zurückgegeben hat; ein fehlendes Token, ein Netzwerkfehler oder
eine Ablehnung ergibt `valid: false` (Fail-closed). Optionen:

| Option | Typ | Standard | Beschreibung |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | Request-IP | Die IP des Endnutzers; `false` lässt sie weg |
| `xForwardedFor` | `boolean` | `false` | Die IP aus `X-Forwarded-For` lesen. Nur hinter einem Proxy aktivieren, der den Header setzt |

Es ist derselbe Request, als würden Sie die API selbst aufrufen:

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

Für CI oder die lokale Entwicklung können Sie die öffentlichen
[Testschlüssel](https://docs.captcha.la/api-reference#test-keys) als
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET` verwenden, um diesen Pfad
zu testen, ohne ein CAPTCHA zu lösen.

<a id="production-using-servertoken"></a>
## Produktion: `serverToken` verwenden

Für die Produktion (Login, Registrierung, Zahlung usw.) empfehlen wir den
**Ablauf mit serverseitig ausgestelltem Token**. Ihr Server erzeugt mit `POST /v1/server/challenge/issue`
ein einmaliges `server_token` (5 Minuten TTL), und der Browser rendert das
Widget damit. `issueCaptchalaServerToken(event, { action, ttl })` übernimmt den Aufruf:

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

Hinweise:
- Betten Sie `X-App-Secret` niemals in Browser-Code ein. Das Modul hält es in der privaten Runtime-Config.
- Jedes `server_token` kann genau einmal verwendet werden. Erzeugen Sie vor jedem Mounten des Widgets ein neues.
- Ältere Apps mit `server_token_required=false` können weiterhin den öffentlichen Ablauf nur mit `appKey` nutzen.

<a id="token-expiry"></a>
## Ablauf des Tokens

Das pass token aus `@success` ist nur begrenzt gültig. Wartet der Nutzer zu lange
mit dem Absenden, zeigt das Widget an, dass die Verifizierung abgelaufen ist (die Leiste
bzw. Checkbox fordert zur erneuten Verifizierung auf; im `bind`-Modus wird nichts angezeigt,
da der Button Ihnen gehört), und `@expired` wird einmal ausgelöst, statt `@error`. Was
sonst passiert, entscheiden Sie, zum Beispiel eine eigene Meldung anzeigen und `reset()` und dann `verify()`
aufrufen, um eine neue Verifizierung zu starten (dasselbe Muster wie `expired-callback` +
`reset()` + `execute()` bei anderen CAPTCHA-Widgets):

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

Ohne `@expired`-Listener wird wie bisher einmal `@error` ausgelöst (Klasse `expired`).
`@expired` wird nie für Offline- oder Degraded-Tokens ausgelöst.

## Anzeigemodi

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## TypeScript-Unterstützung

Die Moduloptionen sind typisiert (Key `captchala` in `nuxt.config.ts`), und die Server-Utils
sind beim automatischen Import typisiert. Die Komponententypen stammen aus `@captcha-la/vue`:

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) ist eine kleine Nuxt-App mit zwei Routen und einer Server-Route,
die das Token validiert. Führen Sie `npm install && npm run dev:prepare && npm run dev` aus
und öffnen Sie dann `http://localhost:3000/?appKey=your-app-key`.

## Lizenz

MIT-Lizenz - Details siehe [LICENSE](./LICENSE).

## Links

- [Website](https://captcha.la)
- [Dokumentation](https://docs.captcha.la/sdk/web)
- [Dashboard](https://dash.captcha.la)
