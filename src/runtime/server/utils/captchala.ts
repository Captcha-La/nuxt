import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'
import { useRuntimeConfig } from '#imports'

export interface CaptchalaValidateOptions {
  /**
   * The end user's IP, sent as `client_ip` (optional but recommended).
   * Default: the request's remote address. Pass `false` to omit it.
   */
  clientIp?: string | false
  /**
   * Read the IP from `X-Forwarded-For` when `clientIp` is not given. Only enable
   * this behind a proxy that sets the header, since clients can forge it.
   * Default `false`.
   */
  xForwardedFor?: boolean
}

export interface CaptchalaValidateResult {
  /** True only when the API answered `code: 0` and `data.valid: true`. */
  valid: boolean
  /** API result code (`0` = success); `-1` = no token given, `-2` = request failed. */
  code: number
  message?: string
  /** The API's `data` object. */
  data?: Record<string, any>
}

export interface CaptchalaIssueOptions {
  /** Business scene the token is for, e.g. `login`. Default `default`. */
  action?: string
  /** Lifetime in seconds. Default `300`. */
  ttl?: number
}

const API_URL = 'https://verify.captcha.la'

interface Credentials {
  appKey: string
  appSecret: string
}

function credentials(event: H3Event): Credentials {
  const config = useRuntimeConfig(event) as any
  const priv = config.captchala || {}
  const appKey: string = priv.appKey || config.public?.captchala?.appKey || ''
  const appSecret: string = priv.appSecret || ''
  if (!appKey || !appSecret) {
    throw new Error(
      '[@captcha-la/nuxt] Missing app key or secret. Set NUXT_PUBLIC_CAPTCHALA_APP_KEY (or captchala.appKey) and NUXT_CAPTCHALA_APP_SECRET.'
    )
  }
  return { appKey, appSecret }
}

/**
 * Validates a pass token (the `token` from the widget's success event) with
 * `POST /v1/validate`. Server only: the app secret is read from the private
 * runtime config. Fails closed: any error gives `valid: false`.
 *
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const { captchaToken } = await readBody(event)
 *   const result = await validateCaptchalaToken(event, captchaToken)
 *   if (!result.valid) throw createError({ statusCode: 400, statusMessage: 'CAPTCHA failed' })
 * })
 * ```
 */
export async function validateCaptchalaToken(
  event: H3Event,
  passToken: string | null | undefined,
  options: CaptchalaValidateOptions = {}
): Promise<CaptchalaValidateResult> {
  if (!passToken || typeof passToken !== 'string') {
    return { valid: false, code: -1, message: 'Missing pass_token' }
  }
  const { appKey, appSecret } = credentials(event)
  const clientIp =
    options.clientIp === false
      ? undefined
      : options.clientIp || getRequestIP(event, { xForwardedFor: !!options.xForwardedFor })

  try {
    const res: any = await $fetch(`${API_URL}/v1/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': appKey,
        'X-App-Secret': appSecret
      },
      body: clientIp ? { pass_token: passToken, client_ip: clientIp } : { pass_token: passToken },
      ignoreResponseError: true
    })
    const code = typeof res?.code === 'number' ? res.code : -2
    return {
      valid: code === 0 && res?.data?.valid === true,
      code,
      message: res?.message,
      data: res?.data
    }
  } catch (err: any) {
    return { valid: false, code: -2, message: err?.message || 'Validation request failed' }
  }
}

/**
 * Issues a one-time `server_token` with `POST /v1/server/challenge/issue`, to pass
 * to the widget as `server-token`. Server only. Throws when the request fails.
 */
export async function issueCaptchalaServerToken(
  event: H3Event,
  options: CaptchalaIssueOptions = {}
): Promise<string> {
  const { appKey, appSecret } = credentials(event)
  const body = new URLSearchParams({
    action: options.action || 'default',
    ttl: String(options.ttl ?? 300)
  })
  const res: any = await $fetch(`${API_URL}/v1/server/challenge/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-App-Key': appKey,
      'X-App-Secret': appSecret
    },
    body: body.toString(),
    ignoreResponseError: true
  })
  const token = res?.data?.server_token
  if (!token) {
    throw new Error(`[@captcha-la/nuxt] Could not issue a server token: ${res?.message || 'unknown error'}`)
  }
  return token
}
