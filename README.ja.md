# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · **日本語** · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Captchala 公式の Nuxt 用 CAPTCHA モジュールです。Nuxt アプリケーションをスマートな CAPTCHA で保護します。

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- クライアント専用の `<Captchala>` コンポーネントを自動登録します（[`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue) ベース）
- サーバーユーティリティ `validateCaptchalaToken()` と `issueCaptchalaServerToken()` をサーバールートに自動インポートします
- アプリシークレットはプライベートな runtime config に保持され、ブラウザに送られることはありません
- CAPTCHA SDK は実行時に CDN から読み込まれるため、常に最新の保護機能を利用できます

## インストール

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

## クイックスタート

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

インポートは不要です。`app-key` のデフォルトはモジュールの `appKey` で、指定すると上書きできます。
コンポーネントはクライアント専用です。サーバー側では空のプレースホルダーを描画し、
SDK はブラウザで読み込まれます。

## モジュールオプション

| オプション | 型 | デフォルト | 説明 |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | 公開アプリキー。コンポーネントの `app-key` のデフォルト値であり、サーバーユーティリティが使うキーでもあります。実行時の上書き：`NUXT_PUBLIC_CAPTCHALA_APP_KEY`（コンポーネント）/ `NUXT_CAPTCHALA_APP_KEY`（サーバーユーティリティ） |
| `appSecret` | `string` | `''` | サーバーユーティリティ用のアプリシークレット（プライベート runtime config）。`NUXT_CAPTCHALA_APP_SECRET` の利用を推奨します |
| `componentName` | `string` | `'Captchala'` | 自動登録されるコンポーネントの名前 |
| `serverUtils` | `boolean` | `true` | サーバーユーティリティを登録するかどうか |

## Props

| Prop | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `appKey` | `string` | モジュールの `appKey` | Captchala のアプリケーションキー |
| `serverToken` | `string` | - | サーバーが発行するワンタイムのチャレンジトークン。アプリで `server_token_required=true` の場合は必須です。後述の [本番環境：serverToken モード](#production-using-servertoken) を参照してください。 |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 表示モード |
| `action` | `string` | `'default'` | アクション識別子（例：'login'、'register'、'checkout'） |
| `lang` | `string` | ブラウザの言語 | 言語コード（`'zh-CN'`、`'en'`、`'ja'` など）。未指定時はブラウザの言語を使用します |
| `theme` | `string \| object` | - | プリセット文字列、または `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | バインド先の要素またはセレクター（`product="bind"` の場合のみ） |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken` が拒否されたときに呼ばれます。新しいトークンを返すと 1 回だけ再試行し、`null` を返すとエラーになります |

## イベント

| イベント | ペイロード | 説明 |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | 検証に成功したときに発火します |
| `error` | `error` | 検証に失敗したときに発火します |
| `close` | - | CAPTCHA が閉じられたときに発火します |
| `expired` | - | pass token が使用前に期限切れになったとき（1 回だけ発火。リスナーがある場合は `error` の代わりに発火し、ウィジェットに期限切れが表示されます）。[トークンの有効期限](#token-expiry) を参照してください |
| `ready` | - | CAPTCHA の準備ができたときに発火します |

## メソッド（ref 経由）

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| メソッド | 説明 |
|--------|-------------|
| `verify()` | 検証を開始します |
| `reset()` | CAPTCHA の状態をリセットします |
| `destroy()` | CAPTCHA インスタンスを破棄します |
| `bindTo(selector)` | 要素にバインドします（'bind' モード用） |
| `setLang(lang)` | その場で言語を切り替えます |
| `getInstance()` | 内部の SDK インスタンスを返します |

ref はコンポーネントがブラウザでマウントされた時点で設定されます。

## サーバーサイド検証

`validateCaptchalaToken(event, passToken, options?)` は `server/` で自動インポートされます。
プライベート runtime config のキーとシークレットを使い、`pass_token` と `client_ip` を付けて
`POST https://verify.captcha.la/v1/validate` を呼び出します：

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

戻り値：`{ valid, code, message?, data? }`。`valid` が `true` になるのは、API が
`code: 0` かつ `data.valid: true` を返した場合のみです。トークンがない、ネットワークエラー、
拒否のいずれの場合も `valid: false` になります（フェイルクローズ）。オプション：

| オプション | 型 | デフォルト | 説明 |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | リクエストの IP | エンドユーザーの IP。`false` を指定すると送信しません |
| `xForwardedFor` | `boolean` | `false` | `X-Forwarded-For` から IP を読み取ります。このヘッダーを設定するプロキシの背後にある場合にのみ有効にしてください |

これは API を自分で呼び出すのと同じリクエストです：

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

CI やローカル開発では、公開されている
[テストキー](https://docs.captcha.la/api-reference#test-keys) を
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET` に設定すると、CAPTCHA を解かずに
この経路を試せます。

<a id="production-using-servertoken"></a>
## 本番環境：`serverToken` の利用

本番環境（ログイン、登録、決済など）では、**サーバー発行トークンフロー** を推奨します。
サーバーが `POST /v1/server/challenge/issue` でワンタイムの `server_token`（TTL 5 分）を発行し、
ブラウザはそれを使ってウィジェットを描画します。この呼び出しは `issueCaptchalaServerToken(event, { action, ttl })` が行います：

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

注意事項：
- `X-App-Secret` をブラウザのコードに埋め込まないでください。このモジュールはシークレットをプライベート runtime config に保持します。
- 各 `server_token` は 1 回しか使用できません。ウィジェットをマウントするたびに再発行してください。
- `server_token_required=false` のレガシーアプリでは、引き続き公開 `appKey` のみのフローを利用できます。

<a id="token-expiry"></a>
## トークンの有効期限

`@success` で受け取る pass token の有効期間には制限があります。ユーザーが送信までに時間をかけすぎると、
ウィジェットに検証の期限切れが表示され（バーまたはチェックボックスが再検証を求めます。`bind` モードでは
ボタンがアプリ側のものなので何も表示されません）、`@error` の代わりに `@expired` が 1 回だけ発火します。
その後の処理はアプリ側で決められます。たとえば独自のメッセージを表示し、`reset()` に続けて `verify()` を呼び出して
新しい検証を開始できます（他の CAPTCHA ウィジェットでの `expired-callback` + `reset()` + `execute()` と同じパターンです）。

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

`@expired` リスナーがない場合は、従来どおり `@error` が 1 回だけ発火します（class は `expired`）。
オフライントークンや縮退トークンでは `@expired` は発火しません。

## 表示モード

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## TypeScript サポート

モジュールオプション（`nuxt.config.ts` の `captchala` キー）には型が付いており、サーバー
ユーティリティも自動インポート時に型付けされます。コンポーネントの型は `@captcha-la/vue` から提供されます：

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) は、2 つのルートとトークンを検証するサーバールートを持つ小さな Nuxt アプリです。
`npm install && npm run dev:prepare && npm run dev` を実行し、
`http://localhost:3000/?appKey=your-app-key` を開いてください。

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

## リンク

- [公式サイト](https://captcha.la)
- [ドキュメント](https://docs.captcha.la/sdk/web)
- [ダッシュボード](https://dash.captcha.la)
