import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /**
     * Your public CaptchaLa app key. Used as the default `appKey` of `<Captchala>` and by
     * the server utils. Override at runtime with `NUXT_PUBLIC_CAPTCHALA_APP_KEY`.
     */
    appKey?: string;
    /**
     * Your app secret, for the server utils only; it is never sent to the browser.
     * Prefer the `NUXT_CAPTCHALA_APP_SECRET` environment variable over writing it here.
     */
    appSecret?: string;
    /** Name of the auto-registered component. Default `Captchala`. */
    componentName?: string;
    /** Register the `validateCaptchalaToken` / `issueCaptchalaServerToken` server utils. Default `true`. */
    serverUtils?: boolean;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
