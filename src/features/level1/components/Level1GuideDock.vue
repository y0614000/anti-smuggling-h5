<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  bubbleImage: string
  mascotImage: string
  hintButtonImage: string
  message: string
  hintDisabled: boolean
  hintsRemaining: number
  startSequence: boolean
  revealKey: number
}>()

const emit = defineEmits<{
  hint: []
  introComplete: []
}>()

const CHARACTER_ENTER_DURATION_MS = 650
const BUBBLE_ENTER_DURATION_MS = 280
const GUIDE_VISIBLE_DURATION_MS = 3_000
const CHARACTER_EXIT_DELAY_MS = 220
const TYPE_INTERVAL_MS = 70

const isMascotVisible = ref(false)
const isBubbleVisible = ref(false)
const typedText = ref('')
const typedLines = computed(() => typedText.value.split('\n'))
const ariaMessage = computed(() => props.message.replace('\n', '，'))
const formatMessageAsTwoLines = (message: string) => {
  if (message.includes('\n')) return message

  const commaIndex = message.indexOf('，')
  if (commaIndex >= 0 && commaIndex < message.length - 1) {
    return `${message.slice(0, commaIndex + 1)}\n${message.slice(commaIndex + 1)}`
  }

  const characters = Array.from(message)
  if (characters.length <= 10) return message

  const splitIndex = Math.ceil(characters.length / 2)
  return `${characters.slice(0, splitIndex).join('')}\n${characters.slice(splitIndex).join('')}`
}
const displayedMessage = computed(() => formatMessageAsTwoLines(props.message))
let typingTimer: ReturnType<typeof setTimeout> | undefined
let bubbleTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined
let mascotHideTimer: ReturnType<typeof setTimeout> | undefined
let sequenceFrame: number | undefined
let hasStartedSequence = false
let hasCompletedIntro = false

const typeMessage = (message: string, onComplete?: () => void) => {
  clearTimeout(typingTimer)
  const characters = Array.from(message)
  typedText.value = ''
  let characterIndex = 0

  const typeNextCharacter = () => {
    if (characterIndex >= characters.length) {
      onComplete?.()
      return
    }

    typedText.value += characters[characterIndex]
    characterIndex += 1
    typingTimer = setTimeout(typeNextCharacter, TYPE_INTERVAL_MS)
  }

  typeNextCharacter()
}

const completeIntro = () => {
  if (hasCompletedIntro) return
  hasCompletedIntro = true
  emit('introComplete')
}

const clearGuideTimers = () => {
  clearTimeout(typingTimer)
  clearTimeout(bubbleTimer)
  clearTimeout(hideTimer)
  clearTimeout(mascotHideTimer)
}

const hideGuide = () => {
  isBubbleVisible.value = false
  mascotHideTimer = setTimeout(() => {
    isMascotVisible.value = false
  }, CHARACTER_EXIT_DELAY_MS)
}

const revealGuide = (message: string, onTyped?: () => void, entranceDelay = CHARACTER_ENTER_DURATION_MS) => {
  clearGuideTimers()
  isBubbleVisible.value = false
  typedText.value = ''

  if (sequenceFrame !== undefined) window.cancelAnimationFrame(sequenceFrame)
  sequenceFrame = window.requestAnimationFrame(() => {
    isMascotVisible.value = true
  })

  bubbleTimer = setTimeout(() => {
    isBubbleVisible.value = true
    typeMessage(message, onTyped)
    hideTimer = setTimeout(hideGuide, GUIDE_VISIBLE_DURATION_MS)
  }, entranceDelay)
}

const startGuideSequence = () => {
  if (hasStartedSequence || !props.startSequence) return
  hasStartedSequence = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isMascotVisible.value = true
    isBubbleVisible.value = true
    typedText.value = displayedMessage.value
    completeIntro()
    hideTimer = setTimeout(hideGuide, GUIDE_VISIBLE_DURATION_MS)
    return
  }

  revealGuide(
    displayedMessage.value,
    completeIntro,
    CHARACTER_ENTER_DURATION_MS + BUBBLE_ENTER_DURATION_MS,
  )
}

watch(() => props.startSequence, startGuideSequence, { immediate: true })
watch(
  () => props.revealKey,
  (revealKey) => {
    if (!hasCompletedIntro || revealKey <= 0) return
    revealGuide(formatMessageAsTwoLines(props.message))
  },
)

onBeforeUnmount(() => {
  clearGuideTimers()
  if (sequenceFrame !== undefined) window.cancelAnimationFrame(sequenceFrame)
})
</script>

<template>
  <section class="guide-dock" aria-label="小卫士提示">
    <div
      class="guide-dock__bubble"
      :class="{ 'guide-dock__bubble--visible': isBubbleVisible }"
      role="status"
      :aria-live="isBubbleVisible ? 'polite' : 'off'"
      :aria-hidden="!isBubbleVisible"
      :aria-label="isBubbleVisible ? ariaMessage : undefined"
    >
      <img :src="bubbleImage" alt="" decoding="async" draggable="false" />
      <p aria-hidden="true">
        <span v-for="(line, index) in typedLines" :key="index">{{ line }}</span>
      </p>
    </div>

    <button
      class="guide-dock__hint"
      type="button"
      aria-label="获取提示"
      :disabled="hintDisabled"
      @click="emit('hint')"
    >
      <img :src="hintButtonImage" alt="" decoding="async" draggable="false" />
      <span v-if="hintsRemaining > 0" aria-hidden="true">×{{ hintsRemaining }}</span>
    </button>

    <img
      class="guide-dock__mascot"
      :class="{ 'guide-dock__mascot--visible': isMascotVisible }"
      :src="mascotImage"
      alt="国门小卫士正在引导行李检查"
      decoding="async"
      draggable="false"
    />
  </section>
</template>

<style scoped>
.guide-dock {
  position: absolute;
  inset: 0;
  z-index: 24;
  pointer-events: none;
}

.guide-dock__bubble {
  position: absolute;
  right: 38.5%;
  bottom: calc(11.25% + env(safe-area-inset-bottom, 0px));
  width: 42.5%;
  opacity: 0;
  transform: translateY(18%) scale(0.86);
  transform-origin: 70% 100%;
}

.guide-dock__bubble--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.guide-dock__bubble img {
  display: block;
  width: 100%;
  height: auto;
}

.guide-dock__bubble p {
  position: absolute;
  inset: 8% 9% 10% 6%;
  display: grid;
  margin: 0;
  place-content: center;
  color: #5b2c18;
  font-size: clamp(13px, 3.5vw, 19px);
  font-weight: 750;
  line-height: 1.25;
  text-align: center;
  text-wrap: balance;
  text-shadow: 0 1px 0 rgb(255 255 255 / 80%);
}

.guide-dock__bubble p span {
  white-space: nowrap;
}

.guide-dock__mascot {
  position: absolute;
  right: 0.3%;
  bottom: -0.5%;
  display: block;
  width: 37.5%;
  height: auto;
  opacity: 0;
  transform: translate3d(72%, 28%, 0) scale(0.88);
  transform-origin: 100% 100%;
  user-select: none;
  filter: drop-shadow(0 0.25rem 0.25rem rgb(72 34 6 / 20%));
  -webkit-user-drag: none;
}

.guide-dock__mascot--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.guide-dock__hint {
  position: absolute;
  bottom: max(1.6%, env(safe-area-inset-bottom, 0px));
  left: 2.5%;
  width: 27%;
  min-width: 104px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.guide-dock__hint img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.guide-dock__hint span {
  position: absolute;
  top: -3%;
  right: -3%;
  display: grid;
  min-width: 1.75rem;
  aspect-ratio: 1;
  border: 2px solid #fff;
  border-radius: 50%;
  place-items: center;
  background: #ff8b16;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgb(73 37 10 / 30%);
}

.guide-dock__hint:focus-visible {
  border-radius: 18%;
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.guide-dock__hint:active:not(:disabled) {
  transform: scale(0.95);
}

.guide-dock__hint:disabled {
  cursor: default;
  filter: grayscale(0.35);
  opacity: 0.58;
}

@media (prefers-reduced-motion: no-preference) {
  .guide-dock__bubble {
    transition:
      transform 280ms cubic-bezier(0.22, 1.2, 0.36, 1),
      opacity 180ms ease-out;
    will-change: transform, opacity;
  }

  .guide-dock__mascot {
    transition:
      transform 650ms cubic-bezier(0.2, 0.86, 0.24, 1),
      opacity 260ms ease-out;
    will-change: transform, opacity;
  }

  .guide-dock__hint {
    transition: transform 120ms ease, opacity 180ms ease;
  }
}

</style>
