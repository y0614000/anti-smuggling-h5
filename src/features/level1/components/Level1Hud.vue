<script setup lang="ts">
defineProps<{
  backgroundImage: string
  foundCount: number
  total: number
  remainingSeconds: number
}>()
</script>

<template>
  <section
    class="level1-hud"
    :class="{ 'level1-hud--urgent': remainingSeconds <= 10 }"
    aria-label="关卡进度与剩余时间"
  >
    <img :src="backgroundImage" alt="" decoding="async" draggable="false" />
    <strong class="level1-hud__progress">{{ foundCount }}/{{ total }}</strong>
    <strong class="level1-hud__time" :aria-label="`剩余${remainingSeconds}秒`">
      {{ remainingSeconds }}
    </strong>
  </section>
</template>

<style scoped>
.level1-hud {
  position: absolute;
  top: calc(10.5% + env(safe-area-inset-top, 0px));
  left: 50%;
  z-index: 20;
  width: 66%;
  transform: translateX(-50%);
  color: #633116;
  font-size: clamp(17px, 4.7vw, 25px);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  pointer-events: none;
}

.level1-hud img {
  display: block;
  width: 100%;
  height: auto;
}

.level1-hud strong {
  position: absolute;
  top: 50%;
  min-width: 2.7ch;
  transform: translateY(-48%);
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 75%);
}

.level1-hud__progress {
  left: 48%;
}

.level1-hud__time {
  left: 82.5%;
}

.level1-hud--urgent .level1-hud__time {
  color: #d94822;
}

@media (prefers-reduced-motion: no-preference) {
  .level1-hud--urgent .level1-hud__time {
    animation: level1-time-warning 900ms ease-in-out infinite alternate;
  }
}

@keyframes level1-time-warning {
  to {
    opacity: 0.72;
    transform: translateY(-48%) scale(1.08);
  }
}
</style>
