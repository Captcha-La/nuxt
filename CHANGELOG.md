# Changelog

## 1.0.0

- Initial release.
- Nuxt module (`captchala` config key) that auto-registers a client-only `<Captchala>`
  component built on `@captcha-la/vue`: same props, events (`success`, `error`, `close`,
  `ready`, `expired`) and ref methods; `app-key` defaults to the module's `appKey`.
- Server utils, auto-imported in `server/`: `validateCaptchalaToken(event, passToken)` calls
  `POST https://verify.captcha.la/v1/validate` with `pass_token` and `client_ip`;
  `issueCaptchalaServerToken(event, { action, ttl })` issues a one-time server token.
  The app secret is read from the private runtime config (`NUXT_CAPTCHALA_APP_SECRET`)
  and never reaches the browser.
- Supports Nuxt 3 (module compatibility `>=3.0.0`).
