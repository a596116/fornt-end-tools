<template>
  <svg :class="svgClass" v-bind="$attrs" :width="width" :height="height">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    width?: string
    height?: string
    animation?: boolean
  }>(),
  {
    color: '',
    width: '22px',
    height: '22px',
    animation: false,
  },
)

const iconName = computed(() => `#icon-${props.name}`)
const svgClass = computed(() => {
  if (props.name) {
    return `svg-icon icon-${props.name} ${props.animation ? 'hover:animate-move' : ''}`
  }
  return 'svg-icon'
})
</script>

<style lang="scss" scoped>
.svg-icon {
  fill: currentColor;
  vertical-align: middle;
  display: inline-block;
  // transition: all 0.2s ease-in-out;
}
path {
  fill: none;
  stroke: #333333;
  stroke-width: 1;
  stroke-linecap: round;
}
</style>
