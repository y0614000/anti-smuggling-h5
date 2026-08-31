<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import ExitConfirmModal from '../features/level1/components/ExitConfirmModal.vue'
import { deferImagePreload, preloadImages } from '../features/level1/useAssetPreload'
import Level2GuideDock from '../features/level2/components/Level2GuideDock.vue'
import Level2Hud from '../features/level2/components/Level2Hud.vue'
import Level2LecturerFeedback from '../features/level2/components/Level2LecturerFeedback.vue'
import Level2ResultModal from '../features/level2/components/Level2ResultModal.vue'
import PackageScanner from '../features/level2/components/PackageScanner.vue'
import {
  level2Assets,
  level2CriticalAssetUrls,
  level2DeferredAssetUrls,
} from '../features/level2/level2.assets'
import { LEVEL2_GUIDE_VISIBLE_DURATION_MS } from '../features/level2/level2.config'
import { useLevel2Game } from '../features/level2/useLevel2Game'
import type { PackageJudgment } from '../features/level2/level2.types'

const emit = defineEmits<{
  back: []
  complete: []
  countdown: [remainingSeconds: number]
  countdownStop: []
  success: []
}>()

const {
  state,
  packages,
  autoAdvanceSequence,
  guideMessageSequence,
  markReady,
  selectPackage,
  scanCurrentPackage,
  judgeCurrentPackage,
  continueAfterFeedback,
  pauseGame,
  resumeGame,
  resetGame,
} = useLevel2Game()

const showExitConfirm = ref(false)
const isSuccessModalVisible = ref(false)
const shouldPulseScanButton = ref(false)
let isMounted = true
let cancelDeferredPreload: (() => void) | undefined
let scanPromptTimer: ReturnType<typeof setTimeout> | undefined

const currentPackage = computed(
  () => packages[state.currentPackageIndex] ?? packages[0]!,
)
const previousPackageIndex = computed(
  () => (state.currentPackageIndex - 1 + packages.length) % packages.length,
)
const nextPackageIndex = computed(() => (state.currentPackageIndex + 1) % packages.length)
const previousPackage = computed(
  () => packages[previousPackageIndex.value] ?? packages[0]!,
)
const nextPackage = computed(() => packages[nextPackageIndex.value] ?? packages[0]!)
const currentPackageImages = computed(
  () => level2Assets.packageImages[state.currentPackageIndex] ?? level2Assets.packageImages[0],
)
const previousPackageImages = computed(
  () => level2Assets.packageImages[previousPackageIndex.value] ?? level2Assets.packageImages[0],
)
const nextPackageImages = computed(
  () => level2Assets.packageImages[nextPackageIndex.value] ?? level2Assets.packageImages[0],
)
const inspectedCount = computed(() => state.inspectedPackageIds.length)
const abnormalCount = computed(() => state.reportedAbnormalPackageIds.length)
const isCurrentScanned = computed(() =>
  state.scannedPackageIds.includes(currentPackage.value.id),
)
const isCurrentInspected = computed(() =>
  state.inspectedPackageIds.includes(currentPackage.value.id),
)
const isScanDisabled = computed(
  () => state.status !== 'playing' || isCurrentScanned.value || isCurrentInspected.value,
)
const isJudgmentDisabled = computed(
  () => state.status !== 'playing' || !isCurrentScanned.value || isCurrentInspected.value,
)
const scanButtonLabel = computed(() => {
  if (state.status === 'scanning') return '扫描中…'
  if (isCurrentInspected.value) return '已检查'
  if (isCurrentScanned.value) return '扫描完成'
  return '点击扫描'
})
const isLecturerFeedbackVisible = computed(
  () => state.status === 'feedback' || (state.status === 'success' && !isSuccessModalVisible.value),
)
const isLecturerJudgmentCorrect = computed(() =>
  state.inspectedPackageIds.includes(currentPackage.value.id),
)
const lecturerFeedbackTitle = computed(() =>
  isLecturerJudgmentCorrect.value ? '判断正确！' : '再比对一下'
)
const lecturerFeedbackMessage = computed(() =>
  isLecturerJudgmentCorrect.value
    ? currentPackage.value.educationPoint
    : (currentPackage.value.retryPoint ?? currentPackage.value.educationPoint),
)
const lecturerContinueLabel = computed(() => {
  if (state.status === 'success') return '点击黑板查看结果'
  return isLecturerJudgmentCorrect.value
    ? '点击黑板检查下一包裹'
    : '点击黑板继续判断'
})

const handleJudgment = (judgment: PackageJudgment) => {
  judgeCurrentPackage(judgment)
}

const clearScanPrompt = () => {
  clearTimeout(scanPromptTimer)
  scanPromptTimer = undefined
  shouldPulseScanButton.value = false
}

const scheduleScanPrompt = () => {
  clearScanPrompt()
  scanPromptTimer = setTimeout(() => {
    scanPromptTimer = undefined
    if (state.status === 'playing' && state.scannedPackageIds.length === 0) {
      shouldPulseScanButton.value = true
    }
  }, 3_000)
}

const handleScanCurrentPackage = () => {
  clearScanPrompt()
  scanCurrentPackage()
}

const handleLecturerContinue = () => {
  if (state.status === 'success' && !isSuccessModalVisible.value) {
    emit('success')
    isSuccessModalVisible.value = true
    return
  }

  continueAfterFeedback()
}

const handleBack = () => {
  if (state.status === 'loading' || state.status === 'success' || state.status === 'failed') {
    emit('back')
    return
  }

  pauseGame()
  showExitConfirm.value = true
}

const cancelExit = () => {
  showExitConfirm.value = false
  resumeGame()
}

const restartGame = () => {
  isSuccessModalVisible.value = false
  showExitConfirm.value = false
  resetGame()
}

watch(
  () => state.status,
  (status) => {
    if (status === 'playing' && state.scannedPackageIds.length === 0) {
      scheduleScanPrompt()
      return
    }

    clearScanPrompt()
  },
)

watch(
  [() => state.status, () => state.remainingSeconds],
  ([status, remainingSeconds], [previousStatus, previousRemainingSeconds]) => {
    if (status !== 'playing' && status !== 'scanning') {
      if (previousStatus === 'playing' || previousStatus === 'scanning') emit('countdownStop')
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
  await preloadImages(level2CriticalAssetUrls)
  if (!isMounted) return

  markReady()
  cancelDeferredPreload = deferImagePreload(level2DeferredAssetUrls)
})

onBeforeUnmount(() => {
  isMounted = false
  clearScanPrompt()
  emit('countdownStop')
  cancelDeferredPreload?.()
})
</script>

<template>
  <main class="level2-screen" aria-label="第二关：包裹辨别">
    <section class="level2-canvas" :class="`level2-canvas--${state.status}`">
      <img
        class="level2-background"
        :src="level2Assets.background"
        alt="海关包裹X光查验区"
        fetchpriority="high"
        decoding="async"
        draggable="false"
      />

      <header class="level2-header">
        <button type="button" aria-label="返回冒险地图" @click="handleBack">
          <img :src="level2Assets.backButton" alt="" decoding="async" draggable="false" />
        </button>
        <h1 class="level2-header__semantic-title">第二关 · 包裹辨别</h1>
        <img
          class="level2-header__title-image"
          :src="level2Assets.title"
          alt=""
          fetchpriority="high"
          decoding="async"
          draggable="false"
        />
      </header>

      <Level2Hud
        :background-image="level2Assets.statusBar"
        :inspected-count="inspectedCount"
        :abnormal-count="abnormalCount"
        :remaining-seconds="state.remainingSeconds"
      />

      <section class="declaration-card" :aria-label="`${currentPackage.number}号包裹申报信息`">
        <img :src="level2Assets.declarationCard" alt="" draggable="false" />
        <div>
          <strong>{{ currentPackage.number }}号包裹</strong>
          <p><span>申报：</span>{{ currentPackage.declaration }}</p>
        </div>
      </section>

      <PackageScanner
        :package-item="currentPackage"
        :previous-package="previousPackage"
        :next-package="nextPackage"
        :current-unscanned-image="currentPackageImages.unscanned"
        :current-scanned-image="currentPackageImages.scanned"
        :previous-image="previousPackageImages.unscanned"
        :next-image="nextPackageImages.unscanned"
        :machine-image="level2Assets.scannerMachine"
        :arrow-left-image="level2Assets.arrowLeft"
        :arrow-right-image="level2Assets.arrowRight"
        :light-beam-image="level2Assets.scannerLightBeam"
        :switch-sound="level2Assets.packageSwitchSound"
        :status="state.status"
        :is-scanned="isCurrentScanned"
        :is-inspected="isCurrentInspected"
        :auto-advance-sequence="autoAdvanceSequence"
        @previous="selectPackage(-1)"
        @next="selectPackage(1)"
      />

      <section class="scan-control">
        <button
          type="button"
          :class="{ 'scan-control__button--attention': shouldPulseScanButton }"
          :disabled="isScanDisabled"
          :aria-label="`${scanButtonLabel}${currentPackage.number}号包裹`"
          @click="handleScanCurrentPackage"
        >
          <img :src="level2Assets.scanButton" alt="" draggable="false" />
          <strong>{{ scanButtonLabel }}</strong>
        </button>
      </section>

      <section class="judgment-actions" aria-label="包裹判断">
        <button
          type="button"
          :disabled="isJudgmentDisabled"
          aria-label="判断为正常放行"
          @click="handleJudgment('normal')"
        >
          <img :src="level2Assets.normalReleaseButton" alt="正常放行" draggable="false" />
        </button>
        <button
          type="button"
          :disabled="isJudgmentDisabled"
          aria-label="判断为异常上报"
          @click="handleJudgment('abnormal')"
        >
          <img :src="level2Assets.abnormalReportButton" alt="异常上报" draggable="false" />
        </button>
      </section>

      <Level2GuideDock
        v-if="!isLecturerFeedbackVisible"
        :bubble-image="level2Assets.guideBubble"
        :mascot-image="level2Assets.guideMascot"
        :message="state.guideMessage"
        :message-sequence="guideMessageSequence"
        :start-sequence="state.status !== 'loading'"
        :visible-duration-ms="LEVEL2_GUIDE_VISIBLE_DURATION_MS"
      />

      <Level2LecturerFeedback
        v-if="isLecturerFeedbackVisible"
        :chalkboard-image="level2Assets.lecturerChalkboard"
        :lecturer-image="level2Assets.lecturerMascot"
        :title="lecturerFeedbackTitle"
        :message="lecturerFeedbackMessage"
        :continue-label="lecturerContinueLabel"
        @continue="handleLecturerContinue"
      />

      <div v-if="state.status === 'loading'" class="level2-loading">
        <span aria-hidden="true"></span>
        <p>正在准备包裹查验现场…</p>
      </div>

      <Level2ResultModal
        v-if="state.status === 'success' && isSuccessModalVisible"
        type="success"
        :background-image="level2Assets.successPopupBackground"
        :button-image="level2Assets.successPopupButton"
        :inspected-count="inspectedCount"
        @primary="emit('complete')"
      />
      <Level2ResultModal
        v-else-if="state.status === 'failed'"
        type="failed"
        :background-image="level2Assets.failurePopupBackground"
        :retry-button-image="level2Assets.retryButton"
        :back-map-button-image="level2Assets.backMapButton"
        :inspected-count="inspectedCount"
        @primary="restartGame"
        @back="emit('back')"
      />

      <ExitConfirmModal
        v-if="showExitConfirm"
        :background-image="level2Assets.exitModalBackground"
        :continue-button-image="level2Assets.exitContinueButton"
        :confirm-button-image="level2Assets.exitConfirmButton"
        @cancel="cancelExit"
        @confirm="emit('back')"
      />

      <div class="level2-landscape-notice" role="status">
        <span aria-hidden="true">↻</span>
        <p>请竖屏体验包裹辨别</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.level2-screen {
  display: grid;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  place-items: center;
  overscroll-behavior: none;
  background: #dce8ed;
}

.level2-canvas {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #e7ddd0;
  isolation: isolate;
  touch-action: manipulation;
}

.level2-background {
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

.level2-header {
  position: absolute;
  inset: 0;
  z-index: 22;
  pointer-events: none;
}

.level2-header button {
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

.level2-header button img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.level2-header button:active {
  transform: scale(0.94);
}

.level2-header button:focus-visible {
  outline: clamp(2px, 0.6vw, 4px) solid #fff;
  outline-offset: 2px;
}

.level2-header__title-image {
  position: absolute;
  top: calc(2.15% + env(safe-area-inset-top, 0px));
  left: 50%;
  display: block;
  width: 60%;
  height: auto;
  transform: translateX(-50%);
  filter: drop-shadow(0 0.25rem 0.2rem rgb(31 65 93 / 24%));
}

.level2-header__semantic-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.declaration-card {
  position: absolute;
  top: 18.2%;
  left: 50%;
  z-index: 10;
  width: 53.5%;
  transform: translateX(-50%);
  color: #60301b;
  filter: drop-shadow(0 0.25rem 0.35rem rgb(80 43 14 / 16%));
}

.declaration-card > img {
  display: block;
  width: 100%;
  height: auto;
}

.declaration-card > div {
  position: absolute;
  inset: 12% 7% 11% 34%;
  display: grid;
  align-content: center;
  font-size: clamp(10px, 2.8vw, 16px);
  line-height: 1.2;
  text-align: left;
}

.declaration-card strong {
  margin-bottom: 0.1em;
  font-size: 1.2em;
  font-weight: 900;
}

.declaration-card p {
  margin: 0.07em 0;
  font-weight: 750;
}

.declaration-card p span {
  font-weight: 900;
}

.scan-control {
  position: absolute;
  top: 65.1%;
  left: 50%;
  z-index: 18;
  width: 58%;
  transform: translateX(-50%);
}

.scan-control button {
  position: relative;
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.scan-control button img {
  display: block;
  width: 100%;
  height: auto;
}

.scan-control button strong {
  position: absolute;
  inset: 0;
  display: grid;
  padding-bottom: 2%;
  place-items: center;
  color: #fff;
  font-size: clamp(18px, 5vw, 28px);
  font-weight: 900;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 2px rgb(138 58 0 / 55%);
}

.scan-control button:disabled {
  cursor: default;
  filter: saturate(0.72) brightness(0.95);
}

.scan-control button:not(:disabled):active {
  transform: scale(0.97);
}

.scan-control__button--attention:not(:disabled) {
  animation: level2-scan-button-breathe 1.45s ease-in-out infinite;
  will-change: transform, filter;
}

.scan-control__button--attention:not(:disabled):active {
  animation: none;
  transform: scale(0.97);
}

@keyframes level2-scan-button-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0.15rem 0.25rem rgb(255 164 24 / 24%));
    transform: scale(1);
  }

  50% {
    filter: drop-shadow(0 0.35rem 0.75rem rgb(255 204 48 / 78%));
    transform: scale(1.055);
  }
}

.judgment-actions {
  position: absolute;
  top: 76.3%;
  right: 4.5%;
  left: 4.5%;
  z-index: 30;
  display: flex;
  gap: 5%;
  isolation: isolate;
  transform: translate3d(0, 0, 1px);
}

.judgment-actions button {
  width: 47.5%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.judgment-actions img {
  display: block;
  width: 100%;
  height: auto;
}

.judgment-actions button:disabled {
  cursor: default;
  opacity: 0.52;
  filter: grayscale(0.28);
}

.judgment-actions button:not(:disabled):active {
  transform: scale(0.95);
}

.judgment-actions button:focus-visible,
.scan-control button:focus-visible {
  border-radius: 999px;
  outline: 3px solid #fff;
  outline-offset: -4px;
}

@media (prefers-reduced-motion: reduce) {
  .scan-control__button--attention:not(:disabled) {
    animation: none;
    filter: drop-shadow(0 0.25rem 0.55rem rgb(255 204 48 / 70%));
  }
}

.level2-loading {
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

.level2-loading span {
  width: 38px;
  aspect-ratio: 1;
  border: 4px solid rgb(255 255 255 / 40%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: level2-loading-spin 750ms linear infinite;
}

.level2-loading p {
  margin: 0.75rem 0 0;
}

.level2-landscape-notice {
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

.level2-landscape-notice span {
  font-size: 48px;
}

.level2-landscape-notice p {
  margin: 0.6rem 0 0;
}

@keyframes level2-loading-spin {
  to { transform: rotate(1turn); }
}

@media (orientation: landscape) and (max-height: 600px) {
  .level2-landscape-notice {
    display: grid;
  }
}

@media (prefers-reduced-motion: reduce) {
  .level2-loading span {
    animation-duration: 1.5s;
  }
}
</style>
