<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import ExitConfirmModal from '../features/level1/components/ExitConfirmModal.vue'
import Level1GuideDock from '../features/level1/components/Level1GuideDock.vue'
import { preloadImages } from '../features/level1/useAssetPreload'
import Level3EvidenceCard from '../features/level3/components/Level3EvidenceCard.vue'
import Level3Feedback from '../features/level3/components/Level3Feedback.vue'
import Level3Hud from '../features/level3/components/Level3Hud.vue'
import Level3ResultModal from '../features/level3/components/Level3ResultModal.vue'
import { level3Assets, level3CriticalAssetUrls } from '../features/level3/level3.assets'
import { LEVEL3_REPORT_TOTAL } from '../features/level3/level3.config'
import { useLevel3Game } from '../features/level3/useLevel3Game'
import type { Level3Judgment } from '../features/level3/level3.types'

const emit = defineEmits<{
  back: []
  complete: []
  countdown: [remainingSeconds: number]
  countdownStop: []
  success: []
}>()

const panoramaViewport = ref<HTMLElement | null>(null)
const isReady = ref(false)
const isDragging = ref(false)
const scrollProgress = ref(0)
const showExitConfirm = ref(false)

const {
  state,
  cases,
  markReady,
  selectCase,
  closeCase,
  judgeCurrentCase,
  continueAfterFeedback,
  resetGame,
  pauseGame,
  resumeGame,
} = useLevel3Game()

const sceneVisuals = [
  { src: level3Assets.behaviors.dutyFreePersonalPickup, style: { left: '10.5%', bottom: '31%', width: '7.2%', zIndex: 8 } },
  { src: level3Assets.behaviors.dutyFreeOrganizedCollection, style: { left: '19.5%', bottom: '17%', width: '9.2%', zIndex: 10 } },
  { src: level3Assets.behaviors.luxuryElectronicsMisdeclaration, style: { left: '31.5%', bottom: '35%', width: '8.3%', zIndex: 8 } },
  { src: level3Assets.behaviors.tobaccoConcealment, style: { left: '43%', bottom: '45%', width: '8.8%', zIndex: 7 } },
  { src: level3Assets.behaviors.frozenSeafoodCompliantInspection, style: { left: '55%', bottom: '17%', width: '9.3%', zIndex: 10 } },
  { src: level3Assets.behaviors.frozenSeafoodIrregularTransfer, style: { left: '66.5%', bottom: '35%', width: '9.2%', zIndex: 8 } },
  { src: level3Assets.behaviors.fuelCompliantLoading, style: { left: '79%', bottom: '29%', width: '8.8%', zIndex: 9 } },
  { src: level3Assets.behaviors.fuelIrregularTransfer, style: { left: '91%', bottom: '43%', width: '9.8%', zIndex: 8 } },
] as const

const behaviorScenes = computed(() =>
  cases.map((caseItem, index) => ({
    ...sceneVisuals[index]!,
    caseItem,
    reviewed: state.inspectedCaseIds.includes(caseItem.id),
  })),
)

const currentCase = computed(() => cases[state.currentCaseIndex] ?? cases[0]!)
const currentIllustration = computed(() => sceneVisuals[state.currentCaseIndex]?.src ?? sceneVisuals[0].src)
const currentCaseReviewed = computed(() => state.inspectedCaseIds.includes(currentCase.value.id))

let activePointerId: number | null = null
let dragStartX = 0
let dragStartScrollLeft = 0
let suppressSceneClick = false
let isMounted = true
let introPanDelayTimer: ReturnType<typeof setTimeout> | undefined
let introPanFrame: number | undefined

const progressThumbStyle = computed(() => ({
  transform: `translateX(${scrollProgress.value * 233.333}%)`,
}))

const updateScrollProgress = () => {
  const viewport = panoramaViewport.value
  if (!viewport) return

  const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
  scrollProgress.value = maxScrollLeft > 0 ? viewport.scrollLeft / maxScrollLeft : 0
}

const handleImageReady = () => window.requestAnimationFrame(updateScrollProgress)

const cancelIntroPan = () => {
  clearTimeout(introPanDelayTimer)
  introPanDelayTimer = undefined
  if (introPanFrame !== undefined) window.cancelAnimationFrame(introPanFrame)
  introPanFrame = undefined
}

const playIntroPan = () => {
  const viewport = panoramaViewport.value
  if (!viewport) return

  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  const travelDistance = Math.min(maxScrollLeft, viewport.clientWidth * 0.72)
  if (travelDistance <= 0) return

  const startScrollLeft = viewport.scrollLeft
  const durationMs = 3_000
  let startTime: number | undefined

  const animate = (time: number) => {
    startTime ??= time
    const progress = Math.min(1, (time - startTime) / durationMs)
    const roundTripProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2)
    viewport.scrollLeft = startScrollLeft + travelDistance * roundTripProgress

    if (progress < 1) {
      introPanFrame = window.requestAnimationFrame(animate)
      return
    }

    viewport.scrollLeft = startScrollLeft
    introPanFrame = undefined
  }

  introPanFrame = window.requestAnimationFrame(animate)
}

const scheduleIntroPan = () => {
  cancelIntroPan()
  introPanDelayTimer = setTimeout(playIntroPan, 320)
}

const handlePointerDown = (event: PointerEvent) => {
  cancelIntroPan()
  if (event.pointerType !== 'touch' && event.button !== 0) return

  const viewport = panoramaViewport.value
  if (!viewport) return

  activePointerId = event.pointerId
  dragStartX = event.clientX
  dragStartScrollLeft = viewport.scrollLeft
  suppressSceneClick = false
  isDragging.value = true
  viewport.setPointerCapture(event.pointerId)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value || activePointerId !== event.pointerId) return

  const viewport = panoramaViewport.value
  if (!viewport) return

  const dragSensitivity = event.pointerType === 'touch' ? 1.7 : 1
  const travel = (event.clientX - dragStartX) * dragSensitivity
  if (Math.abs(travel) > 7) suppressSceneClick = true
  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  viewport.scrollLeft = Math.min(maxScrollLeft, Math.max(0, dragStartScrollLeft - travel))
  event.preventDefault()
}

const endPointerDrag = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) return

  const viewport = panoramaViewport.value
  if (viewport?.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
  activePointerId = null
  isDragging.value = false
}

const selectScene = (caseIndex: number) => {
  cancelIntroPan()
  if (suppressSceneClick) {
    suppressSceneClick = false
    return
  }

  selectCase(caseIndex)
}

const scrollByPage = (direction: -1 | 1) => {
  const viewport = panoramaViewport.value
  if (!viewport) return

  cancelIntroPan()
  viewport.scrollBy({ left: direction * viewport.clientWidth * 0.82, behavior: 'smooth' })
}

const handleViewportKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  scrollByPage(event.key === 'ArrowLeft' ? -1 : 1)
}

const handleJudgment = (judgment: Level3Judgment) => judgeCurrentCase(judgment)
const claimReward = () => emit('complete')
const handleGuideIntroComplete = () => markReady()

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

watch(
  () => state.status,
  (status, previousStatus) => {
    if (status === 'success' && previousStatus !== 'success') emit('success')
  },
)

onMounted(async () => {
  window.addEventListener('resize', updateScrollProgress)
  await Promise.race([
    preloadImages(level3CriticalAssetUrls),
    new Promise<void>((resolve) => window.setTimeout(resolve, 4_000)),
  ])
  if (!isMounted) return

  isReady.value = true
  window.requestAnimationFrame(() => {
    updateScrollProgress()
    scheduleIntroPan()
  })
})

onBeforeUnmount(() => {
  isMounted = false
  cancelIntroPan()
  emit('countdownStop')
  window.removeEventListener('resize', updateScrollProgress)
})
</script>

<template>
  <main class="level3-screen" aria-label="第三关：港口全景巡查">
    <section class="level3-canvas" :class="`level3-canvas--${state.status}`">
      <div
        ref="panoramaViewport"
        class="level3-panorama"
        :class="{ 'level3-panorama--dragging': isDragging }"
        role="region"
        aria-label="可左右滑动的海南港口巡查全景"
        tabindex="0"
        @scroll.passive="updateScrollProgress"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="endPointerDrag"
        @pointercancel="endPointerDrag"
        @keydown="handleViewportKeydown"
      >
        <div class="level3-panorama__world">
          <img
            class="level3-panorama__background"
            :src="level3Assets.panoramaBackground"
            alt="由离岛免税提货区、海关查验区、冷链码头和油品泊位组成的简洁港口全景"
            fetchpriority="high"
            decoding="async"
            draggable="false"
            @load="handleImageReady"
          />

          <div class="level3-panorama__behavior-layer">
            <button
              v-for="(scene, index) in behaviorScenes"
              :key="scene.caseItem.id"
              type="button"
              class="level3-behavior"
              :class="{ 'level3-behavior--reviewed': scene.reviewed }"
              :style="scene.style"
              :aria-label="`${scene.caseItem.number}号场景：${scene.caseItem.category}${scene.reviewed ? '，已完成' : ''}`"
              @click="selectScene(index)"
            >
              <img :src="scene.src" alt="" decoding="async" draggable="false" />
              <strong>{{ scene.caseItem.number }}</strong>
              <span v-if="scene.reviewed" aria-hidden="true">✓</span>
            </button>
          </div>
        </div>
      </div>

      <header class="level3-header">
        <button type="button" aria-label="返回冒险地图" @click="handleBack">
          <img :src="level3Assets.backButton" alt="" decoding="async" draggable="false" />
        </button>
        <h1 class="level3-header__semantic-title">第三关 · 港口巡查</h1>
        <img class="level3-header__title-image" :src="level3Assets.title" alt="" decoding="async" draggable="false" />
      </header>

      <Level3Hud
        v-if="isReady && !state.isCaseOpen"
        :background-image="level3Assets.statusBar"
        :inspected-count="state.inspectedCaseIds.length"
        :total="cases.length"
        :reported-count="state.reportedCaseIds.length"
        :report-total="LEVEL3_REPORT_TOTAL"
        :remaining-seconds="state.remainingSeconds"
      />

      <div v-if="!state.isCaseOpen" class="level3-panorama__progress" aria-hidden="true">
        <span :style="progressThumbStyle"></span>
      </div>

      <Level1GuideDock
        :bubble-image="level3Assets.guideBubble"
        :mascot-image="level3Assets.guideMascot"
        :hint-button-image="level3Assets.hintButton"
        :message="state.guideMessage"
        :hint-disabled="true"
        :hints-remaining="0"
        :start-sequence="isReady && state.status === 'loading'"
        :reveal-key="0"
        :show-hint="false"
        mascot-alt="国门小卫士正在引导港口巡查"
        @intro-complete="handleGuideIntroComplete"
      />

      <Level3EvidenceCard
        v-if="state.isCaseOpen && (state.status === 'playing' || state.status === 'paused')"
        :case-item="currentCase"
        :illustration="currentIllustration"
        :whistle-image="level3Assets.whistle"
        :reviewed="currentCaseReviewed"
        @close="closeCase"
        @judge="handleJudgment"
      />

      <Level3Feedback
        v-if="state.status === 'feedback'"
        :case-item="currentCase"
        :correct="state.lastOutcome === 'correct'"
        :whistle-image="level3Assets.whistle"
        @continue="continueAfterFeedback"
      />

      <Level3ResultModal
        v-if="state.status === 'success'"
        type="success"
        :background-image="level3Assets.successPopup"
        :button-image="level3Assets.resultButton"
        :inspected-count="state.inspectedCaseIds.length"
        :total="cases.length"
        @primary="claimReward"
        @back="emit('back')"
      />

      <Level3ResultModal
        v-if="state.status === 'failed'"
        type="failed"
        :background-image="level3Assets.failurePopup"
        :retry-button-image="level3Assets.retryButton"
        :back-map-button-image="level3Assets.mapButton"
        :inspected-count="state.inspectedCaseIds.length"
        :total="cases.length"
        @primary="resetGame"
        @back="emit('back')"
      />

      <ExitConfirmModal
        v-if="showExitConfirm"
        :background-image="level3Assets.exitModalBackground"
        :continue-button-image="level3Assets.exitContinueButton"
        :confirm-button-image="level3Assets.exitConfirmButton"
        @cancel="cancelExit"
        @confirm="emit('back')"
      />

      <div v-if="!isReady" class="level3-loading" aria-live="polite">
        <span aria-hidden="true"></span><p>正在展开港口巡查地图…</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.level3-screen { display: grid; width: 100%; height: 100vh; height: 100dvh; overflow: hidden; place-items: center; overscroll-behavior: none; background: #087fc8; }
.level3-canvas { position: relative; width: 100vw; height: 100vh; height: 100dvh; overflow: hidden; background: #087fc8; isolation: isolate; }
.level3-panorama { position: absolute; inset: 0; z-index: 0; overflow-x: auto; overflow-y: hidden; overscroll-behavior: none; cursor: grab; scrollbar-width: none; touch-action: none; }
.level3-panorama::-webkit-scrollbar { display: none; }
.level3-panorama:focus-visible { outline: 3px solid #fff4a8; outline-offset: -3px; }
.level3-panorama--dragging { cursor: grabbing; user-select: none; }
.level3-panorama__world { position: relative; width: max-content; min-width: 100%; height: 100%; }
.level3-panorama__background { display: block; width: auto; max-width: none; height: 100%; pointer-events: none; user-select: none; -webkit-user-drag: none; }
.level3-panorama__behavior-layer { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

.level3-behavior { position: absolute; height: auto; margin: 0; padding: 0; border: 0; background: transparent; transform: translateX(-50%); transform-origin: 50% 100%; cursor: pointer; pointer-events: auto; touch-action: manipulation; user-select: none; }
.level3-behavior > img { display: block; width: 100%; height: auto; filter: drop-shadow(0 0.22rem 0.18rem rgb(22 62 87 / 28%)); pointer-events: none; -webkit-user-drag: none; }
.level3-behavior > strong { position: absolute; top: -4%; left: 4%; display: grid; width: clamp(32px, 8.5vw, 46px); aspect-ratio: 1; place-items: center; border: 4px solid #fff; border-radius: 50%; background: linear-gradient(180deg, #ffcf3d, #f28a13); box-shadow: 0 0.28rem 0.45rem rgb(83 44 0 / 30%); color: #fff; font: 950 clamp(17px, 4.8vw, 25px)/1 sans-serif; text-shadow: 0 2px 0 rgb(129 65 0 / 38%); }
.level3-behavior > span { position: absolute; top: 2%; right: 3%; display: grid; width: clamp(25px, 6.5vw, 35px); aspect-ratio: 1; place-items: center; border: 3px solid #fff; border-radius: 50%; background: #19ad75; color: #fff; font-weight: 950; }
.level3-behavior--reviewed { filter: saturate(0.78); }
.level3-behavior:active { transform: translateX(-50%) scale(0.94); }
.level3-behavior:focus-visible { outline: 4px solid #ffeb66; outline-offset: 5px; border-radius: 18px; }

.level3-header { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
.level3-header > button { position: absolute; top: calc(1.8% + env(safe-area-inset-top, 0px)); left: max(3.5%, env(safe-area-inset-left, 0px)); width: 10.5%; aspect-ratio: 1; margin: 0; padding: 0; overflow: hidden; border: 0; border-radius: 50%; background: #f89b12; box-shadow: 0 2px 4px rgb(76 34 0 / 24%); cursor: pointer; pointer-events: auto; appearance: none; touch-action: manipulation; }
.level3-header > button img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.level3-header > button:active { transform: scale(0.94); }
.level3-header > button:focus-visible { outline: clamp(2px, 0.6vw, 4px) solid #fff; outline-offset: 2px; }
.level3-header__title-image { position: absolute; top: calc(2.15% + env(safe-area-inset-top, 0px)); left: 50%; display: block; width: 60%; height: auto; transform: translateX(-50%); filter: drop-shadow(0 0.25rem 0.2rem rgb(31 65 93 / 24%)); }
.level3-header__semantic-title { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.level3-panorama__progress { position: absolute; bottom: calc(2.35rem + env(safe-area-inset-bottom, 0px)); left: 50%; z-index: 23; width: 44%; height: 0.52rem; overflow: hidden; border: 2px solid rgb(255 255 255 / 82%); border-radius: 999px; background: rgb(2 68 126 / 52%); box-shadow: 0 0.2rem 0.45rem rgb(0 32 61 / 22%); transform: translateX(-50%); pointer-events: none; }
.level3-panorama__progress span { display: block; width: 30%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffe25e, #ffad19); box-shadow: 0 0 0 1px rgb(255 255 255 / 40%); will-change: transform; }

.level3-loading { position: absolute; inset: 0; z-index: 75; display: grid; place-content: center; background: linear-gradient(180deg, #128fd7, #0871bc); color: #fff; text-align: center; }
.level3-loading span { width: 3rem; height: 3rem; margin: 0 auto; border: 0.38rem solid rgb(255 255 255 / 34%); border-top-color: #fff2a8; border-radius: 50%; animation: level3-loading-spin 900ms linear infinite; }
.level3-loading p { margin: 0.9rem 0 0; font-size: clamp(15px, 4vw, 21px); font-weight: 800; }

@media (prefers-reduced-motion: no-preference) {
  .level3-behavior > strong { animation: level3-marker-pulse 1.25s ease-in-out infinite alternate; }
  .level3-behavior--reviewed > strong { animation: none; }
}

@keyframes level3-loading-spin { to { transform: rotate(360deg); } }
@keyframes level3-marker-pulse { to { transform: translateY(-8%) scale(1.06); } }
</style>
