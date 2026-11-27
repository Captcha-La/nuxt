import { defineNuxtModule, createResolver, addComponent, addServerImports } from '@nuxt/kit';
import { defu } from 'defu';

const module$1 = defineNuxtModule({
  meta: {
    name: "@captcha-la/nuxt",
    configKey: "captchala",
    compatibility: { nuxt: ">=3.0.0" }
  },
  defaults: {
    componentName: "Captchala",
    serverUtils: true
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeConfig = nuxt.options.runtimeConfig;
    runtimeConfig.public.captchala = defu(runtimeConfig.public.captchala, {
      appKey: options.appKey || ""
    });
    runtimeConfig.captchala = defu(runtimeConfig.captchala, {
      appKey: options.appKey || "",
      appSecret: options.appSecret || ""
    });
    addComponent({
      name: options.componentName || "Captchala",
      filePath: resolver.resolve("./runtime/components/Captchala.vue"),
      mode: "client"
    });
    nuxt.options.css.push(resolver.resolve("./runtime/captchala.css"));
    if (options.serverUtils !== false) {
      const from = resolver.resolve("./runtime/server/utils/captchala");
      addServerImports([
        { name: "validateCaptchalaToken", from },
        { name: "issueCaptchalaServerToken", from }
      ]);
    }
  }
});

export { module$1 as default };
