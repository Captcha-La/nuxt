<script setup lang="ts">
import { computed, ref } from 'vue'
import { Captchala as CaptchalaVue } from '@captcha-la/vue'
import { useRuntimeConfig } from '#imports'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Defaults to `captchala.appKey` from the module options / runtime config. */
  appKey?: string
}>()

const config = useRuntimeConfig()
const resolvedAppKey = computed(
  () => props.appKey || (config.public.captchala as { appKey?: string } | undefined)?.appKey || ''
)

const inner = ref<InstanceType<typeof CaptchalaVue> | null>(null)

defineExpose({
  verify: () => inner.value?.verify(),
  reset: () => inner.value?.reset(),
  destroy: () => inner.value?.destroy(),
  bindTo: (selector: string | HTMLElement) => inner.value?.bindTo(selector),
  setLang: (lang: string) => inner.value?.setLang(lang),
  getInstance: () => inner.value?.getInstance()
})
</script>

<template>
  <!-- All other props and listeners (@success, @error, @expired, ...) pass through. -->
  <CaptchalaVue ref="inner" v-bind="$attrs" :app-key="resolvedAppKey" />
</template>
