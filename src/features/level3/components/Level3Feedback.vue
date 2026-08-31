<script setup lang="ts">
import { computed } from 'vue'

import mascotCorrect from '@/assets/level3/mascot-correct.webp'
import mascotWrong from '@/assets/level3/mascot-wrong.webp'

import type { Level3Case } from '../level3.types'
import ResultMascot from './ResultMascot.vue'

const props = defineProps<{
  caseItem: Level3Case
  correct: boolean
  whistleImage: string
}>()

const emit = defineEmits<{
  continue: []
}>()

const isReport = computed(() => props.caseItem.judgment === 'report')

const mascotImage = computed(() => (props.correct ? mascotCorrect : mascotWrong))
</script>

<template>
  <div class="feedback-overlay" role="presentation">
    <section
      class="feedback-card"
      :class="{ 'feedback-card--retry': !correct }"
      role="dialog"
      aria-modal="true"
      :aria-label="correct ? '判断正确' : '需要重新判断'"
    >
      <header class="feedback-card__header">
        <div class="feedback-card__signal">
          <img v-if="correct && isReport" :src="whistleImage" alt="" draggable="false" />
          <span v-else aria-hidden="true">{{ correct ? '✓' : '?' }}</span>
        </div>
        <div>
          <small>{{ caseItem.category }} · {{ caseItem.number }}号巡查场景</small>
          <h2>{{ correct ? '判断正确' : '再观察一下' }}</h2>
        </div>
      </header>

      <div
        class="feedback-card__body"
        :class="{ 'feedback-card__body--with-mascot': mascotImage }"
      >
        <ResultMascot
          :status="correct ? 'correct' : 'wrong'"
          :image-src="mascotImage || undefined"
        />
        <strong class="feedback-card__result">
          {{ correct ? (isReport ? '已报告可疑行为' : '已确认正常行为') : '现场线索还有疑点' }}
        </strong>
        <p class="feedback-card__message">
          {{ correct ? caseItem.educationPoint : caseItem.observationHint }}
        </p>

        <button type="button" @click="emit('continue')">
          {{ correct ? '继续巡查' : '重新观察' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.feedback-overlay {
  position: absolute;
  inset: 0;
  z-index: 65;
  display: grid;
  padding: 7%;
  place-items: center;
  background: rgb(5 40 75 / 62%);
  backdrop-filter: blur(1px);
}

.feedback-card {
  position: relative;
  width: min(88vw, 430px);
  overflow: hidden;
  border: 2px solid #d6c08d;
  border-radius: 16px;
  background: #f8f6ee;
  box-shadow: 0 0.8rem 1.4rem rgb(3 28 54 / 28%);
  color: #24485f;
}

.feedback-card__header {
  display: flex;
  min-height: 5.1rem;
  padding: 0.9rem 1rem;
  align-items: center;
  gap: 0.75rem;
  background: #08679f;
  color: #fff;
}

.feedback-card--retry .feedback-card__header { background: #9b641f; }

.feedback-card__signal {
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  flex: 0 0 3.25rem;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 10px;
  background: rgb(255 255 255 / 12%);
}

.feedback-card__signal img {
  width: 86%;
  height: 86%;
  object-fit: contain;
}

.feedback-card__signal span {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 850;
}

.feedback-card__header > div:last-child { display: grid; gap: 0.08rem; }

.feedback-card__header small {
  color: rgb(255 255 255 / 76%);
  font-size: clamp(10px, 2.65vw, 13px);
  font-weight: 650;
}

.feedback-card h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(20px, 5.3vw, 27px);
  font-weight: 850;
  line-height: 1.25;
}

.feedback-card__body { padding: 1rem; }
.feedback-card__body--with-mascot { padding-right: 29%; }

.feedback-card__result {
  display: block;
  margin-bottom: 0.42rem;
  color: #155b84;
  font-size: clamp(15px, 4vw, 19px);
  font-weight: 850;
}

.feedback-card--retry .feedback-card__result { color: #87571d; }

.feedback-card__message {
  margin: 0 0 0.9rem;
  color: #405765;
  font-size: clamp(12px, 3.25vw, 16px);
  font-weight: 650;
  line-height: 1.5;
}

.feedback-card button {
  width: 100%;
  min-height: 46px;
  padding: 0.65rem 1rem;
  border: 1px solid rgb(0 0 0 / 12%);
  border-radius: 9px;
  background: #176c9e;
  box-shadow: 0 2px 4px rgb(20 47 64 / 16%);
  color: #fff;
  font-size: clamp(14px, 3.6vw, 18px);
  font-weight: 800;
  cursor: pointer;
}

.feedback-card--retry button { background: #a86a20; }
.feedback-card button:active { transform: scale(0.96); }
.feedback-card button:focus-visible { outline: 3px solid #f1c84b; outline-offset: 2px; }

@media (prefers-reduced-motion: no-preference) {
  .feedback-card { animation: level3-feedback-in 240ms ease-out both; }
}

@keyframes level3-feedback-in {
  from { opacity: 0; transform: scale(0.96); }
}
</style>
