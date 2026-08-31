import {
  LEVEL3_DURATION_SECONDS,
  LEVEL3_INITIAL_GUIDE_MESSAGE,
  level3Cases,
} from './level3.config.ts'
import type {
  Level3Case,
  Level3GameState,
  Level3Judgment,
  Level3JudgmentResult,
} from './level3.types'

export const createInitialLevel3State = (
  status: Level3GameState['status'] = 'loading',
): Level3GameState => ({
  status,
  remainingSeconds: LEVEL3_DURATION_SECONDS,
  currentCaseIndex: 0,
  isCaseOpen: false,
  inspectedCaseIds: [],
  reportedCaseIds: [],
  lastOutcome: null,
  guideMessage: LEVEL3_INITIAL_GUIDE_MESSAGE,
})

export const openCurrentLevel3Case = (state: Level3GameState): Level3GameState => {
  if (state.status !== 'playing' || state.isCaseOpen) return state

  return {
    ...state,
    isCaseOpen: true,
    guideMessage: '认真比对现场和两条线索，\n作出正确处置！',
  }
}

export const selectLevel3Case = (
  state: Level3GameState,
  caseIndex: number,
): Level3GameState => {
  if (
    state.status !== 'playing' ||
    caseIndex < 0 ||
    caseIndex >= level3Cases.length
  ) return state

  return {
    ...state,
    currentCaseIndex: caseIndex,
    isCaseOpen: true,
    guideMessage: `正在查看 ${caseIndex + 1} 号场景……`,
  }
}

export const closeLevel3Case = (state: Level3GameState): Level3GameState => {
  if (state.status !== 'playing' || !state.isCaseOpen) return state

  return {
    ...state,
    isCaseOpen: false,
    guideMessage: LEVEL3_INITIAL_GUIDE_MESSAGE,
  }
}

export const judgeLevel3Case = (
  state: Level3GameState,
  caseItem: Level3Case,
  judgment: Level3Judgment,
): Level3JudgmentResult => {
  if (
    state.status !== 'playing' ||
    !state.isCaseOpen ||
    state.inspectedCaseIds.includes(caseItem.id)
  ) {
    return { state, outcome: 'ignored' }
  }

  if (judgment !== caseItem.judgment) {
    return {
      outcome: 'incorrect',
      state: {
        ...state,
        status: 'feedback',
        lastOutcome: 'incorrect',
        guideMessage: `再观察一下：\n${caseItem.observationHint}`,
      },
    }
  }

  return {
    outcome: 'correct',
    state: {
      ...state,
      status: 'feedback',
      inspectedCaseIds: [...state.inspectedCaseIds, caseItem.id],
      reportedCaseIds:
        judgment === 'report'
          ? [...state.reportedCaseIds, caseItem.id]
          : state.reportedCaseIds,
      lastOutcome: 'correct',
      guideMessage:
        judgment === 'report'
          ? `报告正确！\n${caseItem.educationPoint}`
          : `判断正确！\n${caseItem.educationPoint}`,
    },
  }
}

export const continueLevel3AfterFeedback = (state: Level3GameState): Level3GameState => {
  if (state.status !== 'feedback') return state

  if (state.lastOutcome === 'incorrect') {
    return {
      ...state,
      status: 'playing',
      lastOutcome: null,
      guideMessage: '线索还在，重新判断吧！',
    }
  }

  if (state.inspectedCaseIds.length >= level3Cases.length) {
    return {
      ...state,
      status: 'success',
      lastOutcome: null,
      guideMessage: '港口巡查任务完成！',
    }
  }

  return {
    ...state,
    status: 'playing',
    currentCaseIndex: Math.min(state.currentCaseIndex + 1, level3Cases.length - 1),
    isCaseOpen: false,
    lastOutcome: null,
    guideMessage: LEVEL3_INITIAL_GUIDE_MESSAGE,
  }
}

export const advanceLevel3Countdown = (state: Level3GameState): Level3GameState => {
  if (state.status !== 'playing') return state

  const remainingSeconds = Math.max(0, state.remainingSeconds - 1)
  if (remainingSeconds > 0) return { ...state, remainingSeconds }

  return {
    ...state,
    status: 'failed',
    remainingSeconds: 0,
    guideMessage: '巡查时间到，整理线索再挑战一次吧！',
  }
}
