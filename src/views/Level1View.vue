<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import ClueSlots from '../features/level1/components/ClueSlots.vue'
import DraggableMagnifier from '../features/level1/components/DraggableMagnifier.vue'
import ExitConfirmModal from '../features/level1/components/ExitConfirmModal.vue'
import Level1EducationModal from '../features/level1/components/Level1EducationModal.vue'
import Level1GuideDock from '../features/level1/components/Level1GuideDock.vue'
import Level1Hud from '../features/level1/components/Level1Hud.vue'
import Level1ResultModal from '../features/level1/components/Level1ResultModal.vue'
import LuggageScene from '../features/level1/components/LuggageScene.vue'
import {
  level1Assets,
  level1CriticalAssetUrls,
  level1DeferredAssetUrls,
} from '../features/level1/level1.assets'
import {
  ITEM_HIT_DWELL_MS,
  LEVEL1_SUSPICIOUS_TOTAL,
  suspiciousItems,
} from '../features/level1/level1.config'
import {
  level1EducationByItemId,
  type Level1EducationContent,
} from '../features/level1/level1.education'
import { findItemAtPoint } from '../features/level1/level1.logic'
import type { LuggageItem, NormalizedPoint } from '../features/level1/level1.types'
import { useLevel1Game } from '../features/level1/useLevel1Game'
import { deferImagePreload, preloadImages } from '../features/level1/useAssetPreload'

const emit = defineEmits<{
  back: []
  complete: []
  countdown: [remainingSeconds: number]
  countdownStop: []
  success: []
}>()

const {
  state,
  items,
  markReady,
  startGame,
  inspectItem,
  requestHint,
  pauseGame,
  resumeGame,
  resetGame,
} = useLevel1Game()

const foundCount = computed(() => state.foundItemIds.length)
const hintTarget = computed<NormalizedPoint | null>(() => {
  const item = items.find((candidate) => candidate.id === state.hintTargetId)
  return item ? { x: item.hitArea.x, y: item.hitArea.y } : null
})
const isHintDisabled = computed(
  () =>
    state.status !== 'playing' ||
    state.hintCoolingDown ||
    state.hintsRemaining <= 0 ||
    foundCount.value >= LEVEL1_SUSPICIOUS_TOTAL,
)

const showExitConfirm = ref(false)
const educationContent = ref<Level1EducationContent | null>(null)
const magnifierResetKey = ref(0)
const scanPulseKey = ref(0)
const guideRevealKey = ref(0)
let isMounted = true
let dwellTimer: ReturnType<typeof setTimeout> | undefined
let activeDwellItemId: string | null = null
let latestMagnifierPoint: NormalizedPoint | null = null
let cancelDeferredPreload: (() => void) | undefined

const isAlreadyInspected = (item: LuggageItem) =>
  item.suspicious
    ? state.foundItemIds.includes(item.id)
    : state.inspectedNormalItemIds.includes(item.id)

const clearDwellDetection = () => {
  clearTimeout(dwellTimer)
  dwellTimer = undefined
  activeDwellItemId = null
}

const completeDwellInspection = (item: LuggageItem) => {
  if (state.status !== 'playing' || isAlreadyInspected(item) || !latestMagnifierPoint) return
  if (findItemAtPoint(latestMagnifierPoint, items)?.id !== item.id) return

  const outcome = inspectItem(item)
  if (outcome === 'suspicious' || outcome === 'success') {
    scanPulseKey.value += 1
    educationContent.value = level1EducationByItemId[item.id] ?? null
    if (outcome === 'suspicious' && educationContent.value) pauseGame()
    if (outcome === 'success' && !educationContent.value) emit('success')
  }
  if (outcome === 'normal') guideRevealKey.value += 1
  activeDwellItemId = null
}

const handleMagnifierPosition = (point: NormalizedPoint) => {
  latestMagnifierPoint = point
  if (state.status !== 'playing') {
    clearDwellDetection()
    return
  }

  const item = findItemAtPoint(point, items)
  if (!item || isAlreadyInspected(item)) {
    clearDwellDetection()
    return
  }

  if (activeDwellItemId === item.id) return

  clearDwellDetection()
  activeDwellItemId = item.id
  dwellTimer = setTimeout(() => completeDwellInspection(item), ITEM_HIT_DWELL_MS)
}

const handleHint = () => {
  requestHint()
}

const handleGuideIntroComplete = () => {
  startGame()
  if (!cancelDeferredPreload) cancelDeferredPreload = deferImagePreload(level1DeferredAssetUrls)
}

const handleBack = () => {
  if (state.status !== 'playing' && state.status !== 'paused') {
    emit('back')
    return
  }

  pauseGame()
  clearDwellDetection()
  showExitConfirm.value = true
}

const cancelExit = () => {
  showExitConfirm.value = false
  resumeGame()
}

const confirmExit = () => emit('back')

const restartGame = () => {
  clearDwellDetection()
  educationContent.value = null
  latestMagnifierPoint = null
  magnifierResetKey.value += 1
  guideRevealKey.value = 0
  resetGame()
}

const claimReward = () => emit('complete')

const continueAfterEducation = () => {
  const shouldResume = state.status === 'paused'
  const shouldRevealSuccess = state.status === 'success'
  educationContent.value = null
  if (shouldRevealSuccess) emit('success')
  if (shouldResume) resumeGame()
}

watch(
  () => state.status,
  (status) => {
    if (status !== 'playing') clearDwellDetection()
  },
)

watch(
  [() => state.status, () => state.remainingSeconds],
  ([status, remainingSeconds], [previousStatus, previousRemainingSeconds]) => {
    if (status !== 'playing') {
      if (previousStatus === 'playing') emit('countdownStop')
      return
    }

    const enteredFinalCountdown =
      remainingSeconds >= 1 &&
      remainingSeconds <= 3 &&
      (previousStatus !== 'playing' || previousRemainingSeconds > 3)

    if (enteredFinalCountdown) emit('countdown', remainingSeconds)
  },
)

onMounted(async () => {
  await preloadImages(level1CriticalAssetUrls)
  if (!isMounted) return

  markReady()
})

onBeforeUnmount(() => {
  isMounted = false
  emit('countdownStop')
  clearDwellDetection()
  cancelDeferredPreload?.()
})
</script>

<template>
  <main class="level1-screen" aria-label="第一关：行李检查">
    <section class="level1-canvas" :class="`level1-canvas--${state.status}`">
      <img
        class="level1-background"
        :src="level1Assets.background"
        alt="海关行李查验区"
        fetchpriority="high"
        decoding="async"
        draggable="false"
      />

      <header class="level1-header">
        <button type="button" aria-label="返回冒险地图" @click="handleBack">
          <img :src="level1Assets.backButton" alt="" decoding="async" draggable="false" />
        </button>
        <h1 class="level1-header__semantic-title">第一关 · 行李检查</h1>
        <img
          class="level1-header__title-image"
          :src="level1Assets.titleBanner"
          alt=""
          fetchpriority="high"
          decoding="async"
          draggable="false"
        />
      </header>

      <Level1Hud
        :background-image="level1Assets.progressTimer"
        :found-count="foundCount"
        :total="LEVEL1_SUSPICIOUS_TOTAL"
        :remaining-seconds="state.remainingSeconds"
      />

      <LuggageScene
        :suitcase-image="level1Assets.emptySuitcase"
        :items="items"
        :found-item-ids="state.foundItemIds"
        :inspected-normal-item-ids="state.inspectedNormalItemIds"
        :hint-target-id="state.hintTargetId"
      />

      <ClueSlots
        :background-image="level1Assets.clueSlots"
        :items="suspiciousItems"
        :found-item-ids="state.foundItemIds"
      />

      <DraggableMagnifier
        :image="level1Assets.draggableMagnifier"
        :status="state.status"
        :reset-key="magnifierResetKey"
        :hint-target="hintTarget"
        :scan-pulse-key="scanPulseKey"
        @position="handleMagnifierPosition"
      />

      <Level1GuideDock
        :bubble-image="level1Assets.guideBubble"
        :mascot-image="level1Assets.guideMascot"
        :hint-button-image="level1Assets.hintButton"
        :message="state.guideMessage"
        :hint-disabled="isHintDisabled"
        :hints-remaining="state.hintsRemaining"
        :start-sequence="state.status === 'ready'"
        :reveal-key="guideRevealKey"
        @hint="handleHint"
        @intro-complete="handleGuideIntroComplete"
      />

      <div v-if="state.status === 'loading'" class="level1-loading">
        <span aria-hidden="true"></span>
        <p>正在准备查验现场…</p>
      </div>

      <Level1EducationModal
        v-if="educationContent"
        :content="educationContent"
        :background-image="level1Assets.education.cardBackground"
        :category-background-image="level1Assets.education.categoryBackground"
        :slogan-background-image="level1Assets.education.sloganBackground"
        :continue-button-image="level1Assets.education.continueButton"
        :mascot-image="level1Assets.guideMascot"
        @continue="continueAfterEducation"
      />

      <Level1ResultModal
        v-if="state.status === 'success' && !educationContent"
        type="success"
        :background-image="level1Assets.successPopupBackground"
        :button-image="level1Assets.successPopupButton"
        :found-count="foundCount"
        @primary="claimReward"
      />
      <Level1ResultModal
        v-else-if="state.status === 'failed'"
        type="failed"
        :background-image="level1Assets.failurePopupBackground"
        :retry-button-image="level1Assets.retryButton"
        :back-map-button-image="level1Assets.backMapButton"
        :found-count="foundCount"
        @primary="restartGame"
        @back="emit('back')"
      />

      <ExitConfirmModal
        v-if="showExitConfirm"
        :background-image="level1Assets.exitModalBackground"
        :continue-button-image="level1Assets.exitContinueButton"
        :confirm-button-image="level1Assets.exitConfirmButton"
        @cancel="cancelExit"
        @confirm="confirmExit"
      />

      <div class="level1-landscape-notice" role="status">
        <span aria-hidden="true">↻</span>
        <p>请竖屏体验行李检查</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.level1-screen {
  display: grid;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  place-items: center;
  overscroll-behavior: none;
  background: #dfe8f2;
}

.level1-canvas {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #d8e4ed;
  isolation: isolate;
  touch-action: manipulation;
}

.level1-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.level1-header {
  position: absolute;
  inset: 0;
  z-index: 22;
  pointer-events: none;
}

.level1-header button {
  position: absolute;
  top: calc(1.8% + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
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
  pointer-events: auto;
  appearance: none;
  touch-action: manipulation;
}

.level1-header button img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  pointer-events: none;
  transform: scale(1.08);
  clip-path: circle(48% at 50% 50%);
}

.level1-header button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.level1-header button:active {
  transform: scale(0.94);
}

.level1-header__title-image {
  position: absolute;
  top: calc(2.2% + env(safe-area-inset-top, 0px));
  left: 50%;
  display: block;
  width: 58%;
  height: auto;
  pointer-events: none;
  transform: translateX(-50%);
  filter: drop-shadow(0 0.25rem 0.2rem rgb(31 65 93 / 24%));
  user-select: none;
  -webkit-user-drag: none;
}

.level1-header__semantic-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.level1-loading {
  position: absolute;
  inset: 0;
  z-index: 70;
  display: grid;
  align-content: center;
  justify-items: center;
  background: rgb(19 121 193 / 58%);
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  text-shadow: 0 2px 2px rgb(0 47 90 / 45%);
}

.level1-loading span {
  width: 38px;
  aspect-ratio: 1;
  border: 4px solid rgb(255 255 255 / 40%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: level1-loading-spin 750ms linear infinite;
}

.level1-loading p {
  margin: 0.75rem 0 0;
}

.level1-landscape-notice {
  position: absolute;
  inset: 0;
  z-index: 110;
  display: none;
  align-content: center;
  justify-items: center;
  background: #0878cf;
  color: #fff;
  font-weight: 800;
  text-align: center;
}

.level1-landscape-notice span {
  font-size: 48px;
}

.level1-landscape-notice p {
  margin: 0.6rem 0 0;
}

@keyframes level1-loading-spin {
  to {
    transform: rotate(1turn);
  }
}

@media (orientation: landscape) and (max-height: 600px) {
  .level1-landscape-notice {
    display: grid;
  }
}

@media (prefers-reduced-motion: reduce) {
  .level1-loading span {
    animation-duration: 1.5s;
  }
}
</style>
