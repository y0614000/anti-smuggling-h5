<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'success' | 'failed'
  backgroundImage: string
  buttonImage?: string
  retryButtonImage?: string
  backMapButtonImage?: string
  inspectedCount: number
}>()

const emit = defineEmits<{
  primary: []
  back: []
}>()

const isSuccess = computed(() => props.type === 'success')
</script>

<template>
  <div class="result-overlay" role="presentation">
    <section
      class="result-modal"
      :class="`result-modal--${type}`"
      role="dialog"
      aria-modal="true"
      :aria-label="isSuccess ? '包裹检查完成' : '包裹检查时间到'"
    >
      <img :src="backgroundImage" alt="" decoding="async" draggable="false" />

      <div class="result-modal__copy">
        <p>{{ isSuccess ? '成功检查6个包裹！' : `已检查${inspectedCount}/6个包裹` }}</p>
        <strong>{{ isSuccess ? '获得道具：知识徽章' : '还差一点，再试一次吧！' }}</strong>
      </div>

      <button
        v-if="isSuccess && buttonImage"
        class="result-modal__primary"
        type="button"
        @click="emit('primary')"
      >
        <img :src="buttonImage" alt="" decoding="async" draggable="false" />
        <span>领取奖励</span>
      </button>

      <div v-else class="result-modal__failure-actions">
        <button type="button" aria-label="返回地图" @click="emit('back')">
          <img :src="backMapButtonImage" alt="" decoding="async" draggable="false" />
        </button>
        <button type="button" aria-label="重新挑战" @click="emit('primary')">
          <img :src="retryButtonImage" alt="" decoding="async" draggable="false" />
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
  background: rgb(13 45 72 / 58%);
}

.result-modal {
  position: relative;
  width: min(84vw, 440px);
  filter: drop-shadow(0 0.8rem 1rem rgb(17 39 58 / 35%));
}

.result-modal > img:first-child,
.result-modal button img {
  display: block;
  width: 100%;
  height: auto;
}

.result-modal__copy {
  position: absolute;
  inset: 48% 10% 21%;
  display: grid;
  align-content: center;
  color: #663019;
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 85%);
}

.result-modal__copy p {
  margin: 0 0 0.8rem;
  font-size: clamp(18px, 5vw, 27px);
  font-weight: 850;
}

.result-modal__copy strong {
  font-size: clamp(15px, 4.2vw, 22px);
  line-height: 1.45;
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
  appearance: none;
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
  appearance: none;
}

.result-modal button:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: no-preference) {
  .result-overlay {
    animation: level2-overlay-in 180ms ease-out both;
  }

  .result-modal {
    animation: level2-result-in 420ms cubic-bezier(0.22, 1.25, 0.35, 1) both;
  }
}

@keyframes level2-overlay-in {
  from { opacity: 0; }
}

@keyframes level2-result-in {
  from {
    opacity: 0;
    transform: translateY(8%) scale(0.82);
  }
}
</style>
