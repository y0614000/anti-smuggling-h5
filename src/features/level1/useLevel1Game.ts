import { onBeforeUnmount, reactive } from 'vue'

import {
  HINT_COOLDOWN_MS,
  HINT_VISIBLE_MS,
  INITIAL_GUIDE_MESSAGE,
  level1Items,
  suspiciousItems,
} from './level1.config'
import {
  advanceCountdown,
  createInitialLevel1State,
  inspectLuggageItem,
  selectHintTarget,
} from './level1.logic'
import type { Level1GameState, LuggageItem } from './level1.types'

const assignState = (target: Level1GameState, source: Level1GameState) => {
  Object.assign(target, source)
}

export const useLevel1Game = () => {
  const state = reactive<Level1GameState>(createInitialLevel1State())
  let countdownTimer: ReturnType<typeof setInterval> | undefined
  let hintTimer: ReturnType<typeof setTimeout> | undefined
  let hintCooldownTimer: ReturnType<typeof setTimeout> | undefined
  let pausedByVisibility = false

  const stopCountdown = () => {
    clearInterval(countdownTimer)
    countdownTimer = undefined
  }

  const startCountdown = () => {
    if (countdownTimer !== undefined || state.status !== 'playing') return

    countdownTimer = setInterval(() => {
      assignState(state, advanceCountdown(state))
      if (state.status !== 'playing') stopCountdown()
    }, 1_000)
  }

  const setStatus = (status: Level1GameState['status']) => {
    state.status = status
    if (status === 'playing') startCountdown()
    else stopCountdown()
  }

  const markReady = () => {
    if (state.status !== 'loading') return
    setStatus('ready')
  }

  const startGame = () => {
    if (state.status !== 'ready') return
    setStatus('playing')
  }

  const inspectItem = (item: LuggageItem) => {
    const result = inspectLuggageItem(state, item)
    assignState(state, result.state)

    if (result.outcome === 'suspicious' || result.outcome === 'success') {
      navigator.vibrate?.(20)
    }
    if (state.status !== 'playing') stopCountdown()

    return result.outcome
  }

  const requestHint = () => {
    if (state.hintCoolingDown || state.hintsRemaining <= 0 || state.status !== 'playing') return null

    const targetId = selectHintTarget(suspiciousItems, state.foundItemIds)
    if (!targetId) return null

    state.hintCoolingDown = true
    state.hintsRemaining -= 1
    state.hintTargetId = targetId
    state.guideMessage = '放大镜闪动的方向藏着一件可疑物品！'

    clearTimeout(hintTimer)
    clearTimeout(hintCooldownTimer)
    hintTimer = setTimeout(() => {
      state.hintTargetId = null
    }, HINT_VISIBLE_MS)
    hintCooldownTimer = setTimeout(() => {
      state.hintCoolingDown = false
    }, HINT_COOLDOWN_MS)

    return targetId
  }

  const pauseGame = () => {
    if (state.status !== 'playing') return false
    setStatus('paused')
    return true
  }

  const resumeGame = () => {
    if (state.status !== 'paused') return
    setStatus('playing')
  }

  const resetGame = () => {
    clearTimeout(hintTimer)
    clearTimeout(hintCooldownTimer)
    pausedByVisibility = false
    assignState(state, createInitialLevel1State('playing'))
    startCountdown()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      pausedByVisibility = pauseGame()
      return
    }

    if (pausedByVisibility) {
      pausedByVisibility = false
      resumeGame()
    }
  }

  const restoreGuide = () => {
    if (state.status === 'playing') state.guideMessage = INITIAL_GUIDE_MESSAGE
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  onBeforeUnmount(() => {
    stopCountdown()
    clearTimeout(hintTimer)
    clearTimeout(hintCooldownTimer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    state,
    items: level1Items,
    markReady,
    startGame,
    inspectItem,
    requestHint,
    pauseGame,
    resumeGame,
    resetGame,
    restoreGuide,
  }
}
