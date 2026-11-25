<script setup>
import { computed, ref } from "vue";
import { Captchala as CaptchalaVue } from "@captcha-la/vue";
import { useRuntimeConfig } from "#imports";
defineOptions({ inheritAttrs: false });
const props = defineProps({
  appKey: { type: String, required: false }
});
const config = useRuntimeConfig();
const resolvedAppKey = computed(
  () => props.appKey || config.public.captchala?.appKey || ""
);
const inner = ref(null);
defineExpose({
  verify: () => inner.value?.verify(),
  reset: () => inner.value?.reset(),
  destroy: () => inner.value?.destroy(),
  bindTo: (selector) => inner.value?.bindTo(selector),
  setLang: (lang) => inner.value?.setLang(lang),
  getInstance: () => inner.value?.getInstance()
});
</script>

<template>
  <!-- All other props and listeners (@success, @error, @expired, ...) pass through. -->
  <CaptchalaVue ref="inner" v-bind="$attrs" :app-key="resolvedAppKey" />
</template>
