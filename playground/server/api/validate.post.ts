// validateCaptchalaToken() is auto-imported by the module (server only).
export default defineEventHandler(async (event) => {
  const { token } = await readBody<{ token?: string }>(event)
  return await validateCaptchalaToken(event, token)
})
