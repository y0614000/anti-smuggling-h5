<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    image: string
    startTyping?: boolean
  }>(),
  {
    startTyping: false,
  },
)

const FULL_TEXT = '先从第一关\n行李检查开始吧！'
const TYPE_INTERVAL_MS = 90
const textCharacters = Array.from(FULL_TEXT)
const typedText = ref('')
const typedLines = computed(() => {
  const [firstLine = '', secondLine = ''] = typedText.value.split('\n')
  return [firstLine, secondLine]
})

let typingTimer: ReturnType<typeof setTimeout> | undefined
let characterIndex = 0

const typeNextCharacter = () => {
  if (characterIndex >= textCharacters.length) return

  typedText.value += textCharacters[characterIndex]
  characterIndex += 1
  typingTimer = setTimeout(typeNextCharacter, TYPE_INTERVAL_MS)
}

watch(
  () => props.startTyping,
  (shouldStart) => {
    clearTimeout(typingTimer)
    typedText.value = ''
    characterIndex = 0

    if (!shouldStart) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typedText.value = FULL_TEXT
      return
    }

    typeNextCharacter()
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(typingTimer))
</script>

<template>
  <div class="guide-bubble" role="status" aria-label="先从第一关，行李检查开始吧！">
    <img :src="image" alt="" loading="eager" decoding="async" draggable="false" />
    <p aria-hidden="true">
      <span>{{ typedLines[0] }}</span>
      <span>{{ typedLines[1] }}</span>
    </p>
  </div>
</template>

<style scoped>
.guide-bubble {
  position: relative;
  width: 100%;
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

</style>
