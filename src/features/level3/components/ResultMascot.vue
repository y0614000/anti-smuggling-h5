<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'correct' | 'wrong'
    message?: string
    imageSrc?: string
  }>(),
  {
    message: undefined,
    imageSrc: undefined,
  },
)

const feedbackMessage = computed(
  () =>
    props.message ??
    (props.status === 'correct'
      ? '判断得很准！继续保持！'
      : '差一点！再仔细看看关键线索。'),
)
</script>

<template>
  <div class="result-mascot" :class="`result-mascot--${status}`">
    <p>{{ feedbackMessage }}</p>

    <figure v-if="imageSrc" aria-hidden="true">
      <img :src="imageSrc" alt="" decoding="async" draggable="false" />
    </figure>
  </div>
</template>

<style scoped>
.result-mascot p {
  margin: 0 0 0.42rem;
  color: #9a671d;
  font-size: clamp(12px, 3.15vw, 15px);
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.result-mascot--wrong p { color: #7d632f; }

.result-mascot figure {
  position: absolute;
  right: 0.35rem;
  bottom: 3.2rem;
  z-index: 2;
  width: 26%;
  max-width: 7.2rem;
  min-width: 4.8rem;
  margin: 0;
  pointer-events: none;
  transform-origin: 50% 100%;
}

.result-mascot figure::after {
  position: absolute;
  top: 8%;
  left: 2%;
  color: #e9b12b;
  content: '✦';
  font-size: clamp(10px, 2.8vw, 15px);
}

.result-mascot--wrong figure::after { display: none; }
.result-mascot img { display: block; width: 100%; height: auto; }

@media (prefers-reduced-motion: no-preference) {
  .result-mascot figure {
    animation: result-mascot-in 240ms 100ms ease-out both;
  }

  .result-mascot--correct img {
    animation: result-mascot-approve 1.8s 380ms ease-in-out infinite;
  }

  .result-mascot--wrong img {
    animation: result-mascot-remind 2.2s 380ms ease-in-out infinite;
  }
}

@keyframes result-mascot-in {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
}

@keyframes result-mascot-approve {
  0%, 76%, 100% { transform: translateY(0) rotate(0); }
  84% { transform: translateY(-3px) rotate(-1deg); }
  92% { transform: translateY(0) rotate(1deg); }
}

@keyframes result-mascot-remind {
  0%, 78%, 100% { transform: rotate(0); }
  85% { transform: rotate(-1.5deg); }
  92% { transform: rotate(1.5deg); }
}
</style>
