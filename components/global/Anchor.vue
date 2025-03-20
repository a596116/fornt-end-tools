<script lang="ts" setup>
// micro compiler

const props = withDefaults(
  defineProps<{
    text?: string
    to?: string | object
    href?: string
    duration?: boolean
    hover?: boolean
    target?: '_blank' | '_self' | '_parent' | '_top'
  }>(),
  {
    text: '',
    to: undefined,
    href: '',
    duration: true,
    hover: false,
    target: '_self',
  },
)

// state
const href = toRef(props, 'href')
const to = toRef(props, 'to')
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="target"
    class="cursor-pointer outline-none transition-colors"
    :class="{ 'duration-300': duration, 'hover:text-hd-primary-hover': hover }">
    <slot>{{ text }}</slot>
  </NuxtLink>
  <a
    v-else-if="href"
    class="cursor-pointer outline-none transition-colors"
    :target="target"
    :href="href"
    :class="{ 'duration-300': duration, 'hover:text-hd-primary-hover': hover }">
    <slot>{{ text }}</slot>
  </a>

  <span
    v-else
    class="outline-none transition-colors"
    :class="{ 'duration-300': duration, 'hover:text-hd-primary-hover': hover }">
    <slot>{{ text }}</slot>
  </span>
</template>
