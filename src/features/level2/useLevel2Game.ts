import { onBeforeUnmount, reactive, ref } from 'vue'

import {
  LEVEL2_INITIAL_GUIDE_MESSAGE,
  LEVEL2_SCAN_DURATION_MS,
  level2Packages,
} from './level2.config'
import {
  advanceLevel2Countdown,
  createInitialLevel2State,
  findNextUncheckedPackageIndex,
  judgeLevel2Package,
  markCurrentPackageScanned,
} from './level2.logic'
import type { Level2GameState, PackageJudgment } from './level2.types'

const assignState = (target: Level2GameState, source: Level2GameState) => {
  Object.assign(target, source)
}

export const useLevel2Game = () => {
  const state = reactive<Level2GameState>(createInitialLevel2State())
  const autoAdvanceSequence = ref(0)
  const guideMessageSequence = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | undefined
  let scanTimer: ReturnType<typeof setTimeout> | undefined
  let statusBeforePause: Level2GameState['status'] = 'playing'
  let pausedByVisibility = false

  const currentPackage = () =>
    level2Packages[state.currentPackageIndex] ?? level2Packages[0]!

  const stopCountdown = () => {
    clearInterval(countdownTimer)
    countdownTimer = undefined
  }

  const startCountdown = () => {
    if (
      countdownTimer !== undefined ||
      (state.status !== 'playing' && state.status !== 'scanning')
    ) {
      return
    }

    countdownTimer = setInterval(() => {
      assignState(state, advanceLevel2Countdown(state))
      if (state.status === 'failed') {
        clearTimeout(scanTimer)
        stopCountdown()
      }
    }, 1_000)
  }

  const syncCountdown = () => {
    if (state.status === 'playing' || state.status === 'scanning') startCountdown()
    else stopCountdown()
  }

  const markReady = () => {
    if (state.status !== 'loading') return
    state.status = 'playing'
    startCountdown()
  }

  const selectPackage = (direction: -1 | 1) => {
    if (state.status !== 'playing') return

    state.currentPackageIndex =
      (state.currentPackageIndex + direction + level2Packages.length) % level2Packages.length
    const packageItem = currentPackage()
    state.guideMessage = state.inspectedPackageIds.includes(packageItem.id)
      ? `${packageItem.number}号包裹已检查，\n可以继续查看其他包裹。`
      : state.scannedPackageIds.includes(packageItem.id)
        ? '该包裹已扫描，\n请作出放行或上报判断。'
        : LEVEL2_INITIAL_GUIDE_MESSAGE
  }

  const scanCurrentPackage = () => {
    const packageItem = currentPackage()
    if (
      state.status !== 'playing' ||
      state.scannedPackageIds.includes(packageItem.id) ||
      state.inspectedPackageIds.includes(packageItem.id)
    ) {
      return
    }

    state.status = 'scanning'
    state.guideMessage = `正在扫描${packageItem.number}号包裹……`
    startCountdown()
    clearTimeout(scanTimer)
    scanTimer = setTimeout(() => {
      assignState(state, markCurrentPackageScanned(state, packageItem))
      startCountdown()
    }, LEVEL2_SCAN_DURATION_MS)
  }

  const finishFeedback = (wasCorrect: boolean) => {
    if (state.status !== 'feedback') return

    if (wasCorrect) {
      state.currentPackageIndex = findNextUncheckedPackageIndex(
        state.currentPackageIndex,
        state.inspectedPackageIds,
      )
      autoAdvanceSequence.value += 1
      state.guideMessage = '继续检查下一个包裹吧！'
    } else {
      state.guideMessage = '再仔细观察X光图像，\n重新作出判断吧！'
    }

    state.status = 'playing'
    startCountdown()
  }

  const continueAfterFeedback = () => {
    if (state.status !== 'feedback') return false

    const wasCorrect = state.inspectedPackageIds.includes(currentPackage().id)
    finishFeedback(wasCorrect)
    return true
  }

  const judgeCurrentPackage = (judgment: PackageJudgment) => {
    const judgedPackage = currentPackage()
    const result = judgeLevel2Package(state, judgedPackage, judgment)
    if (result.outcome === 'ignored') return result.outcome

    assignState(state, result.state)
    guideMessageSequence.value += 1
    navigator.vibrate?.(result.outcome === 'incorrect' ? 35 : 20)
    syncCountdown()

    return result.outcome
  }

  const pauseGame = () => {
    if (state.status !== 'playing' && state.status !== 'scanning' && state.status !== 'feedback') {
      return false
    }

    statusBeforePause = state.status === 'scanning' ? 'playing' : state.status
    state.status = 'paused'
    clearTimeout(scanTimer)
    stopCountdown()
    return true
  }

  const resumeGame = () => {
    if (state.status !== 'paused') return
    state.status = statusBeforePause
    startCountdown()
  }

  const resetGame = () => {
    clearTimeout(scanTimer)
    pausedByVisibility = false
    assignState(state, createInitialLevel2State('playing'))
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
    clearTimeout(scanTimer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    state,
    packages: level2Packages,
    autoAdvanceSequence,
    guideMessageSequence,
    markReady,
    selectPackage,
    scanCurrentPackage,
    judgeCurrentPackage,
    continueAfterFeedback,
    pauseGame,
    resumeGame,
    resetGame,
  }
}
