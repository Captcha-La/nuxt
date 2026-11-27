# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/nuxt/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · **한국어** · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Captchala CAPTCHA 공식 Nuxt 모듈입니다. Nuxt 애플리케이션을 스마트 CAPTCHA로 보호합니다.

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- 클라이언트 전용 `<Captchala>` 컴포넌트를 자동 등록합니다([`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue) 기반)
- 서버 유틸 `validateCaptchalaToken()`과 `issueCaptchalaServerToken()`이 서버 라우트에 자동 임포트됩니다
- 앱 시크릿은 private 런타임 설정에 보관되며 브라우저로 전송되지 않습니다
- 런타임에 CDN에서 CAPTCHA SDK를 불러오므로 항상 최신 보호 기능을 사용할 수 있습니다

## 설치

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

## 빠른 시작

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

임포트는 필요 없습니다. `app-key`의 기본값은 모듈의 `appKey`이며, 직접 전달하면
덮어씁니다. 이 컴포넌트는 클라이언트 전용입니다. 서버에서는 빈 플레이스홀더를
렌더링하고, SDK는 브라우저에서 로드됩니다.

## 모듈 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `appKey` | `string` | `''` | 공개 앱 키. 컴포넌트의 기본 `app-key`이자 서버 유틸에서 쓰는 키입니다. 런타임 덮어쓰기: `NUXT_PUBLIC_CAPTCHALA_APP_KEY`(컴포넌트) / `NUXT_CAPTCHALA_APP_KEY`(서버 유틸) |
| `appSecret` | `string` | `''` | 서버 유틸용 앱 시크릿(private 런타임 설정). `NUXT_CAPTCHALA_APP_SECRET` 사용을 권장합니다 |
| `componentName` | `string` | `'Captchala'` | 자동 등록되는 컴포넌트 이름 |
| `serverUtils` | `boolean` | `true` | 서버 유틸 등록 여부 |

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|---------|-------------|
| `appKey` | `string` | 모듈의 `appKey` | Captchala 애플리케이션 키 |
| `serverToken` | `string` | - | 서버가 발급하는 일회용 챌린지 토큰. 앱에 `server_token_required=true`가 설정된 경우 필수입니다. 아래 [프로덕션: serverToken 모드](#production-using-servertoken)를 참고하세요. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 표시 모드 |
| `action` | `string` | `'default'` | 액션 식별자(예: 'login', 'register', 'checkout') |
| `lang` | `string` | 브라우저 언어 | 언어 코드(`'zh-CN'`, `'en'`, `'ja'` 등). 지정하지 않으면 브라우저 언어를 사용합니다 |
| `theme` | `string \| object` | - | 프리셋 문자열 또는 `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | 바인딩할 요소 또는 선택자(`product="bind"`일 때만) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken`이 거부되었을 때 호출됩니다. 새 토큰을 반환하면 한 번 재시도하고, 아니면 `null`을 반환합니다 |

## 이벤트

| 이벤트 | 페이로드 | 설명 |
|-------|---------|-------------|
| `success` | `{ token, type, action }` | 인증에 성공했을 때 발생 |
| `error` | `error` | 인증에 실패했을 때 발생 |
| `close` | - | CAPTCHA가 닫혔을 때 발생 |
| `expired` | - | pass token이 사용되기 전에 만료됨(한 번 발생하며, 리스너가 있으면 `error` 대신 발생하고 위젯에 만료 상태가 표시됩니다). [토큰 만료](#token-expiry) 참고 |
| `ready` | - | CAPTCHA가 준비되었을 때 발생 |

## 메서드(ref 사용)

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">Verify</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| 메서드 | 설명 |
|--------|-------------|
| `verify()` | 인증 시작 |
| `reset()` | CAPTCHA 상태 초기화 |
| `destroy()` | CAPTCHA 인스턴스 제거 |
| `bindTo(selector)` | 요소에 바인딩('bind' 모드용) |
| `setLang(lang)` | 위젯을 다시 만들지 않고 언어 전환 |
| `getInstance()` | 내부 SDK 인스턴스 반환 |

ref는 컴포넌트가 브라우저에서 마운트된 뒤에 설정됩니다.

## 서버 측 검증

`validateCaptchalaToken(event, passToken, options?)`는 `server/`에 자동 임포트됩니다.
private 런타임 설정의 키와 시크릿을 사용해 `pass_token`과 `client_ip`로
`POST https://verify.captcha.la/v1/validate`를 호출합니다.

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

결과: `{ valid, code, message?, data? }`. `valid`는 API가 `code: 0`과
`data.valid: true`를 반환한 경우에만 `true`입니다. 토큰 누락, 네트워크 오류, 거부는
모두 `valid: false`가 됩니다(fail closed). 옵션:

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `clientIp` | `string \| false` | 요청 IP | 최종 사용자의 IP. `false`이면 생략합니다 |
| `xForwardedFor` | `boolean` | `false` | `X-Forwarded-For`에서 IP를 읽습니다. 이 헤더를 설정하는 프록시 뒤에 있을 때만 켜세요 |

API를 직접 호출하는 것과 같은 요청입니다.

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

CI나 로컬 개발에서는 공개
[테스트 키](https://docs.captcha.la/api-reference#test-keys)를
`NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET`으로 지정하면 CAPTCHA를 풀지
않고도 이 경로를 테스트할 수 있습니다.

<a id="production-using-servertoken"></a>
## 프로덕션: `serverToken` 사용

프로덕션(로그인, 회원가입, 결제 등)에서는 **서버 발급 토큰 플로우**를 권장합니다.
서버가 `POST /v1/server/challenge/issue`로 일회용 `server_token`(TTL 5분)을 발급하고,
브라우저는 그 토큰으로 위젯을 렌더링합니다. 이 호출은
`issueCaptchalaServerToken(event, { action, ttl })`가 처리합니다.

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

참고:
- `X-App-Secret`을 브라우저 코드에 절대 넣지 마세요. 이 모듈은 시크릿을 private 런타임 설정에 보관합니다.
- 각 `server_token`은 정확히 한 번만 사용할 수 있습니다. 위젯을 마운트할 때마다 새로 발급하세요.
- `server_token_required=false`인 기존 앱은 공개 `appKey`만 사용하는 플로우를 계속 쓸 수 있습니다.

<a id="token-expiry"></a>
## 토큰 만료

`@success`로 받은 pass token은 유효 시간이 정해져 있습니다. 사용자가 제출하기까지
너무 오래 기다리면 위젯에 인증이 만료되었다고 표시되고(바 또는 체크박스가 다시
인증하라고 안내합니다. `bind` 모드에서는 버튼이 직접 만든 것이므로 아무것도 표시되지
않습니다) `@error` 대신 `@expired`가 한 번 발생합니다. 그 밖의 처리는 직접
결정합니다. 예를 들어 자체 메시지를 보여 주고 `reset()`에 이어 `verify()`를 호출해
새 인증을 시작할 수 있습니다(다른 CAPTCHA 위젯의 `expired-callback` +
`reset()` + `execute()`와 같은 패턴입니다).

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

`@expired` 리스너가 없으면 기존과 같이 `@error`가 한 번 발생합니다(클래스 `expired`).
오프라인 토큰이나 degraded 토큰에서는 `@expired`가 발생하지 않습니다.

## 표시 모드

```vue
<Captchala product="popup" />  <!-- button that opens a popup (default) -->
<Captchala product="float" />  <!-- inline floating widget -->
<Captchala product="embed" />  <!-- embedded in the page -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- on your own button -->
```

## TypeScript 지원

모듈 옵션(`nuxt.config.ts`의 `captchala` 키)에는 타입이 지정되어 있고, 서버 유틸도
자동 임포트 시 타입이 적용됩니다. 컴포넌트 타입은 `@captcha-la/vue`에서 가져옵니다.

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground)는 라우트 2개와 토큰을 검증하는 서버 라우트로 구성된
작은 Nuxt 앱입니다. `npm install && npm run dev:prepare && npm run dev`를 실행한 뒤
`http://localhost:3000/?appKey=your-app-key`를 여세요.

## 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

## 링크

- [웹사이트](https://captcha.la)
- [문서](https://docs.captcha.la/sdk/web)
- [대시보드](https://dash.captcha.la)
