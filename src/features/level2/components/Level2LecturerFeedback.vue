<script setup lang="ts">
defineProps<{
  chalkboardImage: string
  lecturerImage: string
  title: string
  message: string
  continueLabel: string
}>()

const emit = defineEmits<{
  continue: []
}>()
</script>

<template>
  <section
    class="level2-lecturer-feedback"
    role="dialog"
    aria-modal="true"
    aria-labelledby="level2-lecturer-feedback-title"
    aria-describedby="level2-lecturer-feedback-message"
  >
    <div class="level2-lecturer-feedback__shade" aria-hidden="true"></div>

    <button
      class="level2-lecturer-feedback__chalkboard"
      type="button"
      :aria-label="`${title}${message}，${continueLabel}`"
      @click="emit('continue')"
    >
      <img :src="chalkboardImage" alt="" decoding="async" draggable="false" />
      <span class="level2-lecturer-feedback__content">
        <strong id="level2-lecturer-feedback-title">{{ title }}</strong>
        <span id="level2-lecturer-feedback-message">{{ message }}</span>
        <small>{{ continueLabel }}</small>
      </span>
    </button>

    <img
      class="level2-lecturer-feedback__mascot"
      :src="lecturerImage"
      alt="国门小卫士讲解员"
      decoding="async"
      draggable="false"
    />
  </section>
</template>

<style scoped>
.level2-lecturer-feedback {
  position: absolute;
  inset: 0;
  z-index: 55;
  overflow: hidden;
  pointer-events: none;
}

.level2-lecturer-feedback__shade {
  position: absolute;
  inset: 47% 0 0;
  background: linear-gradient(to bottom, transparent, rgb(20 36 47 / 16%));
}

.level2-lecturer-feedback__chalkboard {
  position: absolute;
  bottom: calc(1.2% + env(safe-area-inset-bottom, 0px));
  left: 2%;
  width: 78%;
  aspect-ratio: 717 / 619;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
  animation: level2-chalkboard-enter 420ms cubic-bezier(0.2, 0.9, 0.25, 1.15) both;
  filter: drop-shadow(0 0.35rem 0.45rem rgb(29 18 7 / 30%));
  touch-action: manipulation;
}

.level2-lecturer-feedback__chalkboard > img {
  position: absolute;
  top: -49.27%;
  left: -12.55%;
  display: block;
  width: 124.97%;
  max-width: none;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.level2-lecturer-feedback__content {
  position: absolute;
  inset: 14% 12% 22% 12%;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: center;
  color: #fffbe5;
  line-height: 1.28;
  text-align: center;
  text-shadow:
    0 2px 1px rgb(0 0 0 / 50%),
    0 0 0.3rem rgb(255 255 255 / 14%);
}

.level2-lecturer-feedback__content strong {
  color: #ffe66c;
  font-size: clamp(15px, 4.2vw, 23px);
  font-weight: 900;
  letter-spacing: 0.05em;
}

.level2-lecturer-feedback__content > span {
  display: grid;
  padding: 0.2em 0;
  place-items: center;
  font-size: clamp(11px, 3.2vw, 17px);
  font-weight: 750;
  text-wrap: balance;
  white-space: pre-line;
}

.level2-lecturer-feedback__content small {
  display: block;
  justify-self: center;
  padding: 0.2em 0.7em;
  border-radius: 999px;
  background: rgb(12 42 54 / 58%);
  color: #bdeaff;
  font-size: clamp(10px, 2.7vw, 14px);
  font-weight: 800;
}

.level2-lecturer-feedback__mascot {
  position: absolute;
  right: -1.5%;
  bottom: -0.8%;
  z-index: 2;
  display: block;
  width: 32%;
  height: auto;
  pointer-events: none;
  animation: level2-lecturer-enter 520ms 80ms cubic-bezier(0.2, 0.9, 0.25, 1.12) both;
  filter: drop-shadow(0 0.3rem 0.35rem rgb(44 21 4 / 24%));
  user-select: none;
  -webkit-user-drag: none;
}

.level2-lecturer-feedback__chalkboard:active {
  transform: scale(0.98);
}

.level2-lecturer-feedback__chalkboard:focus-visible {
  outline: 3px solid #fff1a8;
  outline-offset: -6px;
}

@keyframes level2-chalkboard-enter {
  from {
    opacity: 0;
    transform: translateY(14%) scale(0.93);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes level2-lecturer-enter {
  from {
    opacity: 0;
    transform: translate3d(38%, 10%, 0) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .level2-lecturer-feedback__chalkboard,
  .level2-lecturer-feedback__mascot {
    animation: none;
  }
}
</style>
