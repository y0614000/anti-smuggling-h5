import { computed, readonly, ref } from 'vue'

import carefreeMusicUrl from '../../assets/audio/bgm/Carefree.mp3'
import investigationsMusicUrl from '../../assets/audio/bgm/Investigations.mp3'
import successSoundUrl from '../../assets/audio/sfx/mixkit-fantasy-game-success-notification-270.wav'

export type GameMusicTrack = 'home-map' | 'level1'

const MUSIC_URLS: Record<GameMusicTrack, string> = {
  'home-map': carefreeMusicUrl,
  level1: investigationsMusicUrl,
}

const BACKGROUND_VOLUME = 0.42
const DUCKED_BACKGROUND_VOLUME = 0.16
const SUCCESS_SOUND_VOLUME = 0.72

const isMusicEnabled = ref(true)
const isMusicPlaying = ref(false)
const isMusicPending = ref(false)
const currentTrack = ref<GameMusicTrack>('home-map')

let backgroundAudio: HTMLAudioElement | undefined
let successAudio: HTMLAudioElement | undefined
let playbackRequestId = 0

const createBackgroundAudio = () => {
  const audio = new Audio(MUSIC_URLS[currentTrack.value])
  audio.loop = true
  audio.preload = 'none'
  audio.volume = BACKGROUND_VOLUME

  audio.addEventListener('playing', () => {
    isMusicPending.value = false
    isMusicPlaying.value = true
  })
  audio.addEventListener('pause', () => {
    isMusicPlaying.value = false
  })
  audio.addEventListener('error', () => {
    isMusicPending.value = false
    isMusicPlaying.value = false
  })

  return audio
}

const getBackgroundAudio = () => {
  backgroundAudio ??= createBackgroundAudio()
  return backgroundAudio
}

const getSuccessAudio = () => {
  if (successAudio) return successAudio

  successAudio = new Audio(successSoundUrl)
  successAudio.preload = 'auto'
  successAudio.volume = SUCCESS_SOUND_VOLUME

  const restoreBackgroundVolume = () => {
    if (backgroundAudio) backgroundAudio.volume = BACKGROUND_VOLUME
  }

  successAudio.addEventListener('ended', restoreBackgroundVolume)
  successAudio.addEventListener('pause', restoreBackgroundVolume)
  successAudio.addEventListener('error', restoreBackgroundVolume)

  return successAudio
}

const playMusic = async () => {
  if (!isMusicEnabled.value || isMusicPlaying.value || isMusicPending.value) return

  const audio = getBackgroundAudio()
  const requestId = ++playbackRequestId
  isMusicPending.value = true

  try {
    await audio.play()
    if (requestId !== playbackRequestId) return
    isMusicPending.value = false
    isMusicPlaying.value = !audio.paused
  } catch {
    if (requestId !== playbackRequestId) return
    isMusicPending.value = false
    isMusicPlaying.value = false
  }
}

const pauseMusic = () => {
  playbackRequestId += 1
  isMusicPending.value = false
  backgroundAudio?.pause()
  if (successAudio && !successAudio.paused) {
    successAudio.pause()
    successAudio.currentTime = 0
  }
  isMusicPlaying.value = false
}

const toggleMusic = () => {
  if (isMusicPlaying.value || isMusicPending.value) {
    isMusicEnabled.value = false
    pauseMusic()
    return
  }

  isMusicEnabled.value = true
  void playMusic()
}

const startMusicFromUserGesture = () => {
  if (!isMusicEnabled.value) return
  void playMusic()
}

const setMusicTrack = (track: GameMusicTrack) => {
  if (currentTrack.value === track) return

  const shouldContinuePlaying = isMusicPlaying.value || isMusicPending.value
  currentTrack.value = track

  if (!backgroundAudio) return

  pauseMusic()
  backgroundAudio.volume = BACKGROUND_VOLUME
  backgroundAudio.src = MUSIC_URLS[track]
  backgroundAudio.currentTime = 0
  backgroundAudio.load()

  if (shouldContinuePlaying && isMusicEnabled.value) void playMusic()
}

const playSuccessSound = () => {
  if (!isMusicEnabled.value) return

  const audio = getSuccessAudio()
  if (backgroundAudio && isMusicPlaying.value) {
    backgroundAudio.volume = DUCKED_BACKGROUND_VOLUME
  }

  try {
    audio.currentTime = 0
  } catch {
    // iOS 在音频元数据尚未就绪时可能拒绝设置 currentTime。
  }

  void audio.play().catch(() => {
    if (backgroundAudio) backgroundAudio.volume = BACKGROUND_VOLUME
  })
}

export const useGameAudio = () => ({
  currentTrack: readonly(currentTrack),
  isMusicEnabled: readonly(isMusicEnabled),
  isMusicPlaying: readonly(isMusicPlaying),
  musicButtonLabel: computed(() =>
    isMusicPlaying.value || isMusicPending.value ? '暂停背景音乐' : '播放背景音乐',
  ),
  pauseMusic,
  playMusic,
  playSuccessSound,
  setMusicTrack,
  startMusicFromUserGesture,
  toggleMusic,
})
