<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  bubbleImage: string
  mascotImage: string
  message: string
  messageSequence: number
  startSequence: boolean
  visibleDurationMs: number
}>()

const CHARACTER_ENTER_DURATION_MS = 650
const BUBBLE_ENTER_DURATION_MS = 280
const CHARACTER_EXIT_DELAY_MS = 220
const TYPE_INTERVAL_MS = 70

const isMascotVisible = ref(false)
const isBubbleVisible = ref(false)
const typedText = ref('')
const typedLines = computed(() => typedText.value.split('\n'))
const ariaMessage = computed(() => props.message.replaceAll('\n', '，'))
let typingTimer: ReturnType<typeof setTimeout> | undefined
let bubbleTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined
let mascotHideTimer: ReturnType<typeof setTimeout> | undefined
let sequenceFrame: number | undefined
let hasStartedSequence = false

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

const clearGuideTimers = () => {
  clearTimeout(typingTimer)
  clearTimeout(bubbleTimer)
  clearTimeout(hideTimer)
  clearTimeout(mascotHideTimer)
}

const typeMessage = (message: string) => {
  clearTimeout(typingTimer)
  const characters = Array.from(message)
  typedText.value = ''
  let characterIndex = 0

  const typeNextCharacter = () => {
    if (characterIndex >= characters.length) return

    typedText.value += characters[characterIndex]
    characterIndex += 1
    typingTimer = setTimeout(typeNextCharacter, TYPE_INTERVAL_MS)
  }

  typeNextCharacter()
}

const hideGuide = () => {
  isBubbleVisible.value = false
  mascotHideTimer = setTimeout(() => {
    isMascotVisible.value = false
  }, CHARACTER_EXIT_DELAY_MS)
}

const revealGuide = (message: string, entranceDelay: number) => {
  clearGuideTimers()
  isBubbleVisible.value = false
  typedText.value = ''

  if (sequenceFrame !== undefined) window.cancelAnimationFrame(sequenceFrame)
  sequenceFrame = window.requestAnimationFrame(() => {
    isMascotVisible.value = true
  })

  bubbleTimer = setTimeout(() => {
    isBubbleVisible.value = true
    typeMessage(message)
    hideTimer = setTimeout(hideGuide, props.visibleDurationMs)
  }, entranceDelay)
}

const showGuideMessage = (message: string, isInitial = false) => {
  const formattedMessage = formatMessageAsTwoLines(message)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearGuideTimers()
    isMascotVisible.value = true
    isBubbleVisible.value = true
    typedText.value = formattedMessage
    hideTimer = setTimeout(hideGuide, props.visibleDurationMs)
    return
  }

  const entranceDelay =
    isInitial || !isMascotVisible.value
      ? CHARACTER_ENTER_DURATION_MS + BUBBLE_ENTER_DURATION_MS
      : 120
  revealGuide(formattedMessage, entranceDelay)
}

const startGuideSequence = () => {
  if (hasStartedSequence || !props.startSequence) return
  hasStartedSequence = true
  showGuideMessage(props.message, true)
}

watch(() => props.startSequence, startGuideSequence, { immediate: true })
watch(
  [() => props.message, () => props.messageSequence],
  ([message, messageSequence], [previousMessage, previousMessageSequence]) => {
    if (
      !hasStartedSequence ||
      (message === previousMessage && messageSequence === previousMessageSequence)
    ) {
      return
    }
    showGuideMessage(message)
  },
)

onBeforeUnmount(() => {
  clearGuideTimers()
  if (sequenceFrame !== undefined) window.cancelAnimationFrame(sequenceFrame)
})
</script>

<template>
  <section class="level2-guide" aria-label="小卫士提示">
    <div
      class="level2-guide__bubble"
      :class="{ 'level2-guide__bubble--visible': isBubbleVisible }"
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
    <img
      class="level2-guide__mascot"
      :class="{ 'level2-guide__mascot--visible': isMascotVisible }"
      :src="mascotImage"
      alt="国门小卫士正在引导包裹辨别"
      decoding="async"
      draggable="false"
    />
  </section>
</template>

<style scoped>
.level2-guide {
  position: absolute;
  inset: 0;
  z-index: 40;
  isolation: isolate;
  pointer-events: none;
}

.level2-guide__bubble {
  position: absolute;
  right: 28.5%;
  bottom: calc(1.5% + env(safe-area-inset-bottom, 0px));
  width: 42.5%;
  opacity: 0;
  transform: translateY(18%) scale(0.86);
  transform-origin: 70% 100%;
}

.level2-guide__bubble--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.level2-guide__bubble img {
  display: block;
  width: 100%;
  height: auto;
}

.level2-guide__bubble p {
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

.level2-guide__bubble p span {
  display: block;
}

.level2-guide__mascot {
  position: absolute;
  right: 0.3%;
  bottom: -0.5%;
  display: block;
  width: 25.5%;
  height: auto;
  opacity: 0;
  transform: translate3d(72%, 28%, 0) scale(0.88);
  transform-origin: 100% 100%;
  filter: drop-shadow(0 0.25rem 0.25rem rgb(72 34 6 / 20%));
  user-select: none;
  -webkit-user-drag: none;
}

.level2-guide__mascot--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: no-preference) {
  .level2-guide__bubble {
    transition:
      transform 280ms cubic-bezier(0.22, 1.2, 0.36, 1),
      opacity 420ms ease-out;
    will-change: transform, opacity;
  }

  .level2-guide__mascot {
    transition:
      transform 800ms cubic-bezier(0.2, 0.86, 0.24, 1),
      opacity 520ms ease-out;
    will-change: transform, opacity;
  }
}
</style>
