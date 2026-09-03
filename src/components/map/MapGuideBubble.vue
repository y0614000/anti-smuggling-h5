<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    image: string
    text?: string
    startTyping?: boolean
    secondLineActionText?: string
  }>(),
  {
    text: '先从第一关\n行李检查开始吧！',
    startTyping: false,
    secondLineActionText: '',
  },
)

const emit = defineEmits<{
  action: []
}>()

const TYPE_INTERVAL_MS = 90
const typedText = ref('')
const accessibleText = computed(() => props.text.replace('\n', '，'))
const typedLines = computed(() => {
  const [firstLine = '', secondLine = ''] = typedText.value.split('\n')
  return [firstLine, secondLine] as const
})
const hasSecondLineAction = computed(() => props.secondLineActionText.length > 0)
const isTypingComplete = computed(() => typedText.value.length >= props.text.length)
const typedActionText = computed(() =>
  typedLines.value[1].slice(0, props.secondLineActionText.length),
)
const typedActionSuffix = computed(() =>
  typedLines.value[1].slice(props.secondLineActionText.length),
)

let typingTimer: ReturnType<typeof setTimeout> | undefined
let characterIndex = 0
let textCharacters: string[] = []

const typeNextCharacter = () => {
  if (characterIndex >= textCharacters.length) return

  typedText.value += textCharacters[characterIndex]
  characterIndex += 1
  typingTimer = setTimeout(typeNextCharacter, TYPE_INTERVAL_MS)
}

watch(
  [() => props.startTyping, () => props.text],
  ([shouldStart]) => {
    clearTimeout(typingTimer)
    typedText.value = ''
    characterIndex = 0
    textCharacters = Array.from(props.text)

    if (!shouldStart) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typedText.value = props.text
      return
    }

    typeNextCharacter()
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(typingTimer))
</script>

<template>
  <div class="guide-bubble" role="status" :aria-label="accessibleText">
    <img :src="image" alt="" loading="eager" decoding="async" draggable="false" />
    <p :aria-hidden="hasSecondLineAction ? undefined : 'true'">
      <span>{{ typedLines[0] }}</span>
      <span v-if="hasSecondLineAction" class="guide-bubble__action-line">
        <button
          type="button"
          :disabled="!isTypingComplete"
          :aria-label="props.secondLineActionText"
          @click.stop="emit('action')"
        >{{ typedActionText }}</button><span>{{ typedActionSuffix }}</span>
      </span>
      <span v-else>{{ typedLines[1] }}</span>
    </p>
  </div>
</template>

<style scoped>
.guide-bubble {
  position: relative;
  width: 112%;
  height: 100%;
}

.guide-bubble img {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.guide-bubble p {
  position: absolute;
  inset: 8% 9% 10% 6%;
  display: grid;
  margin: 0;
  place-content: center;
  color: #4e281c;
  font-size: clamp(13px, 3.5vw, 19px);
  font-weight: 750;
  line-height: 1.25;
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 75%);
}

.guide-bubble p span {
  white-space: nowrap;
}

.guide-bubble__action-line {
  display: block;
}

.guide-bubble__action-line button {
  margin: 0;
  padding: 0 1px;
  border: 0;
  border-bottom: 2px solid currentcolor;
  background: transparent;
  color: #075dca;
  font: inherit;
  font-weight: 900;
  line-height: inherit;
  text-shadow:
    0 1px 0 rgb(255 255 255 / 90%),
    0 0 5px rgb(87 180 255 / 26%);
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.guide-bubble__action-line button:disabled {
  color: #4e281c;
  cursor: default;
  opacity: 1;
}

.guide-bubble__action-line button:focus-visible {
  border-radius: 3px;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.guide-bubble__action-line button:active:not(:disabled) {
  transform: translateY(1px) scale(0.97);
}

@media (prefers-reduced-motion: no-preference) {
  .guide-bubble__action-line button:not(:disabled) {
    animation: guide-bubble-action-pulse 1.6s ease-in-out infinite;
  }
}

@keyframes guide-bubble-action-pulse {
  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.22) drop-shadow(0 0 3px rgb(65 169 255 / 58%));
  }
}

</style>
