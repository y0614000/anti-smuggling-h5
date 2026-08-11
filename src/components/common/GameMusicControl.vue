<script setup lang="ts">
import musicImage from '../../assets/images/music.png'

defineProps<{
  isPlaying: boolean
  label: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    class="game-music-control"
    type="button"
    :aria-label="label"
    :aria-pressed="isPlaying"
    @click="emit('toggle')"
  >
    <img
      :class="{ 'game-music-control__image--playing': isPlaying }"
      :src="musicImage"
      alt=""
      decoding="async"
      draggable="false"
    />
  </button>
</template>

<style scoped>
.game-music-control {
  position: fixed;
  top: calc(0.4% + env(safe-area-inset-top, 0px));
  right: max(1.2%, env(safe-area-inset-right, 0px));
  z-index: 140;
  width: clamp(54px, 17vw, 92px);
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.game-music-control img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transform-origin: 50% 50%;
  filter: drop-shadow(0 2px 3px rgb(91 42 0 / 28%));
}

.game-music-control__image--playing {
  animation: game-music-spin 4s linear infinite;
  will-change: transform;
}

.game-music-control:focus-visible {
  border-radius: 50%;
  outline: 3px solid #fff;
  outline-offset: -8px;
}

.game-music-control:active {
  transform: scale(0.94);
}

@keyframes game-music-spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
