<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'success' | 'failed'
  backgroundImage: string
  buttonImage?: string
  retryButtonImage?: string
  backMapButtonImage?: string
  inspectedCount: number
  total: number
}>()

const emit = defineEmits<{
  primary: []
  back: []
}>()

const isSuccess = computed(() => props.type === 'success')
</script>

<template>
  <div class="result-overlay" role="presentation">
    <section class="result-modal" role="dialog" aria-modal="true" :aria-label="isSuccess ? '第三关完成' : '巡查时间到'">
      <img class="result-modal__background" :src="backgroundImage" alt="" draggable="false" />

      <div class="result-modal__copy">
        <p>{{ isSuccess ? '港口巡查任务完成！' : `已处置${inspectedCount}/${total}个事件` }}</p>
        <strong>{{ isSuccess ? '获得道具：巡查小哨子' : '整理线索，再挑战一次吧！' }}</strong>
      </div>

      <button v-if="isSuccess && buttonImage" class="result-modal__primary" type="button" @click="emit('primary')">
        <img :src="buttonImage" alt="" draggable="false" />
        <span>领取奖励</span>
      </button>

      <div v-else class="result-modal__failure-actions">
        <button type="button" aria-label="返回地图" @click="emit('back')">
          <img :src="backMapButtonImage" alt="" draggable="false" />
        </button>
        <button type="button" aria-label="重新挑战" @click="emit('primary')">
          <img :src="retryButtonImage" alt="" draggable="false" />
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.result-overlay {
  position: absolute;
  inset: 0;
  z-index: 80;
  display: grid;
  padding: env(safe-area-inset-top, 0px) 5% env(safe-area-inset-bottom, 0px);
  place-items: center;
  background: rgb(6 37 68 / 64%);
}

.result-modal {
  position: relative;
  width: min(86vw, 440px);
  filter: drop-shadow(0 0.85rem 1rem rgb(17 39 58 / 38%));
}

.result-modal__background,
.result-modal button img {
  display: block;
  width: 100%;
  height: auto;
}

.result-modal__copy {
  position: absolute;
  inset: 49% 8% 21%;
  display: grid;
  align-content: center;
  color: #663019;
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 85%);
}

.result-modal__copy p {
  margin: 0 0 0.55rem;
  font-size: clamp(18px, 5vw, 27px);
  font-weight: 900;
}

.result-modal__copy strong {
  font-size: clamp(14px, 4vw, 21px);
  line-height: 1.4;
}

.result-modal__primary {
  position: absolute;
  right: 26%;
  bottom: 4.2%;
  left: 26%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.result-modal__primary span {
  position: absolute;
  inset: 0;
  display: grid;
  padding-bottom: 2%;
  place-items: center;
  color: #fff;
  font-size: clamp(18px, 5vw, 27px);
  font-weight: 900;
  text-shadow: 0 2px 1px rgb(50 64 93 / 65%);
}

.result-modal__failure-actions {
  position: absolute;
  right: 7.5%;
  bottom: 6.8%;
  left: 7.5%;
  display: flex;
  gap: 2.5%;
}

.result-modal__failure-actions button {
  width: 48.75%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.result-modal button:active { transform: scale(0.96); }

@media (prefers-reduced-motion: no-preference) {
  .result-modal { animation: level3-result-in 420ms cubic-bezier(0.22, 1.25, 0.35, 1) both; }
}

@keyframes level3-result-in {
  from { opacity: 0; transform: translateY(8%) scale(0.82); }
}

</style>
