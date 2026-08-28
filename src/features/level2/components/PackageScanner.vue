<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { Level2GameStatus, Level2Package } from '../level2.types'

const props = defineProps<{
  packageItem: Level2Package
  previousPackage: Level2Package
  nextPackage: Level2Package
  currentUnscannedImage: string
  currentScannedImage: string
  previousImage: string
  nextImage: string
  machineImage: string
  arrowLeftImage: string
  arrowRightImage: string
  lightBeamImage: string
  switchSound: string
  status: Level2GameStatus
  isScanned: boolean
  isInspected: boolean
  autoAdvanceSequence: number
}>()

const emit = defineEmits<{
  previous: []
  next: []
}>()

const rotationDirection = ref<'previous' | 'next' | null>(null)
const rotationKey = ref(0)
const switchAudioRef = ref<HTMLAudioElement | null>(null)
let rotationTimer: ReturnType<typeof setTimeout> | undefined

const SWITCH_SOUND_VOLUME = 0.35
const SWITCH_SOUND_PLAYBACK_RATE = {
  previous: 0.96,
  next: 1.04,
} as const

const navigationDisabled = computed(() => props.status !== 'playing')
const packageAlt = computed(() =>
  props.isScanned
    ? `${props.packageItem.number}号包裹X光图像：${props.packageItem.xrayResult}`
    : `${props.packageItem.number}号未扫描包裹`,
)

const startRotation = (direction: 'previous' | 'next') => {
  rotationDirection.value = direction
  rotationKey.value += 1
  clearTimeout(rotationTimer)
  rotationTimer = setTimeout(() => {
    rotationDirection.value = null
  }, 440)
}

const playSwitchSound = (direction: 'previous' | 'next') => {
  const audio = switchAudioRef.value
  if (!audio) return

  audio.volume = SWITCH_SOUND_VOLUME
  audio.playbackRate = SWITCH_SOUND_PLAYBACK_RATE[direction]

  try {
    audio.currentTime = 0
  } catch {
    // iOS WebView 可能在音频元数据尚未就绪时拒绝设置播放位置。
  }

  void audio.play().catch(() => {
    // 静音模式或个别 WebView 可能阻止音效，不影响包裹切换。
  })
}

const navigate = (direction: 'previous' | 'next') => {
  if (navigationDisabled.value) return

  startRotation(direction)
  playSwitchSound(direction)
  if (direction === 'previous') emit('previous')
  else emit('next')
}

watch(
  () => props.autoAdvanceSequence,
  (sequence, previousSequence) => {
    if (sequence > previousSequence) startRotation('next')
  },
)

onBeforeUnmount(() => {
  clearTimeout(rotationTimer)
  switchAudioRef.value?.pause()
})
</script>

<template>
  <section
    class="package-scanner"
    :class="{
      'package-scanner--rotate-previous': rotationDirection === 'previous',
      'package-scanner--rotate-next': rotationDirection === 'next',
    }"
    aria-label="包裹X光扫描机"
  >
    <audio ref="switchAudioRef" :src="switchSound" preload="auto"></audio>
    <img
      :key="`previous-${previousPackage.id}-${rotationKey}`"
      class="package-scanner__previous-package"
      :src="previousImage"
      alt=""
      draggable="false"
    />
    <img
      :key="`next-${nextPackage.id}-${rotationKey}`"
      class="package-scanner__next-package"
      :src="nextImage"
      alt=""
      draggable="false"
    />
    <img
      :key="`current-${packageItem.id}-${rotationKey}`"
      class="package-scanner__current-package"
      :class="{
        'package-scanner__current-package--scanned': isScanned,
        'package-scanner__current-package--inspected': isInspected,
      }"
      :src="isScanned ? currentScannedImage : currentUnscannedImage"
      :alt="packageAlt"
      draggable="false"
    />
    <img class="package-scanner__machine" :src="machineImage" alt="" draggable="false" />

    <img
      v-if="status === 'scanning'"
      class="package-scanner__beam"
      :src="lightBeamImage"
      alt=""
      draggable="false"
    />

    <button
      class="package-scanner__arrow package-scanner__arrow--left"
      type="button"
      :disabled="navigationDisabled"
      :aria-label="`查看${previousPackage.number}号包裹`"
      @click="navigate('previous')"
    >
      <img :src="arrowLeftImage" alt="" draggable="false" />
    </button>
    <button
      class="package-scanner__arrow package-scanner__arrow--right"
      type="button"
      :disabled="navigationDisabled"
      :aria-label="`查看${nextPackage.number}号包裹`"
      @click="navigate('next')"
    >
      <img :src="arrowRightImage" alt="" draggable="false" />
    </button>
  </section>
</template>

<style scoped>
.package-scanner {
  position: absolute;
  top: 28.1%;
  left: 0;
  z-index: 8;
  width: 100%;
  aspect-ratio: 1 / 0.76;
  overflow: visible;
  pointer-events: none;
  transform-style: flat;
}

.package-scanner img {
  position: absolute;
  display: block;
  max-width: none;
  user-select: none;
  -webkit-user-drag: none;
}

.package-scanner__previous-package,
.package-scanner__next-package {
  top: 37%;
  z-index: 4;
  width: 28%;
  opacity: 0.9;
  filter: drop-shadow(0 0.25rem 0.25rem rgb(39 24 9 / 25%));
  transform-origin: 50% 55%;
  will-change: transform, opacity, clip-path;
}

.package-scanner__previous-package {
  left: -2%;
  clip-path: inset(0 0 0 50%);
  transform: perspective(600px) rotateY(18deg) rotateZ(-1.5deg) scale(0.82);
}

.package-scanner__next-package {
  right: -2%;
  clip-path: inset(0 50% 0 0);
  transform: perspective(600px) rotateY(-18deg) rotateZ(1.5deg) scale(0.82);
}

.package-scanner__current-package {
  top: 23%;
  left: 50%;
  z-index: 5;
  width: 40%;
  filter: drop-shadow(0 0.35rem 0.35rem rgb(28 18 5 / 28%));
  transform: translateX(-50%);
  transform-origin: 50% 55%;
}

.package-scanner__current-package--scanned {
  top: 23%;
  width: 38%;
}

.package-scanner__current-package--inspected {
  opacity: 0.9;
}

.package-scanner__machine {
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
}

.package-scanner__beam {
  top: 14%;
  left: 50%;
  z-index: 6;
  width: 12%;
  height: auto;
  transform: translateX(-50%);
  animation: level2-scan-beam 1.3s ease-in-out both;
}

.package-scanner__arrow {
  position: absolute;
  top: 36%;
  z-index: 7;
  width: 17%;
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
  touch-action: manipulation;
}

.package-scanner__arrow img {
  inset: 0;
  width: 100%;
  height: 100%;
}

.package-scanner__arrow--left {
  left: -0.4%;
}

.package-scanner__arrow--right {
  right: -0.4%;
}

.package-scanner__arrow:disabled {
  cursor: default;
  filter: grayscale(0.2) brightness(0.82);
}

.package-scanner__arrow:not(:disabled):active {
  transform: scale(0.92);
}

.package-scanner__arrow:focus-visible {
  outline: 3px solid #fff;
  outline-offset: -6px;
}

.package-scanner--rotate-next .package-scanner__previous-package {
  animation: level2-carousel-next-previous 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

.package-scanner--rotate-next .package-scanner__current-package {
  animation: level2-carousel-next-current 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

.package-scanner--rotate-next .package-scanner__next-package {
  animation: level2-carousel-next-next 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

.package-scanner--rotate-previous .package-scanner__previous-package {
  animation: level2-carousel-previous-previous 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

.package-scanner--rotate-previous .package-scanner__current-package {
  animation: level2-carousel-previous-current 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

.package-scanner--rotate-previous .package-scanner__next-package {
  animation: level2-carousel-previous-next 440ms cubic-bezier(0.22, 0.78, 0.28, 1) both;
}

@keyframes level2-carousel-next-previous {
  from {
    clip-path: inset(0);
    opacity: 1;
    transform: translateX(78%) perspective(600px) rotateY(0deg) scale(1.3);
  }

  to {
    clip-path: inset(0 0 0 50%);
    opacity: 0.9;
    transform: translateX(0) perspective(600px) rotateY(18deg) rotateZ(-1.5deg) scale(0.82);
  }
}

@keyframes level2-carousel-next-current {
  from {
    opacity: 0.82;
    transform: translateX(38%) perspective(600px) rotateY(-28deg) scale(0.72);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) perspective(600px) rotateY(0deg) scale(1);
  }
}

@keyframes level2-carousel-next-next {
  from {
    clip-path: inset(0 50% 0 0);
    opacity: 0;
    transform: translateX(48%) perspective(600px) rotateY(-35deg) scale(0.68);
  }

  to {
    clip-path: inset(0 50% 0 0);
    opacity: 0.9;
    transform: translateX(0) perspective(600px) rotateY(-18deg) rotateZ(1.5deg) scale(0.82);
  }
}

@keyframes level2-carousel-previous-previous {
  from {
    clip-path: inset(0 0 0 50%);
    opacity: 0;
    transform: translateX(-48%) perspective(600px) rotateY(35deg) scale(0.68);
  }

  to {
    clip-path: inset(0 0 0 50%);
    opacity: 0.9;
    transform: translateX(0) perspective(600px) rotateY(18deg) rotateZ(-1.5deg) scale(0.82);
  }
}

@keyframes level2-carousel-previous-current {
  from {
    opacity: 0.82;
    transform: translateX(-138%) perspective(600px) rotateY(28deg) scale(0.72);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) perspective(600px) rotateY(0deg) scale(1);
  }
}

@keyframes level2-carousel-previous-next {
  from {
    clip-path: inset(0);
    opacity: 1;
    transform: translateX(-78%) perspective(600px) rotateY(0deg) scale(1.3);
  }

  to {
    clip-path: inset(0 50% 0 0);
    opacity: 0.9;
    transform: translateX(0) perspective(600px) rotateY(-18deg) rotateZ(1.5deg) scale(0.82);
  }
}

@keyframes level2-scan-beam {
  0% {
    opacity: 0;
    transform: translateX(-260%);
  }

  15%,
  85% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(160%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .package-scanner__previous-package,
  .package-scanner__current-package,
  .package-scanner__next-package {
    animation: none !important;
  }

  .package-scanner__beam {
    animation: none;
  }
}
</style>
