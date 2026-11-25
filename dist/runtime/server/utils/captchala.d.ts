import type { H3Event } from 'h3';
export interface CaptchalaValidateOptions {
    /**
     * The end user's IP, sent as `client_ip` (optional but recommended).
     * Default: the request's remote address. Pass `false` to omit it.
     */
    clientIp?: string | false;
    /**
     * Read the IP from `X-Forwarded-For` when `clientIp` is not given. Only enable
     * this behind a proxy that sets the header, since clients can forge it.
     * Default `false`.
     */
    xForwardedFor?: boolean;
}
export interface CaptchalaValidateResult {
    /** True only when the API answered `code: 0` and `data.valid: true`. */
    valid: boolean;
    /** API result code (`0` = success); `-1` = no token given, `-2` = request failed. */
    code: number;
    message?: string;
    /** The API's `data` object. */
    data?: Record<string, any>;
}
export interface CaptchalaIssueOptions {
    /** Business scene the token is for, e.g. `login`. Default `default`. */
    action?: string;
    /** Lifetime in seconds. Default `300`. */
    ttl?: number;
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
export declare function validateCaptchalaToken(event: H3Event, passToken: string | null | undefined, options?: CaptchalaValidateOptions): Promise<CaptchalaValidateResult>;
/**
 * Issues a one-time `server_token` with `POST /v1/server/challenge/issue`, to pass
 * to the widget as `server-token`. Server only. Throws when the request fails.
 */
export declare function issueCaptchalaServerToken(event: H3Event, options?: CaptchalaIssueOptions): Promise<string>;
