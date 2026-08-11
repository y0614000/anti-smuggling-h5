<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string
    label: string
    locked?: boolean
    eager?: boolean
    interactive?: boolean
  }>(),
  {
    locked: false,
    eager: false,
    interactive: true,
  },
)

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    class="map-level-card"
    :class="{
      'map-level-card--locked': locked,
      'map-level-card--inactive': !locked && !interactive,
    }"
    type="button"
    :disabled="locked || !interactive"
    :aria-label="
      locked ? `${label}，尚未解锁` : interactive ? `${label}，可以挑战` : `${label}，已解锁`
    "
    @click="emit('select')"
  >
    <img
      :src="image"
      alt=""
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      draggable="false"
    />
  </button>
</template>

<style scoped>
.map-level-card {
  display: block;
  width: 75%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.map-level-card img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
  -webkit-user-drag: none;
}

.map-level-card:focus-visible {
  border-radius: 10%;
  outline: clamp(2px, 0.55vw, 4px) solid #fff;
  outline-offset: 2px;
}

.map-level-card:not(:disabled):active {
  transform: scale(0.975);
}

.map-level-card--locked,
.map-level-card--inactive {
  cursor: default;
}

@media (prefers-reduced-motion: no-preference) {
  .map-level-card:not(:disabled) {
    transition: transform 120ms ease;
  }
}
</style>
