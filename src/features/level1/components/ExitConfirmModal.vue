<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

defineProps<{
  backgroundImage: string
  continueButtonImage: string
  confirmButtonImage: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const cancelButton = ref<HTMLButtonElement | null>(null)

onMounted(async () => {
  await nextTick()
  cancelButton.value?.focus()
})
</script>

<template>
  <div class="exit-overlay">
    <section class="exit-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title">
      <img class="exit-dialog__background" :src="backgroundImage" alt="" decoding="async" />

      <div class="exit-dialog__copy">
        <h2 id="exit-title">确定退出吗？</h2>
        <p>退出后本次检查进度将不会保留</p>
      </div>

      <div class="exit-dialog__actions">
        <button ref="cancelButton" type="button" @click="emit('cancel')">
          <img :src="continueButtonImage" alt="" decoding="async" />
          <span>继续检查</span>
        </button>
        <button type="button" @click="emit('confirm')">
          <img :src="confirmButtonImage" alt="" decoding="async" />
          <span>退出关卡</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.exit-overlay {
  position: absolute;
  inset: 0;
  z-index: 90;
  display: grid;
  padding: 6%;
  place-items: center;
  background: rgb(13 45 72 / 60%);
}

.exit-dialog {
  position: relative;
  width: min(88vw, 430px);
  color: #5d2d18;
  text-align: center;
  filter: drop-shadow(0 0.7rem 0.85rem rgb(25 45 63 / 32%));
}

.exit-dialog__background {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.exit-dialog__copy {
  position: absolute;
  inset: 34% 10% 28%;
  display: grid;
  align-content: center;
}

.exit-dialog h2 {
  margin: 0;
  font-size: clamp(23px, 6.2vw, 32px);
  font-weight: 900;
  text-shadow: 0 1px 0 rgb(255 255 255 / 85%);
}

.exit-dialog p {
  margin: 0.55rem 0 0;
  font-size: clamp(13px, 3.55vw, 17px);
  font-weight: 700;
  line-height: 1.35;
  text-shadow: 0 1px 0 rgb(255 255 255 / 75%);
}

.exit-dialog__actions {
  position: absolute;
  right: 8.5%;
  bottom: 11%;
  left: 8.5%;
  display: flex;
  gap: 4%;
}

.exit-dialog button {
  position: relative;
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.exit-dialog button img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.exit-dialog button span {
  position: absolute;
  inset: 0;
  display: grid;
  padding-bottom: 2%;
  place-items: center;
  color: #fff;
  font-size: clamp(15px, 4.2vw, 22px);
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 2px 1px rgb(35 73 118 / 65%);
  pointer-events: none;
}

.exit-dialog button:focus-visible {
  border-radius: 999px;
  outline: clamp(2px, 0.7vw, 4px) solid #fff;
  outline-offset: 2px;
}

.exit-dialog button:active {
  transform: scale(0.96);
}
</style>
