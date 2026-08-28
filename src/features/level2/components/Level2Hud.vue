<script setup lang="ts">
defineProps<{
  backgroundImage: string
  inspectedCount: number
  abnormalCount: number
  remainingSeconds: number
}>()
</script>

<template>
  <section
    class="level2-hud"
    :class="{ 'level2-hud--urgent': remainingSeconds <= 10 }"
    aria-label="包裹检查进度与剩余时间"
  >
    <img :src="backgroundImage" alt="" decoding="async" draggable="false" />
    <strong class="level2-hud__inspected">{{ inspectedCount }}/6</strong>
    <strong class="level2-hud__abnormal">{{ abnormalCount }}/3</strong>
    <strong class="level2-hud__time" :aria-label="`剩余${remainingSeconds}秒`">
      {{ remainingSeconds }}
    </strong>
  </section>
</template>

<style scoped>
.level2-hud {
  position: absolute;
  top: calc(10.5% + env(safe-area-inset-top, 0px));
  left: 50%;
  z-index: 20;
  width: 75%;
  color: #633116;
  font-size: clamp(17px, 4.7vw, 25px);
  font-variant-numeric: tabular-nums;
  font-weight: 850;
  line-height: 1;
  pointer-events: none;
  transform: translateX(-50%);
}

.level2-hud img {
  display: block;
  width: 100%;
  height: auto;
}

.level2-hud strong {
  position: absolute;
  top: 50%;
  min-width: 2.7ch;
  transform: translateY(-58%);
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 75%);
}

.level2-hud__inspected {
  left: 25.5%;
}

.level2-hud__abnormal {
  left: 61.8%;
}

.level2-hud__time {
  left: 87.3%;
}

.level2-hud--urgent .level2-hud__time {
  color: #d94822;
}

@media (prefers-reduced-motion: no-preference) {
  .level2-hud--urgent .level2-hud__time {
    animation: level2-time-warning 900ms ease-in-out infinite alternate;
  }
}

@keyframes level2-time-warning {
  to {
    opacity: 0.72;
    transform: translateY(-47%) scale(1.08);
  }
}
</style>
