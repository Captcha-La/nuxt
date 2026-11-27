# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · **Português (BR)** · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Módulo Nuxt oficial do CAPTCHA Captchala - proteção CAPTCHA inteligente para suas aplicações Nuxt.

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- Registra automaticamente um componente `<Captchala>` somente cliente (baseado em [`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue))
- Utilitários de servidor `validateCaptchalaToken()` e `issueCaptchalaServerToken()`, importados automaticamente nas suas rotas de servidor
- O app secret fica na runtime config privada e nunca é enviado ao navegador
- Carrega o SDK do CAPTCHA a partir da CDN em tempo de execução, então você sempre tem a proteção mais recente

## Instalação

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

## Início rápido

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

Nenhum import é necessário. `app-key` usa por padrão o `appKey` do módulo; passe-o para
sobrescrever. O componente é somente cliente: no servidor ele renderiza um
placeholder vazio, e o SDK é carregado no navegador.

## Opções do módulo

| Opção | Tipo | Padrão | Descrição |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | App key pública: `app-key` padrão do componente e a chave usada pelos utilitários de servidor. Sobrescrita em tempo de execução: `NUXT_PUBLIC_CAPTCHALA_APP_KEY` (componente) / `NUXT_CAPTCHALA_APP_KEY` (utilitários de servidor) |
| `appSecret` | `string` | `''` | App secret para os utilitários de servidor (runtime config privada). Prefira `NUXT_CAPTCHALA_APP_SECRET` |
| `componentName` | `string` | `'Captchala'` | Nome do componente registrado automaticamente |
| `serverUtils` | `boolean` | `true` | Registra os utilitários de servidor |

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-------------|
| `appKey` | `string` | `appKey` do módulo | Sua chave de aplicação Captchala |
| `serverToken` | `string` | - | Token de desafio de uso único, emitido pelo servidor. Obrigatório quando o app tem `server_token_required=true`. Veja [Produção: modo serverToken](#production-using-servertoken) abaixo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de exibição |
| `action` | `string` | `'default'` | Identificador da ação (ex.: 'login', 'register', 'checkout') |
| `lang` | `string` | idioma do navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'` etc.); sem valor = idioma do navegador |
| `theme` | `string \| object` | - | String de preset ou `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | Elemento ou seletor ao qual vincular (somente para `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Chamado quando o `serverToken` é rejeitado. Retorne um novo token para tentar mais uma vez, ou `null` |

## Eventos

| Evento | Payload | Descrição |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | Disparado quando a verificação é bem-sucedida |
| `error` | `error` | Disparado quando a verificação falha |
| `close` | - | Disparado quando o CAPTCHA é fechado |
| `expired` | - | O pass token expirou antes de ser usado (dispara uma vez; com um listener, no lugar de `error`; o widget mostra a expiração). Veja [Expiração do token](#token-expiry) |
| `ready` | - | Disparado quando o CAPTCHA está pronto |

## Métodos (via ref)

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| Método | Descrição |
|--------|-------------|
| `verify()` | Dispara a verificação |
| `reset()` | Redefine o estado do CAPTCHA |
| `destroy()` | Destrói a instância do CAPTCHA |
| `bindTo(selector)` | Vincula a um elemento (para o modo 'bind') |
| `setLang(lang)` | Troca o idioma sem recriar o widget |
| `getInstance()` | A instância do SDK subjacente |

A ref é definida assim que o componente é montado no navegador.

## Validação no servidor

`validateCaptchalaToken(event, passToken, options?)` é importado automaticamente em
`server/`. Ele chama `POST https://verify.captcha.la/v1/validate` com
`pass_token` e `client_ip`, usando a key e o secret da runtime config
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

Resultado: `{ valid, code, message?, data? }`. `valid` só é `true` quando a API
retornou `code: 0` e `data.valid: true`; token ausente, erro de rede ou
recusa resultam em `valid: false` (fail closed). Opções:

| Opção | Tipo | Padrão | Descrição |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | IP da requisição | O IP do usuário final; `false` o omite |
| `xForwardedFor` | `boolean` | `false` | Lê o IP de `X-Forwarded-For`. Ative somente atrás de um proxy que defina esse header |

É a mesma requisição que você faria chamando a API diretamente:

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

Para CI ou desenvolvimento local, você pode usar as
[chaves de teste](https://docs.captcha.la/api-reference#test-keys) públicas como
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET` para exercitar esse caminho
sem resolver um CAPTCHA.

<a id="production-using-servertoken"></a>
## Produção: usando `serverToken`

Para produção (login, cadastro, pagamento etc.) recomendamos o
**fluxo de token emitido pelo servidor**. Seu servidor gera um `server_token` de uso único
(TTL de 5 minutos) com `POST /v1/server/challenge/issue` e o navegador renderiza o
widget com ele. `issueCaptchalaServerToken(event, { action, ttl })` faz essa chamada:

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

Observações:
- Nunca coloque o `X-App-Secret` no código do navegador. O módulo o mantém na runtime config privada.
- Cada `server_token` só pode ser usado uma única vez. Gere um novo antes de cada montagem do widget.
- Apps legados com `server_token_required=false` ainda podem usar o fluxo público apenas com `appKey`.

<a id="token-expiry"></a>
## Expiração do token

O pass token recebido em `@success` é válido por tempo limitado. Se o usuário demorar demais
para enviar, o widget mostra que a verificação expirou (a barra
ou a caixa de seleção pede para verificar novamente; no modo `bind` nada é exibido, já que o
botão é seu) e `@expired` dispara uma vez, no lugar de `@error`. Você decide o que
mais acontece, por exemplo mostrar sua própria mensagem e chamar `reset()` e depois `verify()`
para iniciar uma nova verificação (o mesmo padrão de `expired-callback` +
`reset()` + `execute()` em outros widgets de CAPTCHA):

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

Sem um listener de `@expired`, `@error` dispara uma vez (classe `expired`), como antes.
`@expired` nunca dispara para tokens offline ou degradados.

## Modos de exibição

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## Suporte a TypeScript

As opções do módulo são tipadas (chave `captchala` em `nuxt.config.ts`), e os utilitários
de servidor são tipados quando importados automaticamente. Os tipos do componente vêm de `@captcha-la/vue`:

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) é um pequeno app Nuxt com duas rotas e uma rota de servidor
que valida o token. Execute `npm install && npm run dev:prepare && npm run dev`
e depois abra `http://localhost:3000/?appKey=your-app-key`.

## Licença

Licença MIT - veja [LICENSE](./LICENSE) para mais detalhes.

## Links

- [Site](https://captcha.la)
- [Documentação](https://docs.captcha.la/sdk/web)
- [Painel](https://dash.captcha.la)
