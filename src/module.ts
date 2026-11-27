import { addComponent, addServerImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * Your public CaptchaLa app key. Used as the default `appKey` of `<Captchala>` and by
   * the server utils. Override at runtime with `NUXT_PUBLIC_CAPTCHALA_APP_KEY`.
   */
  appKey?: string
  /**
   * Your app secret, for the server utils only; it is never sent to the browser.
   * Prefer the `NUXT_CAPTCHALA_APP_SECRET` environment variable over writing it here.
   */
  appSecret?: string
  /** Name of the auto-registered component. Default `Captchala`. */
  componentName?: string
  /** Register the `validateCaptchalaToken` / `issueCaptchalaServerToken` server utils. Default `true`. */
  serverUtils?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@captcha-la/nuxt',
    configKey: 'captchala',
    compatibility: { nuxt: '>=3.0.0' }
  },
  defaults: {
    componentName: 'Captchala',
    serverUtils: true
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig

    // Public: only the app key.
    runtimeConfig.public.captchala = defu(runtimeConfig.public.captchala as any, {
      appKey: options.appKey || ''
    })
    // Private (server only): key and secret.
    runtimeConfig.captchala = defu(runtimeConfig.captchala as any, {
      appKey: options.appKey || '',
      appSecret: options.appSecret || ''
    })

    // Client-only: nothing is rendered on the server, the SDK loads in the browser.
    addComponent({
      name: options.componentName || 'Captchala',
      filePath: resolver.resolve('./runtime/components/Captchala.vue'),
      mode: 'client'
    })
    nuxt.options.css.push(resolver.resolve('./runtime/captchala.css'))

    if (options.serverUtils !== false) {
      const from = resolver.resolve('./runtime/server/utils/captchala')
      addServerImports([
        { name: 'validateCaptchalaToken', from },
        { name: 'issueCaptchalaServerToken', from }
      ])
    }
  }
})
