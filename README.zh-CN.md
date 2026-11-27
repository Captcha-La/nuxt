# @captcha-la/nuxt

[English](https://github.com/Captcha-La/nuxt/blob/main/README.md) · **简体中文** · [日本語](https://github.com/Captcha-La/nuxt/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/nuxt/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/nuxt/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/nuxt/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/nuxt/blob/main/README.de.md)

Captchala 验证码 Nuxt 官方模块 —— 为你的 Nuxt 应用提供智能 CAPTCHA 防护。

[![npm version](https://img.shields.io/npm/v/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/nuxt.svg)](https://www.npmjs.com/package/@captcha-la/nuxt)
[![license](https://img.shields.io/npm/l/@captcha-la/nuxt.svg)](https://github.com/Captcha-La/nuxt/blob/main/LICENSE)

- 自动注册仅客户端渲染的 `<Captchala>` 组件（基于 [`@captcha-la/vue`](https://www.npmjs.com/package/@captcha-la/vue)）
- 服务端工具函数 `validateCaptchalaToken()` 与 `issueCaptchalaServerToken()`，在 server 路由中自动导入
- app secret 只保存在私有 runtime config 中，永远不会下发到浏览器
- 运行时从 CDN 加载验证码 SDK，始终获得最新防护

## 安装

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
    appKey: 'your-app-key' // 公开 key；也可用 NUXT_PUBLIC_CAPTCHALA_APP_KEY
  }
})
```

```bash
# .env — 仅服务端
NUXT_CAPTCHALA_APP_SECRET=your-app-secret
```

## 快速上手

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
  console.log('验证成功')
  console.log('Token:', result.token)
  // 把 token 提交到你自己的后端校验
}

function handleError(error) {
  console.error('验证失败:', error)
}
</script>
```

无需 import。`app-key` 默认取模块配置的 `appKey`，传入则覆盖。组件仅在客户端渲染：
服务端只输出空占位，SDK 在浏览器中加载。

## 模块配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `appKey` | `string` | `''` | 公开 app key：组件默认的 `app-key`，也是服务端工具使用的 key。运行时覆盖：`NUXT_PUBLIC_CAPTCHALA_APP_KEY`（组件）/ `NUXT_CAPTCHALA_APP_KEY`（服务端工具） |
| `appSecret` | `string` | `''` | 服务端工具使用的 app secret（私有 runtime config）。推荐用 `NUXT_CAPTCHALA_APP_SECRET` |
| `componentName` | `string` | `'Captchala'` | 自动注册的组件名 |
| `serverUtils` | `boolean` | `true` | 是否注册服务端工具函数 |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appKey` | `string` | 模块 `appKey` | 你的 Captchala 应用 Key |
| `serverToken` | `string` | - | 由服务端签发的一次性挑战 token。应用开启 `server_token_required=true` 时必填。见下方 [生产环境：使用 serverToken](#生产环境使用-servertoken) |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 显示模式 |
| `action` | `string` | `'default'` | 业务场景标识（如 'login'、'register'、'checkout'） |
| `lang` | `string` | 浏览器语言 | 语言代码（`'zh-CN'`、`'en'`、`'ja'` 等）；不设置则跟随浏览器语言 |
| `theme` | `string \| object` | - | 预设名或 `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }` |
| `bindTo` | `string \| HTMLElement` | - | 绑定的元素或选择器（仅 `product="bind"`） |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken` 被拒绝时调用。返回新 token 会重试一次，返回 `null` 则抛出错误 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `success` | `{ token, type, action }` | 验证成功 |
| `error` | `error` | 验证失败 |
| `close` | - | 验证码被关闭 |
| `expired` | - | pass token 在使用前已过期（只触发一次；有监听时代替 `error`；组件会显示已过期）。见 [Token 过期](#token-过期) |
| `ready` | - | 验证码就绪 |

## 调用方法（ref）

```vue
<template>
  <Captchala ref="captchaRef" />
  <button @click="captchaRef?.verify()">验证</button>
</template>

<script setup>
const captchaRef = ref()
</script>
```

| 方法 | 说明 |
|------|------|
| `verify()` | 触发验证 |
| `reset()` | 重置验证码状态 |
| `destroy()` | 销毁验证码实例 |
| `bindTo(selector)` | 绑定到元素（'bind' 模式） |
| `setLang(lang)` | 原地切换语言 |
| `getInstance()` | 底层 SDK 实例 |

组件在浏览器中挂载后 ref 才可用。

## 服务端校验

`validateCaptchalaToken(event, passToken, options?)` 在 `server/` 中自动导入。它使用私有
runtime config 中的 key 和 secret，带 `pass_token` 与 `client_ip` 调用
`POST https://verify.captcha.la/v1/validate`：

```ts
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password, captchaToken } = await readBody(event)

  // captchaToken = @success 返回的 result.token
  const captcha = await validateCaptchalaToken(event, captchaToken)
  if (!captcha.valid) {
    throw createError({ statusCode: 400, statusMessage: 'CAPTCHA verification failed' })
  }
  // token 有效，继续处理请求
})
```

返回 `{ valid, code, message?, data? }`。只有 API 返回 `code: 0` 且 `data.valid: true` 时
`valid` 才为 `true`；缺少 token、网络错误或被拒绝时均为 `valid: false`（失败即拒绝）。选项：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `clientIp` | `string \| false` | 请求 IP | 终端用户 IP；传 `false` 则不发送 |
| `xForwardedFor` | `boolean` | `false` | 从 `X-Forwarded-For` 读取 IP。仅在会设置该头的代理之后开启 |

等价于自己调用 API：

```js
const response = await fetch('https://verify.captcha.la/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': process.env.CAPTCHALA_APP_KEY,
    'X-App-Secret': process.env.CAPTCHALA_APP_SECRET
  },
  // pass_token = @success 返回的 result.token；client_ip 可选但推荐传
  body: JSON.stringify({ pass_token: token, client_ip: clientIp })
})

const result = await response.json()
if (result.code === 0 && result.data.valid === true) {
  // token 有效，继续处理请求
}
```

在 CI 或本地开发中，可以把公开的 [测试 key](https://docs.captcha.la/api-reference#test-keys)
设为 `NUXT_CAPTCHALA_APP_KEY` / `NUXT_CAPTCHALA_APP_SECRET`，无需完成验证即可测试这条路径。

## 生产环境：使用 `serverToken`

生产环境（登录、注册、支付等）推荐使用 **服务端签发 token 流程**。你的服务端通过
`POST /v1/server/challenge/issue` 生成一次性 `server_token`（有效期 5 分钟），浏览器用它
渲染组件。`issueCaptchalaServerToken(event, { action, ttl })` 完成这次调用：

```ts
// server/api/captcha-token.get.ts
export default defineEventHandler(async (event) => ({
  server_token: await issueCaptchalaServerToken(event, { action: 'login' })
}))
```

```vue
<template>
  <Captchala v-if="data" :server-token="data.server_token" action="login" @success="onSuccess" />
  <div v-else>加载中...</div>
</template>

<script setup>
// 每次挂载都在浏览器中获取：每个 token 只能用一次
const { data } = await useFetch('/api/captcha-token', { server: false })

function onSuccess(result) {
  console.log('pass_token:', result.token)
}
</script>
```

注意：
- 永远不要把 `X-App-Secret` 写进浏览器代码。本模块把它保存在私有 runtime config 中。
- 每个 `server_token` 只能使用一次，每次挂载组件前重新获取。
- `server_token_required=false` 的旧应用仍可只用公开 `appKey` 接入。

## Token 过期

`@success` 给出的 pass token 有效期有限。如果用户等待太久才提交，组件会显示验证已过期
（滑条或复选框提示重新验证；`bind` 模式下按钮是你自己的，所以不显示），并触发一次
`@expired`，代替 `@error`。其余行为由你决定，例如显示自己的提示，再调用 `reset()` 和
`verify()` 发起新的验证（与其他验证码组件中 `expired-callback` + `reset()` +
`execute()` 的用法相同）：

```vue
<template>
  <Captchala
    ref="captcha"
    @success="(r) => { token = r.token; expired = false }"
    @expired="() => { token = ''; expired = true }"
  />
  <p v-if="expired">验证已过期。<button @click="verifyAgain">重新验证</button></p>
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

没有 `@expired` 监听时，与之前一样触发一次 `@error`（class 为 `expired`）。离线或降级
token 不会触发 `@expired`。

## 显示模式

```vue
<Captchala product="popup" />  <!-- 按钮，点击弹出验证（默认） -->
<Captchala product="float" />  <!-- 页面内浮动组件 -->
<Captchala product="embed" />  <!-- 嵌入页面 -->
<Captchala product="bind" bind-to="#submit-button" />  <!-- 绑定到你自己的按钮 -->
```

## TypeScript 支持

模块配置有类型（`nuxt.config.ts` 中的 `captchala` 字段），自动导入的服务端工具函数也带类型。
组件类型来自 `@captcha-la/vue`：

```ts
import type { CaptchalaProps, CaptchalaResult } from '@captcha-la/vue'
```

## Playground

[`playground/`](./playground) 是一个小型 Nuxt 应用，包含两个路由和一个校验 token 的服务端
路由。运行 `npm install && npm run dev:prepare && npm run dev`，然后打开
`http://localhost:3000/?appKey=your-app-key`。

## 开源协议

MIT License - 详见 [LICENSE](./LICENSE)。

## 链接

- [官网](https://captcha.la)
- [文档](https://docs.captcha.la/sdk/web)
- [控制台](https://dash.captcha.la)
