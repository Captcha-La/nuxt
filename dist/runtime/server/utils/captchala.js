import { getRequestIP } from "h3";
import { useRuntimeConfig } from "#imports";
function credentials(event) {
  const config = useRuntimeConfig(event);
  const priv = config.captchala || {};
  const appKey = priv.appKey || config.public?.captchala?.appKey || "";
  const appSecret = priv.appSecret || "";
  if (!appKey || !appSecret) {
    throw new Error(
      "[@captcha-la/nuxt] Missing app key or secret. Set NUXT_PUBLIC_CAPTCHALA_APP_KEY (or captchala.appKey) and NUXT_CAPTCHALA_APP_SECRET."
    );
  }
  const baseUrl = String(priv.verifyUrl || "https://verify.captcha.la").replace(/\/+$/, "");
  return { appKey, appSecret, baseUrl };
}
export async function validateCaptchalaToken(event, passToken, options = {}) {
  if (!passToken || typeof passToken !== "string") {
    return { valid: false, code: -1, message: "Missing pass_token" };
  }
  const { appKey, appSecret, baseUrl } = credentials(event);
  const clientIp = options.clientIp === false ? void 0 : options.clientIp || getRequestIP(event, { xForwardedFor: !!options.xForwardedFor });
  try {
    const res = await $fetch(`${baseUrl}/v1/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Key": appKey,
        "X-App-Secret": appSecret
      },
      body: clientIp ? { pass_token: passToken, client_ip: clientIp } : { pass_token: passToken },
      ignoreResponseError: true
    });
    const code = typeof res?.code === "number" ? res.code : -2;
    return {
      valid: code === 0 && res?.data?.valid === true,
      code,
      message: res?.message,
      data: res?.data
    };
  } catch (err) {
    return { valid: false, code: -2, message: err?.message || "Validation request failed" };
  }
}
export async function issueCaptchalaServerToken(event, options = {}) {
  const { appKey, appSecret, baseUrl } = credentials(event);
  const body = new URLSearchParams({
    action: options.action || "default",
    ttl: String(options.ttl ?? 300)
  });
  const res = await $fetch(`${baseUrl}/v1/server/challenge/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-App-Key": appKey,
      "X-App-Secret": appSecret
    },
    body: body.toString(),
    ignoreResponseError: true
  });
  const token = res?.data?.server_token;
  if (!token) {
    throw new Error(`[@captcha-la/nuxt] Could not issue a server token: ${res?.message || "unknown error"}`);
  }
  return token;
}
