<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { Level1GameStatus, NormalizedPoint } from '../level1.types'

const props = defineProps<{
  image: string
  status: Level1GameStatus
  resetKey: number
  hintTarget: NormalizedPoint | null
  scanPulseKey: number
}>()

const emit = defineEmits<{
  position: [point: NormalizedPoint]
  dragStart: []
  dragEnd: []
}>()

const magnifierElement = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isScanning = ref(false)

const LENS_CENTER_X = 0.65
const LENS_CENTER_Y = 0.35
const EDGE_GUTTER_PX = 4
const KEYBOARD_STEP_PX = 9

let canvasElement: HTMLElement | null = null
let resizeObserver: ResizeObserver | undefined
let animationFrame: number | undefined
let activePointerId: number | undefined
let startClientX = 0
let startClientY = 0
let originOffsetX = 0
let originOffsetY = 0
let currentOffsetX = 0
let currentOffsetY = 0
let pendingClientX = 0
let pendingClientY = 0
let baseLeft = 0
let baseTop = 0
let elementWidth = 0
let elementHeight = 0
let canvasWidth = 0
let canvasHeight = 0
let scanTimer: ReturnType<typeof setTimeout> | undefined

const isPlayable = () => props.status === 'playing'

const updateGeometry = () => {
  const element = magnifierElement.value
  if (!element) return

  canvasElement = element.closest<HTMLElement>('.level1-canvas')
  if (!canvasElement) return

  baseLeft = element.offsetLeft
  baseTop = element.offsetTop
  elementWidth = element.offsetWidth
  elementHeight = element.offsetHeight
  canvasWidth = canvasElement.clientWidth
  canvasHeight = canvasElement.clientHeight
}

const clampOffset = (x: number, y: number) => ({
  x: Math.min(canvasWidth - baseLeft - elementWidth - EDGE_GUTTER_PX, Math.max(-baseLeft + EDGE_GUTTER_PX, x)),
  y: Math.min(canvasHeight - baseTop - elementHeight - EDGE_GUTTER_PX, Math.max(-baseTop + EDGE_GUTTER_PX, y)),
})

const emitLensPosition = () => {
  if (canvasWidth <= 0 || canvasHeight <= 0) return

  emit('position', {
    x: ((baseLeft + currentOffsetX + elementWidth * LENS_CENTER_X) / canvasWidth) * 100,
    y: ((baseTop + currentOffsetY + elementHeight * LENS_CENTER_Y) / canvasHeight) * 100,
  })
}

const applyOffset = (x: number, y: number) => {
  const element = magnifierElement.value
  if (!element) return

  const nextOffset = clampOffset(x, y)
  currentOffsetX = nextOffset.x
  currentOffsetY = nextOffset.y
  element.style.transform = `translate3d(${currentOffsetX}px, ${currentOffsetY}px, 0)`
  emitLensPosition()
}

const schedulePointerUpdate = () => {
  if (animationFrame !== undefined) return

  animationFrame = window.requestAnimationFrame(() => {
    animationFrame = undefined
    applyOffset(
      originOffsetX + pendingClientX - startClientX,
      originOffsetY + pendingClientY - startClientY,
    )
  })
}

const handlePointerDown = (event: PointerEvent) => {
  if (!isPlayable() || activePointerId !== undefined) return

  updateGeometry()
  activePointerId = event.pointerId
  startClientX = event.clientX
  startClientY = event.clientY
  pendingClientX = event.clientX
  pendingClientY = event.clientY
  originOffsetX = currentOffsetX
  originOffsetY = currentOffsetY
  isDragging.value = true
  magnifierElement.value?.setPointerCapture(event.pointerId)
  emit('dragStart')
}

const handlePointerMove = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId || !isDragging.value) return
  pendingClientX = event.clientX
  pendingClientY = event.clientY
  schedulePointerUpdate()
}

const finishDrag = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId) return

  if (animationFrame !== undefined) {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
    applyOffset(
      originOffsetX + pendingClientX - startClientX,
      originOffsetY + pendingClientY - startClientY,
    )
  }

  if (magnifierElement.value?.hasPointerCapture(event.pointerId)) {
    magnifierElement.value.releasePointerCapture(event.pointerId)
  }
  activePointerId = undefined
  isDragging.value = false
  emit('dragEnd')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isPlayable()) return

  const directions: Record<string, NormalizedPoint> = {
    ArrowLeft: { x: -KEYBOARD_STEP_PX, y: 0 },
    ArrowRight: { x: KEYBOARD_STEP_PX, y: 0 },
    ArrowUp: { x: 0, y: -KEYBOARD_STEP_PX },
    ArrowDown: { x: 0, y: KEYBOARD_STEP_PX },
  }
  const direction = directions[event.key]
  if (!direction) return

  event.preventDefault()
  updateGeometry()
  applyOffset(currentOffsetX + direction.x, currentOffsetY + direction.y)
}

const resetPosition = async () => {
  await nextTick()
  updateGeometry()
  currentOffsetX = 0
  currentOffsetY = 0
  applyOffset(0, 0)
}

watch(() => props.resetKey, resetPosition)
watch(
  () => props.scanPulseKey,
  () => {
    clearTimeout(scanTimer)
    isScanning.value = true
    scanTimer = setTimeout(() => {
      isScanning.value = false
    }, 520)
  },
)
watch(
  () => props.status,
  (status) => {
    if (status === 'playing' || activePointerId === undefined) return
    activePointerId = undefined
    isDragging.value = false
    emit('dragEnd')
  },
)

onMounted(() => {
  updateGeometry()
  emitLensPosition()
  if (canvasElement) {
    resizeObserver = new ResizeObserver(() => {
      updateGeometry()
      applyOffset(currentOffsetX, currentOffsetY)
    })
    resizeObserver.observe(canvasElement)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(scanTimer)
  if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <div
    ref="magnifierElement"
    class="draggable-magnifier"
    :class="{
      'draggable-magnifier--dragging': isDragging,
      'draggable-magnifier--disabled': status !== 'playing',
    }"
    role="application"
    tabindex="0"
    aria-label="侦查放大镜，可拖动或使用方向键移动"
    :aria-disabled="status !== 'playing'"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="finishDrag"
    @pointercancel="finishDrag"
    @keydown="handleKeydown"
  >
    <img
      :class="{
        'draggable-magnifier__image--scanning': isScanning,
        'draggable-magnifier__image--hinted': hintTarget,
      }"
      :src="image"
      alt=""
      decoding="async"
      draggable="false"
    />
  </div>
</template>

<style scoped>
.draggable-magnifier {
  position: absolute;
  top: 76.4%;
  left: 0.5%;
  z-index: 30;
  width: clamp(64px, 17vw, 96px);
  margin: 0;
  padding: 0;
  cursor: grab;
  outline: none;
  touch-action: none;
  user-select: none;
  will-change: transform;
  -webkit-tap-highlight-color: transparent;
}

.draggable-magnifier img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
  transform-origin: 62% 38%;
  filter: drop-shadow(0 0.3rem 0.22rem rgb(25 64 102 / 35%));
  -webkit-user-drag: none;
}

.draggable-magnifier:focus-visible {
  border-radius: 50%;
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.draggable-magnifier--dragging {
  z-index: 34;
  cursor: grabbing;
}

.draggable-magnifier--dragging img {
  transform: scale(1.055);
}

.draggable-magnifier--disabled {
  cursor: default;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .draggable-magnifier:not(.draggable-magnifier--dragging) img {
    animation: level1-magnifier-float 1.9s ease-in-out infinite alternate;
  }

  .draggable-magnifier img.draggable-magnifier__image--scanning {
    animation: level1-magnifier-scan 520ms ease-out;
  }

  .draggable-magnifier img.draggable-magnifier__image--hinted {
    animation: level1-magnifier-hint 430ms ease-in-out 3 alternate;
  }
}

@keyframes level1-magnifier-float {
  to {
    transform: translateY(-4px) rotate(-2deg);
  }
}

@keyframes level1-magnifier-scan {
  45% {
    filter: drop-shadow(0 0 0.8rem #fff4a3) drop-shadow(0 0 1.1rem #ffc400);
    transform: scale(1.1);
  }
}

@keyframes level1-magnifier-hint {
  to {
    transform: translate3d(5px, -3px, 0) rotate(2deg);
  }
}
</style>

