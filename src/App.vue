<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'

import GameMusicControl from './components/common/GameMusicControl.vue'
import { useGameAudio, type GameMusicTrack } from './features/audio/useGameAudio'
import HomeView from './views/HomeView.vue'

const AdventureMapView = defineAsyncComponent({
  loader: () => import('./views/AdventureMapView.vue'),
  delay: 80,
  timeout: 10_000,
})

const MemoirView = defineAsyncComponent({
  loader: () => import('./views/MemoirView.vue'),
  delay: 80,
  timeout: 10_000,
})

const Level1View = defineAsyncComponent({
  loader: () => import('./views/Level1View.vue'),
  delay: 80,
  timeout: 10_000,
})

const Level2View = defineAsyncComponent({
  loader: () => import('./views/Level2View.vue'),
  delay: 80,
  timeout: 10_000,
})

const Level3View = defineAsyncComponent({
  loader: () => import('./views/Level3View.vue'),
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
const hasCompletedSummonGuide = ref(currentHash.value === '#/adventure-map')
const completedLevelCount = ref(readCompletedLevelCount())
const isMapPage = computed(() => currentHash.value === '#/adventure-map')
const isMemoirPage = computed(() => currentHash.value === '#/memoir')
const isLevel1Page = computed(() => currentHash.value === '#/level/1')
const isLevel2Page = computed(() => currentHash.value === '#/level/2')
const isLevel3Page = computed(() => currentHash.value === '#/level/3')
const {
  isMusicPlaying,
  musicButtonLabel,
  playCountdownSound,
  playSuccessSound,
  setMusicTrack,
  startMusicFromUserGesture,
  stopCountdownSound,
  toggleMusic,
} = useGameAudio()

const getMusicTrackForHash = (hash: string): GameMusicTrack =>
  hash === '#/level/1' || hash === '#/level/2' || hash === '#/level/3'
    ? 'level1'
    : 'home-map'

setMusicTrack(getMusicTrackForHash(currentHash.value))

const syncRoute = () => {
  currentHash.value = window.location.hash
  setMusicTrack(getMusicTrackForHash(currentHash.value))
}

const openAdventureMap = () => {
  setMusicTrack('home-map')
  startMusicFromUserGesture()
  hasCompletedSummonGuide.value = true
  window.location.hash = '/adventure-map'
}

const leaveAdventureMap = () => {
  setMusicTrack('home-map')
  startMusicFromUserGesture()
  hasCompletedSummonGuide.value = true
  window.location.hash = '/'
}

const openMemoir = () => {
  setMusicTrack('home-map')
  startMusicFromUserGesture()
  window.location.hash = '/memoir'
}

const leaveMemoir = () => {
  setMusicTrack('home-map')
  startMusicFromUserGesture()
  hasCompletedSummonGuide.value = true
  window.location.hash = '/adventure-map'
}

const openLevel = (level: number) => {
  if (level !== 1 && level !== 2 && level !== 3) return

  setMusicTrack('level1')
  startMusicFromUserGesture()
  window.location.hash = `/level/${level}`
}

const AVAILABLE_LEVELS = new Set([1, 2, 3])

const acquireLevelItem = (level: number) => {
  const isLevelUnlocked = level <= completedLevelCount.value + 1

  if (isLevelUnlocked && AVAILABLE_LEVELS.has(level)) {
    openLevel(level)
    return
  }

  openAdventureMap()
}

const leaveLevel = () => {
  setMusicTrack('home-map')
  startMusicFromUserGesture()
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

const completeLevel2 = () => {
  completedLevelCount.value = Math.max(completedLevelCount.value, 2)
  try {
    window.localStorage.setItem(LEVEL_PROGRESS_STORAGE_KEY, String(completedLevelCount.value))
  } catch {
    // 某些内嵌 WebView 会禁用持久化；本次会话内的完成状态仍然保留。
  }
  leaveLevel()
}

const completeLevel3 = () => {
  completedLevelCount.value = Math.max(completedLevelCount.value, 3)
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
    @open-memoir="openMemoir"
    @select-level="openLevel"
  />
  <MemoirView v-else-if="isMemoirPage" @back="leaveMemoir" />
  <Level1View
    v-else-if="isLevel1Page"
    @back="leaveLevel"
    @complete="completeLevel1"
    @countdown="playCountdownSound"
    @countdown-stop="stopCountdownSound"
    @success="playSuccessSound"
  />
  <Level2View
    v-else-if="isLevel2Page"
    @back="leaveLevel"
    @complete="completeLevel2"
    @countdown="playCountdownSound"
    @countdown-stop="stopCountdownSound"
    @success="playSuccessSound"
  />
  <Level3View
    v-else-if="isLevel3Page"
    @back="leaveLevel"
    @complete="completeLevel3"
    @countdown="playCountdownSound"
    @countdown-stop="stopCountdownSound"
    @success="playSuccessSound"
  />
  <HomeView
    v-else
    :completed-level-count="completedLevelCount"
    :is-summoned="hasCompletedSummonGuide"
    @audio-unlock="startMusicFromUserGesture"
    @acquire-level-item="acquireLevelItem"
    @open-memoir="openMemoir"
    @start="openAdventureMap"
  />
  <GameMusicControl
    :is-playing="isMusicPlaying"
    :label="musicButtonLabel"
    @toggle="toggleMusic"
  />
</template>
