import { onBeforeUnmount, reactive } from 'vue'

import { level3Cases } from './level3.config'
import {
  advanceLevel3Countdown,
  closeLevel3Case,
  continueLevel3AfterFeedback,
  createInitialLevel3State,
  judgeLevel3Case,
  openCurrentLevel3Case,
  selectLevel3Case,
} from './level3.logic'
import type { Level3GameState, Level3Judgment } from './level3.types'

const assignState = (target: Level3GameState, source: Level3GameState) => {
  Object.assign(target, source)
}

export const useLevel3Game = () => {
  const state = reactive<Level3GameState>(createInitialLevel3State())
  let countdownTimer: ReturnType<typeof setInterval> | undefined
  let statusBeforePause: Level3GameState['status'] = 'playing'
  let pausedByVisibility = false

  const currentCase = () => level3Cases[state.currentCaseIndex] ?? level3Cases[0]!

  const stopCountdown = () => {
    clearInterval(countdownTimer)
    countdownTimer = undefined
  }

  const startCountdown = () => {
    if (countdownTimer !== undefined || state.status !== 'playing') return

    countdownTimer = setInterval(() => {
      assignState(state, advanceLevel3Countdown(state))
      if (state.status !== 'playing') stopCountdown()
    }, 1_000)
  }

  const syncCountdown = () => {
    if (state.status === 'playing') startCountdown()
    else stopCountdown()
  }

  const markReady = () => {
    if (state.status !== 'loading') return
    state.status = 'playing'
    startCountdown()
  }

  const openCase = () => {
    assignState(state, openCurrentLevel3Case(state))
  }

  const selectCase = (caseIndex: number) => {
    assignState(state, selectLevel3Case(state, caseIndex))
  }

  const closeCase = () => {
    assignState(state, closeLevel3Case(state))
  }

  const judgeCurrentCase = (judgment: Level3Judgment) => {
    const result = judgeLevel3Case(state, currentCase(), judgment)
    if (result.outcome === 'ignored') return result.outcome

    assignState(state, result.state)
    navigator.vibrate?.(result.outcome === 'incorrect' ? [35, 30, 35] : 22)
    syncCountdown()
    return result.outcome
  }

  const continueAfterFeedback = () => {
    assignState(state, continueLevel3AfterFeedback(state))
    syncCountdown()
  }

  const pauseGame = () => {
    if (state.status !== 'playing' && state.status !== 'feedback') return false

    statusBeforePause = state.status
    state.status = 'paused'
    stopCountdown()
    return true
  }

  const resumeGame = () => {
    if (state.status !== 'paused') return
    state.status = statusBeforePause
    syncCountdown()
  }

  const resetGame = () => {
    pausedByVisibility = false
    assignState(state, createInitialLevel3State('playing'))
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

  document.addEventListener('visibilitychange', handleVisibilityChange)

  onBeforeUnmount(() => {
    stopCountdown()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    state,
    cases: level3Cases,
    markReady,
    openCase,
    selectCase,
    closeCase,
    judgeCurrentCase,
    continueAfterFeedback,
    pauseGame,
    resumeGame,
    resetGame,
  }
}
