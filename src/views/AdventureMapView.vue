<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import MapGuideBubble from '../components/map/MapGuideBubble.vue'
import MapLevelCard from '../components/map/MapLevelCard.vue'
import characterImage from '../assets/images/ip-opening-static.webp'
import headerImage from '../assets/map/adventure-map-header.png'
import backgroundImage from '../assets/map/anti-smuggling-adventure-map-background.png'
import backButtonImage from '../assets/map/back-button-transparent.png'
import dialogBubbleImage from '../assets/map/dialog-bubble.png'
import expertLockedImage from '../assets/map/anti-smuggling-expert-locked.png'
import expertUnlockedImage from '../assets/map/anti-smuggling-expert-unlocked.png'
import level1Image from '../assets/map/level-1-luggage-check.png'
import level1CompletedImage from '../assets/map/level-1-luggage-check-completed.png'
import level2Image from '../assets/map/level-2-package-identification.png'
import level2CompletedImage from '../assets/map/level-2-package-identification-completed.png'
import level2UnlockedImage from '../assets/map/level-2-package-identification-unlocked.png'
import level3Image from '../assets/map/level-3-harbor-patrol-v2.png'
import level3CompletedImage from '../assets/map/level-3-harbor-patrol-completed.png'
import level3UnlockedImage from '../assets/map/level-3-harbor-patrol-unlocked.png'
import routeLockImage from '../assets/map/route-lock.png'

const props = withDefaults(
  defineProps<{
    completedLevelCount?: number
  }>(),
  {
    completedLevelCount: 0,
  },
)

const emit = defineEmits<{
  back: []
  selectLevel: [level: number]
}>()

const isBackgroundReady = ref(false)
const isCharacterReady = ref(false)
const isCharacterVisible = ref(false)
const isGuideVisible = ref(false)
const shouldTypeGuide = ref(false)
const isExpertUnlocked = computed(() => props.completedLevelCount >= 3)
const expertImage = computed(() =>
  isExpertUnlocked.value ? expertUnlockedImage : expertLockedImage,
)
const displayedLevel1Image = computed(() =>
  props.completedLevelCount >= 1 ? level1CompletedImage : level1Image,
)
const isLevel2Unlocked = computed(() => props.completedLevelCount >= 1)
const isLevel3Unlocked = computed(() => props.completedLevelCount >= 2)
const displayedLevel2Image = computed(() => {
  if (props.completedLevelCount >= 2) return level2CompletedImage
  return isLevel2Unlocked.value ? level2UnlockedImage : level2Image
})
const displayedLevel3Image = computed(() => {
  if (props.completedLevelCount >= 3) return level3CompletedImage
  return isLevel3Unlocked.value ? level3UnlockedImage : level3Image
})
const guideText = computed(() => {
  if (props.completedLevelCount >= 3) return '三个任务完成！\n你真棒！'
  if (props.completedLevelCount >= 2) return '第二关完成啦！\n去挑战第三关吧！'
  if (props.completedLevelCount >= 1) return '第一关完成啦！\n去挑战第二关吧！'
  return '先从第一关\n行李检查开始吧！'
})

const CHARACTER_ENTER_DURATION_MS = 650
const BUBBLE_ENTER_DURATION_MS = 280
const sequenceTimers: Array<ReturnType<typeof setTimeout>> = []
let sequenceFrame: number | undefined
let hasStartedGuideSequence = false

const startGuideSequence = () => {
  if (hasStartedGuideSequence || !isBackgroundReady.value || !isCharacterReady.value) return

  hasStartedGuideSequence = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isCharacterVisible.value = true
    isGuideVisible.value = true
    shouldTypeGuide.value = true
    return
  }

  sequenceFrame = window.requestAnimationFrame(() => {
    isCharacterVisible.value = true
  })

  sequenceTimers.push(
    setTimeout(() => {
      isGuideVisible.value = true
    }, CHARACTER_ENTER_DURATION_MS),
    setTimeout(() => {
      shouldTypeGuide.value = true
    }, CHARACTER_ENTER_DURATION_MS + BUBBLE_ENTER_DURATION_MS),
  )
}

const revealBackground = () => {
  isBackgroundReady.value = true
  startGuideSequence()
}

const revealCharacter = () => {
  isCharacterReady.value = true
  startGuideSequence()
}

onBeforeUnmount(() => {
  sequenceTimers.forEach((timer) => clearTimeout(timer))

  if (sequenceFrame !== undefined) {
    window.cancelAnimationFrame(sequenceFrame)
  }
})
</script>

<template>
  <main class="adventure-map-screen" aria-label="反走私冒险地图">
    <section class="map-canvas" :class="{ 'map-canvas--ready': isBackgroundReady }">
      <img
        class="map-background"
        :src="backgroundImage"
        alt=""
        fetchpriority="high"
        decoding="async"
        draggable="false"
        @load="revealBackground"
        @error="revealBackground"
      />

      <div v-if="!isBackgroundReady" class="map-loading" aria-live="polite">
        <span></span>
        <p>地图加载中…</p>
      </div>

      <img
        class="map-header"
        :src="headerImage"
        alt="反走私冒险地图，完成3个任务，集齐专属道具"
        fetchpriority="high"
        decoding="async"
        draggable="false"
      />

      <button class="map-back" type="button" aria-label="返回首页" @click="emit('back')">
        <img :src="backButtonImage" alt="" draggable="false" />
      </button>

      <img
        class="map-expert"
        :src="expertImage"
        :alt="isExpertUnlocked ? '反走私小专家，已解锁' : '反走私小专家，集齐3个道具解锁'"
        decoding="async"
        draggable="false"
      />

      <div class="map-level map-level--three">
        <MapLevelCard
          :image="displayedLevel3Image"
          label="第三关港口巡查"
          :locked="!isLevel3Unlocked"
          :interactive="false"
        />
      </div>
      <img
        v-if="!isLevel3Unlocked"
        class="route-lock route-lock--upper"
        :src="routeLockImage"
        alt=""
        loading="lazy"
        decoding="async"
        draggable="false"
      />

      <div class="map-level map-level--two">
        <MapLevelCard
          :image="displayedLevel2Image"
          label="第二关包裹辨别"
          :locked="!isLevel2Unlocked"
          :interactive="false"
        />
      </div>
      <img
        v-if="!isLevel2Unlocked"
        class="route-lock route-lock--lower"
        :src="routeLockImage"
        alt=""
        loading="lazy"
        decoding="async"
        draggable="false"
      />

      <div class="map-level map-level--one">
        <MapLevelCard
          :image="displayedLevel1Image"
          label="第一关行李检查"
          eager
          @select="emit('selectLevel', 1)"
        />
      </div>

      <div class="map-guide" :class="{ 'map-guide--visible': isGuideVisible }">
        <MapGuideBubble
          :image="dialogBubbleImage"
          :text="guideText"
          :start-typing="shouldTypeGuide"
        />
      </div>
      <img
        class="map-character"
        :class="{ 'map-character--visible': isCharacterVisible }"
        :src="characterImage"
        alt="国门小卫士为你指引第一关"
        loading="eager"
        decoding="async"
        draggable="false"
        @load="revealCharacter"
        @error="revealCharacter"
      />
    </section>
  </main>
</template>

<style scoped>
.adventure-map-screen {
  display: grid;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  place-items: center;
  overscroll-behavior: none;
  background: #0879d4;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.adventure-map-screen::-webkit-scrollbar {
  display: none;
}

.map-canvas {
  /* 三个关卡合成图的尺寸独立控制，修改对应变量不会影响其他关卡。 */
  --level-one-width: 55.5%;
  --level-two-width: 50.4%;
  --level-three-width: 49.2%;

  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: linear-gradient(#087fe0 0 23%, #1ca8e8 34%, #7fbf37 61%, #5fa828 100%);
  isolation: isolate;
}

.map-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0;
  pointer-events: none;
}

.map-canvas--ready .map-background {
  opacity: 1;
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  place-content: center;
  background: #087fdc;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.map-loading span {
  width: 34px;
  height: 34px;
  margin: 0 auto;
  border: 4px solid rgb(255 255 255 / 42%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: map-loading-spin 800ms linear infinite;
}

.map-loading p {
  margin: 10px 0 0;
}

@keyframes map-loading-spin {
  to {
    transform: rotate(1turn);
  }
}

.map-header {
  position: absolute;
  top: 1.15%;
  left: 14%;
  z-index: 3;
  display: block;
  width: 72%;
  height: auto;
  pointer-events: none;
}

.map-back {
  position: absolute;
  top: calc(1.8% + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 5;
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

.map-back img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.map-back:focus-visible {
  outline: clamp(2px, 0.6vw, 4px) solid #fff;
  outline-offset: 2px;
}

.map-back:active {
  transform: scale(0.94);
}

.map-expert {
  position: absolute;
  top: 15.8%;
  right: -1.2%;
  z-index: 2;
  display: block;
  width: 42%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.map-level {
  position: absolute;
  z-index: 2;
}

.map-level--three {
  top: 23.8%;
  left: 2.4%;
  width: var(--level-three-width);
}

.map-level--two {
  top: 43.1%;
  right: -0.6%;
  width: var(--level-two-width);
}

.map-level--one {
  top: 63.4%;
  left: 1.2%;
  width: var(--level-one-width);
}

.route-lock {
  position: absolute;
  z-index: 3;
  display: block;
  width: 7.6%;
  height: auto;
  pointer-events: none;
}

.route-lock--upper {
  top: 42.6%;
  left: 48.4%;
}

.route-lock--lower {
  top: 56.8%;
  left: 39.1%;
}

.map-guide {
  position: absolute;
  right: 35.5%;
  bottom: 1.25%;
  z-index: 5;
  width: 35.5%;
  /* height: 6.55%; */
  opacity: 0;
  transform: translateY(18%) scale(0.86);
  transform-origin: 70% 100%;
  pointer-events: none;
}

.map-guide--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.map-character {
  position: absolute;
  right: -1.7%;
  bottom: -9.7%;
  z-index: 6;
  display: block;
  width: 39.5%;
  height: auto;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(72%, 28%, 0) scale(0.88);
  transform-origin: 100% 100%;
  filter: drop-shadow(0 0.35vw 0.45vw rgb(85 41 6 / 20%));
}

.map-character--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: no-preference) {
  .map-background {
    transition: opacity 180ms ease-out;
  }

  .map-back {
    transition: transform 100ms ease, box-shadow 100ms ease;
  }

  .map-character {
    transition:
      transform 650ms cubic-bezier(0.2, 0.86, 0.24, 1),
      opacity 260ms ease-out;
    will-change: transform, opacity;
  }

  .map-guide {
    transition:
      transform 280ms cubic-bezier(0.22, 1.2, 0.36, 1),
      opacity 180ms ease-out;
    will-change: transform, opacity;
  }
}

@media (min-width: 481px) {
  .adventure-map-screen {
    background: #076ec5;
  }
}
</style>
