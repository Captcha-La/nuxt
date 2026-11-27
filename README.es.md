# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · **Español** · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Módulo oficial de Nuxt para Captchala CAPTCHA: protección CAPTCHA inteligente para tus aplicaciones Nuxt.

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- Registra automáticamente un componente `<Captchala>` solo de cliente (basado en [`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue))
- Utilidades de servidor `validateCaptchalaToken()` e `issueCaptchalaServerToken()`, importadas automáticamente en tus rutas de servidor
- El secreto de la aplicación se queda en la runtime config privada y nunca se envía al navegador
- Carga el SDK de CAPTCHA desde la CDN en tiempo de ejecución, así siempre tienes la protección más reciente

## Instalación

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

## Inicio rápido

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

No hace falta ningún import. `app-key` toma por defecto el `appKey` del módulo; pásalo para
sobrescribirlo. El componente es solo de cliente: en el servidor renderiza un marcador
vacío y el SDK se carga en el navegador.

## Opciones del módulo

| Opción | Tipo | Valor por defecto | Descripción |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | Clave pública de la aplicación: `app-key` por defecto del componente y la clave para las utilidades de servidor. Sobrescritura en tiempo de ejecución: `NUXT_PUBLIC_CAPTCHALA_APP_KEY` (componente) / `NUXT_CAPTCHALA_APP_KEY` (utilidades de servidor) |
| `appSecret` | `string` | `''` | Secreto de la aplicación para las utilidades de servidor (runtime config privada). Es preferible `NUXT_CAPTCHALA_APP_SECRET` |
| `componentName` | `string` | `'Captchala'` | Nombre del componente registrado automáticamente |
| `serverUtils` | `boolean` | `true` | Registra las utilidades de servidor |

## Props

| Prop | Tipo | Valor por defecto | Descripción |
|------|------|---------|-------------|
| `appKey` | `string` | `appKey` del módulo | La clave de tu aplicación Captchala |
| `serverToken` | `string` | - | Token de desafío de un solo uso emitido por el servidor. Obligatorio cuando la aplicación tiene `server_token_required=true`. Consulta [Producción: modo serverToken](#production-using-servertoken) más abajo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de visualización |
| `action` | `string` | `'default'` | Identificador de la acción (p. ej., 'login', 'register', 'checkout') |
| `lang` | `string` | idioma del navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'`, etc.); sin definir = el idioma del navegador |
| `theme` | `string \| object` | - | Cadena de preset o `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | Elemento o selector al que vincularse (solo con `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Se llama cuando se rechaza el `serverToken`. Devuelve un token nuevo para reintentar una vez, o `null` |

## Eventos

| Evento | Datos | Descripción |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | Se emite cuando la verificación tiene éxito |
| `error` | `error` | Se emite cuando la verificación falla |
| `close` | - | Se emite cuando se cierra el CAPTCHA |
| `expired` | - | El pass token caducó antes de usarse (se emite una vez; si hay un listener, en lugar de `error`; el widget muestra la caducidad). Consulta [Caducidad del token](#token-expiry) |
| `ready` | - | Se emite cuando el CAPTCHA está listo |

## Métodos (mediante ref)

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| Método | Descripción |
|--------|-------------|
| `verify()` | Inicia la verificación |
| `reset()` | Restablece el estado del CAPTCHA |
| `destroy()` | Destruye la instancia del CAPTCHA |
| `bindTo(selector)` | Vincula a un elemento (para el modo 'bind') |
| `setLang(lang)` | Cambia el idioma sin recargar el widget |
| `getInstance()` | La instancia subyacente del SDK |

La ref queda definida en cuanto el componente se ha montado en el navegador.

## Validación en el servidor

`validateCaptchalaToken(event, passToken, options?)` se importa automáticamente en
`server/`. Llama a `POST https://verify.captcha.la/v1/validate` con
`pass_token` y `client_ip`, usando la clave y el secreto de la runtime config
privada:

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

Resultado: `{ valid, code, message?, data? }`. `valid` es `true` solo cuando la API
devolvió `code: 0` y `data.valid: true`; un token ausente, un error de red o un
rechazo dan `valid: false` (fail closed). Opciones:

| Opción | Tipo | Valor por defecto | Descripción |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | IP de la petición | La IP del usuario final; `false` la omite |
| `xForwardedFor` | `boolean` | `false` | Lee la IP de `X-Forwarded-For`. Actívalo solo detrás de un proxy que la establezca |

Es la misma petición que harías llamando tú mismo a la API:

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

Para CI o desarrollo local puedes usar las
[claves de prueba](https://docs.captcha.la/api-reference#test-keys) públicas como
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET` para probar este flujo
sin resolver un CAPTCHA.

<a id="production-using-servertoken"></a>
## Producción: uso de `serverToken`

Para producción (inicio de sesión, registro, pagos, etc.) recomendamos el
**flujo con token emitido por el servidor**. Tu servidor genera un `server_token` de un solo uso
(TTL de 5 minutos) con `POST /v1/server/challenge/issue` y el navegador renderiza el
widget con él. `issueCaptchalaServerToken(event, { action, ttl })` hace la llamada:

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

Notas:
- Nunca incluyas `X-App-Secret` en el código del navegador. El módulo lo guarda en la runtime config privada.
- Cada `server_token` se puede usar exactamente una vez. Genera uno nuevo antes de cada montaje del widget.
- Las aplicaciones antiguas con `server_token_required=false` pueden seguir usando el flujo público solo con `appKey`.

<a id="token-expiry"></a>
## Caducidad del token

El pass token que recibes en `@success` es válido durante un tiempo limitado. Si el usuario tarda
demasiado en enviar el formulario, el widget indica que la verificación caducó (la barra
o la casilla piden verificar de nuevo; en modo `bind` no se muestra nada, porque el
botón es tuyo) y `@expired` se emite una vez, en lugar de `@error`. Tú decides qué
más ocurre, por ejemplo mostrar tu propio mensaje y llamar a `reset()` y luego a `verify()`
para iniciar una nueva verificación (el mismo patrón que `expired-callback` +
`reset()` + `execute()` en otros widgets de CAPTCHA):

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

Sin un listener de `@expired`, `@error` se emite una vez (clase `expired`), como hasta ahora.
`@expired` nunca se emite para tokens offline o degradados.

## Modos de visualización

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## Soporte de TypeScript

Las opciones del módulo tienen tipos (clave `captchala` en `nuxt.config.ts`) y las utilidades
de servidor también al importarse automáticamente. Los tipos del componente vienen de `@captcha-la/vue`:

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) es una pequeña aplicación Nuxt con dos rutas y una ruta de servidor
que valida el token. Ejecuta `npm install && npm run dev:prepare && npm run dev`
y abre `http://localhost:3000/?appKey=your-app-key`.

## Licencia

Licencia MIT: consulta [LICENSE](./LICENSE) para más detalles.

## Enlaces

- [Sitio web](https://captcha.la)
- [Documentación](https://docs.captcha.la/sdk/web)
- [Panel de control](https://dash.captcha.la)
