<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import type { Level1EducationContent } from '../level1.education'

const props = defineProps<{
  content: Level1EducationContent
  backgroundImage: string
  categoryBackgroundImage: string
  sloganBackgroundImage: string
  continueButtonImage: string
  mascotImage: string
}>()

const emit = defineEmits<{
  continue: []
}>()

const continueButton = ref<HTMLButtonElement | null>(null)
const isMascotVisible = ref(false)
let mascotEnterTimer: ReturnType<typeof setTimeout> | undefined
let mascotEnterFrame: number | undefined

const startMascotEntrance = () => {
  clearTimeout(mascotEnterTimer)
  if (mascotEnterFrame !== undefined) window.cancelAnimationFrame(mascotEnterFrame)
  isMascotVisible.value = false

  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 500
  mascotEnterTimer = setTimeout(() => {
    mascotEnterFrame = window.requestAnimationFrame(() => {
      isMascotVisible.value = true
    })
  }, delay)
}

watch(
  () => props.content.itemId,
  async () => {
    startMascotEntrance()
    await nextTick()
    continueButton.value?.focus({ preventScroll: true })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearTimeout(mascotEnterTimer)
  if (mascotEnterFrame !== undefined) window.cancelAnimationFrame(mascotEnterFrame)
})
</script>

<template>
  <div class="education-overlay" role="presentation">
    <article
      class="education-card"
      :class="`education-card--${content.itemId}`"
      role="dialog"
      aria-modal="true"
      :aria-label="`发现可疑物品：${content.itemName}`"
    >
      <img
        class="education-card__background"
        :src="backgroundImage"
        alt=""
        decoding="async"
        draggable="false"
      />

      <section class="education-card__hero" :aria-label="content.itemName">
        <img class="education-card__item" :src="content.itemIcon" alt="" draggable="false" />
        <div class="education-card__summary">
          <h2>{{ content.itemName }}</h2>
          <div class="education-card__category">
            <img :src="categoryBackgroundImage" alt="" draggable="false" />
            <span>{{ content.category }}</span>
          </div>
        </div>
      </section>

      <div class="education-card__sections">
        <section
          v-for="section in content.sections"
          :key="section.title"
          class="education-card__section"
        >
          <img :src="section.icon" alt="" draggable="false" />
          <div>
            <h3>{{ section.title }}</h3>
            <p>{{ section.body }}</p>
          </div>
        </section>
      </div>

      <div class="education-card__slogan" aria-label="通关口诀">
        <img :src="sloganBackgroundImage" alt="" draggable="false" />
        <strong>{{ content.slogan }}</strong>
      </div>

      <button
        ref="continueButton"
        class="education-card__continue"
        type="button"
        aria-label="我知道了，继续检查"
        @click="emit('continue')"
      >
        <img :src="continueButtonImage" alt="" draggable="false" />
      </button>

      <img
        class="education-card__mascot"
        :class="{ 'education-card__mascot--visible': isMascotVisible }"
        :src="mascotImage"
        alt=""
        draggable="false"
      />
    </article>
  </div>
</template>

<style scoped>
.education-overlay {
  position: absolute;
  inset: 0;
  z-index: 95;
  display: grid;
  padding:
    max(2%, env(safe-area-inset-top, 0px))
    3%
    max(2%, env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  place-items: center;
  background: rgb(8 31 57 / 68%);
}

.education-card {
  position: relative;
  width: min(88vw, 57.58vh, 440px);
  width: min(88vw, 57.58dvh, 440px);
  filter: drop-shadow(0 0.75rem 1rem rgb(8 31 57 / 38%));
}

.education-card__background {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.education-card__hero {
  position: absolute;
  top: 17.2%;
  right: 7.5%;
  left: 7.5%;
  display: grid;
  height: 20.7%;
  grid-template-columns: 51% 49%;
  align-items: center;
}

.education-card__item {
  display: block;
  width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.education-card__summary {
  display: grid;
  gap: 0.65rem;
  align-content: center;
  min-width: 0;
  padding-left: 3%;
  color: #56230f;
  text-align: left;
}

.education-card__summary h2 {
  margin: 0;
  font-size: clamp(15px, 4.3vw, 23px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: 0.02em;
}

.education-card--tropical-fruit .education-card__hero {
  top: 16.7%;
  height: 20.2%;
  grid-template-columns: 47% 53%;
}

.education-card--tropical-fruit .education-card__item {
  width: 86%;
  max-height: 91%;
  transform: translateY(-2.5%);
  justify-self: center;
}

.education-card--tropical-fruit .education-card__summary {
  gap: 0.52rem;
  padding-left: 0;
}

.education-card--tropical-fruit .education-card__summary h2 {
  font-size: clamp(14px, 4vw, 22px);
  white-space: nowrap;
}

.education-card--tropical-fruit .education-card__category {
  width: 94%;
}

.education-card__category {
  position: relative;
  width: 100%;
}

.education-card__category img,
.education-card__slogan img,
.education-card__continue img {
  display: block;
  width: 100%;
  height: auto;
}

.education-card__category span {
  position: absolute;
  inset: 0;
  display: grid;
  padding-bottom: 1%;
  place-items: center;
  color: #fff;
  font-size: clamp(11px, 3.25vw, 17px);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgb(127 47 0 / 55%);
}

.education-card__sections {
  position: absolute;
  top: 40.3%;
  right: 6.7%;
  left: 6.7%;
  display: grid;
  height: 34.2%;
  gap: 1.15%;
  grid-template-rows: repeat(3, 1fr);
}

.education-card__section {
  display: grid;
  min-height: 0;
  padding: 1.2% 2.8% 1.2% 2.1%;
  border: clamp(1px, 0.25vw, 2px) solid #edb86c;
  border-radius: clamp(12px, 3.3vw, 21px);
  background: rgb(255 248 225 / 72%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 75%);
  grid-template-columns: 17% 1fr;
  align-items: center;
  color: #4b2110;
}

.education-card__section > img {
  display: block;
  width: 84%;
  justify-self: center;
}

.education-card__section > div {
  min-width: 0;
}

.education-card__section h3 {
  margin: 0 0 0.16em;
  font-size: clamp(11px, 3.1vw, 16px);
  font-weight: 900;
  line-height: 1.05;
}

.education-card__section p {
  margin: 0;
  font-size: clamp(8.5px, 2.35vw, 12.5px);
  font-weight: 650;
  line-height: 1.32;
}

.education-card__slogan {
  position: absolute;
  top: 76.3%;
  right: 7.2%;
  left: 7.2%;
}

.education-card__slogan strong {
  position: absolute;
  inset: 0;
  display: grid;
  padding-bottom: 1%;
  place-items: center;
  color: #7b3600;
  font-size: clamp(13px, 3.75vw, 20px);
  font-weight: 950;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 1px 0 #fff1a9;
}

.education-card__continue {
  position: absolute;
  top: 84.7%;
  left: 19%;
  z-index: 2;
  width: 62%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.education-card__continue:focus-visible {
  border-radius: 999px;
  outline: none;
  filter: brightness(1.04) drop-shadow(0 0 3px rgb(255 192 48 / 75%));
}

.education-card__continue:active {
  transform: scale(0.96);
}

.education-card__mascot {
  position: absolute;
  right: -5.5%;
  bottom: -4.7%;
  z-index: 3;
  display: block;
  width: 33%;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(82%, 48%, 0) scale(0.86);
  transform-origin: 100% 100%;
  user-select: none;
  -webkit-user-drag: none;
}

.education-card__mascot--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: no-preference) {
  .education-overlay {
    animation: education-overlay-in 180ms ease-out both;
  }

  .education-card {
    animation: education-card-in 420ms cubic-bezier(0.22, 1.25, 0.35, 1) both;
  }

  .education-card__mascot {
    transition:
      transform 620ms cubic-bezier(0.2, 0.88, 0.24, 1),
      opacity 240ms ease-out;
    will-change: transform, opacity;
  }
}

@keyframes education-overlay-in {
  from {
    opacity: 0;
  }
}

@keyframes education-card-in {
  from {
    opacity: 0;
    transform: translateY(5%) scale(0.88);
  }
}
</style>
