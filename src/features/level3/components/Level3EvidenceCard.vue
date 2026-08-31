<script setup lang="ts">
import type { Level3Case, Level3Judgment } from '../level3.types'

defineProps<{
  caseItem: Level3Case
  illustration: string
  whistleImage: string
  reviewed: boolean
}>()

const emit = defineEmits<{
  close: []
  judge: [judgment: Level3Judgment]
}>()
</script>

<template>
  <div class="evidence-overlay" role="presentation" @click.self="emit('close')">
    <section
      class="evidence-card"
      :class="`evidence-card--${caseItem.zone}`"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`level3-case-${caseItem.id}`"
    >
      <header class="evidence-card__header">
        <div>
          <strong>{{ caseItem.category }}</strong>
          <small>{{ caseItem.number }}号巡查场景</small>
        </div>
        <button type="button" aria-label="返回港口全景" @click="emit('close')">×</button>
      </header>

      <div class="evidence-card__art">
        <img :src="illustration" :alt="caseItem.scene" decoding="async" draggable="false" />
      </div>

      <div class="evidence-card__copy">
        <h2 :id="`level3-case-${caseItem.id}`">{{ caseItem.title }}</h2>
      </div>

      <div class="evidence-card__dialogue" aria-label="现场对话">
        <article
          v-for="(line, index) in caseItem.dialogue"
          :key="`${line.speaker}-${index}`"
          :class="{ 'evidence-card__dialogue-line--right': index % 2 === 1 }"
        >
          <strong>{{ line.speaker }}</strong>
          <p>{{ line.text }}</p>
        </article>
      </div>

      <template v-if="!reviewed">
        <p class="evidence-card__question">根据现场对话判断：这个行为是否正常？</p>
        <div class="evidence-card__actions">
          <button type="button" class="evidence-card__normal" @click="emit('judge', 'normal')">
            <span aria-hidden="true">✓</span><strong>正常行为</strong>
          </button>
          <button type="button" class="evidence-card__report" @click="emit('judge', 'report')">
            <img :src="whistleImage" alt="" draggable="false" /><strong>可疑，报告</strong>
          </button>
        </div>
      </template>
      <button v-else type="button" class="evidence-card__reviewed" @click="emit('close')">
        ✓ 该场景已完成，返回全景
      </button>
    </section>
  </div>
</template>

<style scoped>
.evidence-overlay {
  position: absolute;
  inset: 0;
  z-index: 46;
  display: grid;
  padding: calc(9.5% + env(safe-area-inset-top, 0px)) 4% calc(2.5% + env(safe-area-inset-bottom, 0px));
  place-items: center;
  background: rgb(4 34 58 / 68%);
}

.evidence-card {
  position: relative;
  display: flex;
  width: min(92vw, 460px);
  max-height: 100%;
  flex-direction: column;
  overflow: auto;
  border: 2px solid #d6c08d;
  border-radius: clamp(14px, 4vw, 20px);
  background: #f8f6ee;
  box-shadow: 0 0.85rem 1.6rem rgb(3 24 43 / 36%);
  color: #24485f;
  scrollbar-width: none;
}

.evidence-card::-webkit-scrollbar { display: none; }

.evidence-card__header {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  min-height: 58px;
  padding: 0.65rem 0.75rem 0.62rem 1rem;
  align-items: center;
  justify-content: space-between;
  background: #08679f;
  color: #fff;
}

.evidence-card--priority-goods .evidence-card__header {
  background: #155579;
}

.evidence-card__header div { display: grid; gap: 0.08rem; }
.evidence-card__header strong { font-size: clamp(14px, 3.8vw, 18px); font-weight: 850; letter-spacing: 0.02em; }
.evidence-card__header small { color: rgb(255 255 255 / 78%); font-size: clamp(10px, 2.7vw, 13px); font-weight: 650; }
.evidence-card__header button { display: grid; width: 2rem; height: 2rem; padding: 0 0 0.12rem; place-items: center; border: 1px solid rgb(255 255 255 / 58%); border-radius: 7px; background: transparent; color: #fff; font: 700 1.55rem/1 sans-serif; cursor: pointer; }

.evidence-card__art { min-height: clamp(165px, 27vh, 245px); overflow: hidden; border-bottom: 1px solid #cad9dc; background: #e7f3f5; }
.evidence-card__art img { display: block; width: 100%; height: clamp(165px, 27vh, 245px); object-fit: contain; }

.evidence-card__copy { padding: 0.7rem 1rem 0.48rem; text-align: left; }
.evidence-card__copy h2 { margin: 0; color: #154f78; font-size: clamp(17px, 4.6vw, 22px); font-weight: 850; line-height: 1.25; }

.evidence-card__dialogue { display: grid; padding: 0 1rem 0.5rem; gap: 0.48rem; }
.evidence-card__dialogue article { max-width: 88%; justify-self: start; }
.evidence-card__dialogue article.evidence-card__dialogue-line--right { justify-self: end; text-align: right; }
.evidence-card__dialogue strong { display: block; margin: 0 0.28rem 0.16rem; color: #17658d; font-size: clamp(10px, 2.75vw, 13px); line-height: 1.35; }
.evidence-card__dialogue p { margin: 0; padding: 0.5rem 0.68rem; border: 1px solid #afd5e5; border-radius: 12px 12px 12px 3px; background: #e4f4f9; color: #304d5d; font-size: clamp(11px, 2.95vw, 14px); font-weight: 650; line-height: 1.45; text-align: left; }
.evidence-card__dialogue-line--right p { border-color: #ddcb8f; border-radius: 12px 12px 3px; background: #fff2c9; }

.evidence-card__question { margin: 0 1rem 0.52rem; padding-top: 0.56rem; border-top: 1px solid #bfcac9; color: #55452e; font-size: clamp(12px, 3.15vw, 15px); font-weight: 750; text-align: center; }
.evidence-card__actions { display: grid; padding: 0 1rem 0.9rem; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.evidence-card__actions button,
.evidence-card__reviewed { display: flex; min-height: 46px; padding: 0.42rem; align-items: center; justify-content: center; border: 1px solid rgb(0 0 0 / 12%); border-radius: 9px; box-shadow: 0 2px 4px rgb(20 47 64 / 16%); color: #fff; cursor: pointer; }
.evidence-card__normal { background: #16865f; }
.evidence-card__report { background: #d5741f; }
.evidence-card__actions span { margin-right: 0.28rem; font-size: 1rem; font-weight: 800; }
.evidence-card__actions img { width: 1.45rem; height: 1.45rem; margin-right: 0.24rem; object-fit: contain; }
.evidence-card__actions strong { font-size: clamp(12px, 3.3vw, 16px); font-weight: 800; }
.evidence-card__reviewed { margin: 0.15rem 1rem 0.9rem; background: #176c9e; font-size: clamp(12px, 3.3vw, 16px); font-weight: 800; }
.evidence-card button:active { transform: scale(0.97); }
.evidence-card button:focus-visible { outline: 3px solid #f1c84b; outline-offset: 2px; }

@media (max-height: 680px) {
  .evidence-overlay { padding-top: calc(9% + env(safe-area-inset-top, 0px)); }
  .evidence-card__art,
  .evidence-card__art img { min-height: 140px; height: 140px; }
}

@media (prefers-reduced-motion: no-preference) {
  .evidence-card { animation: level3-card-in 240ms ease-out both; }
}

@keyframes level3-card-in {
  from { opacity: 0; transform: translateY(1rem); }
}
</style>
