# @captcha-la/nuxt playground

`/` shows the client-only `<Captchala>` component (float mode) and a button that sends
the pass token to `server/api/validate.post.ts`, which calls `validateCaptchalaToken()`.
`/other` has no CAPTCHA, so switching routes destroys and re-creates the widget.

```bash
# in the repository root
npm install
npm run dev:prepare
NUXT_CAPTCHALA_APP_SECRET=your-app-secret npm run dev   # http://localhost:3000/?appKey=your-app-key
```

`NUXT_CAPTCHALA_APP_KEY` sets the key used by the server utils (it defaults to the public
`appKey`). Add `&serverToken=...` to the URL to pass a server-issued token.
