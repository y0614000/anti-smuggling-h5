<script setup lang="ts">
defineProps<{
  backgroundImage: string
  inspectedCount: number
  total: number
  reportedCount: number
  reportTotal: number
  remainingSeconds: number
}>()
</script>

<template>
  <section
    class="level3-hud"
    :class="{ 'level3-hud--urgent': remainingSeconds <= 10 }"
    aria-label="第三关巡查进度与剩余时间"
  >
    <img :src="backgroundImage" alt="" decoding="async" draggable="false" />
    <strong class="level3-hud__inspected">{{ inspectedCount }}/{{ total }}</strong>
    <strong class="level3-hud__reported">{{ reportedCount }}/{{ reportTotal }}</strong>
    <strong class="level3-hud__time" :aria-label="`剩余${remainingSeconds}秒`">
      {{ remainingSeconds }}
    </strong>
  </section>
</template>

<style scoped>
.level3-hud {
  position: absolute;
  top: calc(10.4% + env(safe-area-inset-top, 0px));
  left: 50%;
  z-index: 18;
  width: 75%;
  color: #633116;
  font-size: clamp(17px, 4.7vw, 25px);
  font-variant-numeric: tabular-nums;
  font-weight: 850;
  line-height: 1;
  transform: translateX(-50%);
  pointer-events: none;
}

.level3-hud img {
  display: block;
  width: 100%;
  height: auto;
}

.level3-hud strong {
  position: absolute;
  top: 50%;
  min-width: 2.7ch;
  transform: translateY(-58%);
  text-align: center;
  text-shadow: 0 1px 0 rgb(255 255 255 / 75%);
}

.level3-hud__inspected {
  left: 25.5%;
}

.level3-hud__reported {
  left: 59.8%;
}

.level3-hud__time {
  left: 85.3%;
}

.level3-hud--urgent .level3-hud__time {
  color: #d94a20;
}

@media (prefers-reduced-motion: no-preference) {
  .level3-hud--urgent .level3-hud__time {
    animation: level3-hud-warning 900ms ease-in-out infinite alternate;
  }
}

@keyframes level3-hud-warning {
  to {
    opacity: 0.72;
    transform: translateY(-47%) scale(1.08);
  }
}
</style>
