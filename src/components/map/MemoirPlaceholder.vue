<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import flipbookImage from '../../assets/memoir/memoir-flipbook-blank.webp'
import backButtonImage from '../../assets/map/back-button-transparent.png'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
let previousBodyOverflow = ''

const close = () => emit('close')

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
      await nextTick()
      dialogRef.value?.focus()
      return
    }

    document.body.style.overflow = previousBodyOverflow
    window.removeEventListener('keydown', handleKeydown)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="memoir-enter">
      <section
        v-if="open"
        ref="dialogRef"
        class="memoir-placeholder"
        role="dialog"
        aria-modal="true"
        aria-label="反走私小专家回忆录"
        tabindex="-1"
      >
        <button class="memoir-placeholder__back" type="button" aria-label="返回冒险地图" @click="close">
          <img :src="backButtonImage" alt="" draggable="false" />
        </button>

        <img
          class="memoir-placeholder__book"
          :src="flipbookImage"
          alt="空白回忆录翻页本"
          draggable="false"
        />
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.memoir-placeholder {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  padding: 0;
  overflow: hidden;
  outline: none;
  background:
    radial-gradient(circle at 50% 22%, rgb(71 192 243 / 62%), transparent 42%),
    linear-gradient(180deg, #087dd5, #075aa5);
  place-items: center;
}

.memoir-placeholder__book {
  display: block;
  width: 104%;
  max-width: none;
  height: 106%;
  max-height: none;
  object-fit: fill;
  filter: drop-shadow(0 0.9rem 1.2rem rgb(0 34 77 / 34%));
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-placeholder__back {
  position: absolute;
  top: calc(1.8% + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 2;
  width: 10.5%;
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  background: #f89b12;
  box-shadow: 0 2px 4px rgb(76 34 0 / 24%);
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.memoir-placeholder__back img {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.memoir-placeholder__back:active {
  transform: scale(0.94);
}

.memoir-placeholder__back:focus-visible {
  outline: clamp(2px, 0.6vw, 4px) solid #fff;
  outline-offset: 2px;
}

.memoir-enter-enter-active,
.memoir-enter-leave-active {
  transition: opacity 220ms ease;
}

.memoir-enter-enter-active .memoir-placeholder__book,
.memoir-enter-leave-active .memoir-placeholder__book {
  transition: transform 260ms cubic-bezier(0.2, 0.86, 0.24, 1);
}

.memoir-enter-enter-from,
.memoir-enter-leave-to {
  opacity: 0;
}

.memoir-enter-enter-from .memoir-placeholder__book,
.memoir-enter-leave-to .memoir-placeholder__book {
  transform: translateY(1rem) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .memoir-enter-enter-active,
  .memoir-enter-leave-active,
  .memoir-enter-enter-active .memoir-placeholder__book,
  .memoir-enter-leave-active .memoir-placeholder__book {
    transition: none;
  }
}
</style>
