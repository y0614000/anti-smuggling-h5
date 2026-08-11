<script setup lang="ts">
import type { LuggageItem } from '../level1.types'

const props = defineProps<{
  backgroundImage: string
  items: readonly LuggageItem[]
  foundItemIds: readonly string[]
}>()

const SLOT_TOP_POSITIONS = [5.5, 38.833, 67.166] as const
const isFound = (item: LuggageItem) => props.foundItemIds.includes(item.id)
const slotStyle = (item: LuggageItem) => ({
  top: `${SLOT_TOP_POSITIONS[item.clueIndex ?? 0] ?? SLOT_TOP_POSITIONS[0]}%`,
})
</script>

<template>
  <aside class="clue-slots" aria-label="已发现的可疑物品">
    <img class="clue-slots__frame" :src="backgroundImage" alt="三个线索槽" decoding="async" />
    <div
      v-for="item in items"
      :key="item.id"
      class="clue-slots__slot"
      :class="{ 'clue-slots__slot--found': isFound(item) }"
      :style="slotStyle(item)"
    >
      <img v-if="isFound(item)" :src="item.image" :alt="`已找到：${item.name}`" decoding="async" />
    </div>
  </aside>
</template>

<style scoped>
.clue-slots {
  position: absolute;
  top: 36.2%;
  right: 0.7%;
  z-index: 14;
  width: 14.2%;
  pointer-events: none;
}

.clue-slots__frame {
  display: block;
  width: 100%;
  height: auto;
}

.clue-slots__slot {
  position: absolute;
  left: 14%;
  display: grid;
  width: 70%;
  height: 29.5%;
  place-items: center;
}

.clue-slots__slot img {
  display: block;
  width: 112%;
  height: 112%;
  object-fit: contain;
  filter: drop-shadow(0 0.2rem 0.15rem rgb(97 48 14 / 25%));
}

@media (prefers-reduced-motion: no-preference) {
  .clue-slots__slot--found img {
    animation: level1-slot-reveal 520ms cubic-bezier(0.2, 1.3, 0.35, 1);
  }
}

@keyframes level1-slot-reveal {
  from {
    opacity: 0;
    transform: scale(0.45);
  }

  65% {
    transform: scale(1.12);
  }
}
</style>
