<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'

import HomeView from './views/HomeView.vue'

const AdventureMapView = defineAsyncComponent({
  loader: () => import('./views/AdventureMapView.vue'),
  delay: 80,
  timeout: 10_000,
})

const Level1View = defineAsyncComponent({
  loader: () => import('./views/Level1View.vue'),
  delay: 80,
  timeout: 10_000,
})

const LEVEL_PROGRESS_STORAGE_KEY = 'anti-smuggling-h5:completed-level-count'

const readCompletedLevelCount = () => {
  try {
    const storedValue = Number.parseInt(
      window.localStorage.getItem(LEVEL_PROGRESS_STORAGE_KEY) ?? '0',
      10,
    )
    return Number.isFinite(storedValue) ? Math.min(3, Math.max(0, storedValue)) : 0
  } catch {
    return 0
  }
}

const currentHash = ref(window.location.hash)
const enteredMapFromHome = ref(false)
const hasCompletedSummonGuide = ref(currentHash.value === '#/adventure-map')
const completedLevelCount = ref(readCompletedLevelCount())
const isMapPage = computed(() => currentHash.value === '#/adventure-map')
const isLevel1Page = computed(() => currentHash.value === '#/level/1')

const syncRoute = () => {
  currentHash.value = window.location.hash
}

const openAdventureMap = () => {
  enteredMapFromHome.value = true
  hasCompletedSummonGuide.value = true
  window.location.hash = '/adventure-map'
}

const leaveAdventureMap = () => {
  hasCompletedSummonGuide.value = true

  if (enteredMapFromHome.value) {
    enteredMapFromHome.value = false
    window.history.back()
    return
  }

  window.location.hash = '/'
}

const openLevel = (level: number) => {
  if (level === 1) window.location.hash = '/level/1'
}

const leaveLevel = () => {
  window.location.hash = '/adventure-map'
}

const completeLevel1 = () => {
  completedLevelCount.value = Math.max(completedLevelCount.value, 1)
  try {
    window.localStorage.setItem(LEVEL_PROGRESS_STORAGE_KEY, String(completedLevelCount.value))
  } catch {
    // 某些内嵌 WebView 会禁用持久化；本次会话内的完成状态仍然保留。
  }
  leaveLevel()
}

onMounted(() => window.addEventListener('hashchange', syncRoute))
onBeforeUnmount(() => window.removeEventListener('hashchange', syncRoute))
</script>

<template>
  <AdventureMapView
    v-if="isMapPage"
    :completed-level-count="completedLevelCount"
    @back="leaveAdventureMap"
    @select-level="openLevel"
  />
  <Level1View v-else-if="isLevel1Page" @back="leaveLevel" @complete="completeLevel1" />
  <HomeView v-else :is-summoned="hasCompletedSummonGuide" @start="openAdventureMap" />
</template>
