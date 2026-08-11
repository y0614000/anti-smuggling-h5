<script setup lang="ts">
import type { LuggageItem } from '../level1.types'

const props = defineProps<{
  suitcaseImage: string
  items: readonly LuggageItem[]
  foundItemIds: readonly string[]
  inspectedNormalItemIds: readonly string[]
  hintTargetId: string | null
}>()

const itemStyle = (item: LuggageItem) => ({
  left: `${item.position.x}%`,
  top: `${item.position.y}%`,
  width: `${item.position.width}%`,
  zIndex: item.position.zIndex ?? 3,
  '--item-rotation': `${item.position.rotation ?? 0}deg`,
})

const itemClass = (item: LuggageItem) => ({
  'luggage-item--found': props.foundItemIds.includes(item.id),
  'luggage-item--checked': props.inspectedNormalItemIds.includes(item.id),
  'luggage-item--hinted': props.hintTargetId === item.id,
})
</script>

<template>
  <section class="luggage-scene" aria-label="打开的行李箱检查区域">
    <img
      class="luggage-scene__suitcase"
      :src="suitcaseImage"
      alt="打开的蓝色行李箱"
      decoding="async"
      draggable="false"
    />

    <img
      v-for="item in items"
      :key="item.id"
      class="luggage-item"
      :class="itemClass(item)"
      :style="itemStyle(item)"
      :src="item.image"
      alt=""
      decoding="async"
      draggable="false"
    />
  </section>
</template>

<style scoped>
.luggage-scene {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.luggage-scene__suitcase {
  position: absolute;
  top: 24.3%;
  left: 46%;
  z-index: 2;
  display: block;
  width: auto;
  max-width: none;
  height: 46.5%;
  transform: translateX(-50%);
  user-select: none;
  -webkit-user-drag: none;
}

.luggage-item {
  position: absolute;
  display: block;
  height: auto;
  opacity: 1;
  transform: rotate(var(--item-rotation));
  transform-origin: center;
  user-select: none;
  -webkit-user-drag: none;
}

.luggage-item--checked {
  filter: drop-shadow(0 0 0.65rem rgb(93 213 255 / 72%));
}

.luggage-item--found {
  filter: drop-shadow(0 0 0.8rem rgb(255 221 57 / 92%));
}

.luggage-item--hinted {
  filter: drop-shadow(0 0 0.95rem #fff3a0) drop-shadow(0 0 0.7rem #ffc400);
}

@media (prefers-reduced-motion: no-preference) {
  .luggage-item--checked,
  .luggage-item--found {
    animation: level1-item-feedback 480ms cubic-bezier(0.22, 1.25, 0.35, 1);
  }

  .luggage-item--hinted {
    animation: level1-hint-glow 650ms ease-in-out infinite alternate;
  }
}

@keyframes level1-item-feedback {
  45% {
    transform: rotate(var(--item-rotation)) scale(1.08);
  }
}

@keyframes level1-hint-glow {
  to {
    transform: rotate(var(--item-rotation)) scale(1.045);
  }
}
</style>
