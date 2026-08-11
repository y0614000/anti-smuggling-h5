import {
  INITIAL_GUIDE_MESSAGE,
  LEVEL1_DURATION_SECONDS,
  LEVEL1_SUSPICIOUS_TOTAL,
} from './level1.constants.ts'
import type {
  InspectionResult,
  Level1GameState,
  LuggageItem,
  NormalizedPoint,
} from './level1.types'

export const createInitialLevel1State = (
  status: Level1GameState['status'] = 'loading',
): Level1GameState => ({
  status,
  remainingSeconds: LEVEL1_DURATION_SECONDS,
  foundItemIds: [],
  inspectedNormalItemIds: [],
  hintTargetId: null,
  hintsRemaining: 2,
  hintCoolingDown: false,
  guideMessage: INITIAL_GUIDE_MESSAGE,
})

export const inspectLuggageItem = (
  state: Level1GameState,
  item: LuggageItem,
): InspectionResult => {
  if (state.status !== 'playing') return { state, outcome: 'ignored' }

  if (!item.suspicious) {
    if (state.inspectedNormalItemIds.includes(item.id)) return { state, outcome: 'ignored' }

    return {
      outcome: 'normal',
      state: {
        ...state,
        inspectedNormalItemIds: [...state.inspectedNormalItemIds, item.id],
        guideMessage: item.message,
      },
    }
  }

  if (state.foundItemIds.includes(item.id)) return { state, outcome: 'ignored' }

  const foundItemIds = [...state.foundItemIds, item.id]
  const isComplete = foundItemIds.length === LEVEL1_SUSPICIOUS_TOTAL

  return {
    outcome: isComplete ? 'success' : 'suspicious',
    state: {
      ...state,
      status: isComplete ? 'success' : 'playing',
      foundItemIds,
      hintTargetId: state.hintTargetId === item.id ? null : state.hintTargetId,
      guideMessage: isComplete ? '太棒了，3件可疑物品全部找到了！' : item.message,
    },
  }
}

export const advanceCountdown = (state: Level1GameState): Level1GameState => {
  if (state.status !== 'playing') return state

  const remainingSeconds = Math.max(0, state.remainingSeconds - 1)
  if (remainingSeconds > 0) return { ...state, remainingSeconds }

  return {
    ...state,
    status: 'failed',
    remainingSeconds: 0,
    hintTargetId: null,
    guideMessage: '时间到，再试一次一定能成功！',
  }
}

export const selectHintTarget = (
  items: readonly LuggageItem[],
  foundItemIds: readonly string[],
): string | null => items.find((item) => item.suspicious && !foundItemIds.includes(item.id))?.id ?? null

export const findItemAtPoint = (
  point: NormalizedPoint,
  items: readonly LuggageItem[],
): LuggageItem | undefined => {
  let nearestItem: LuggageItem | undefined
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const item of items) {
    const distance = Math.hypot(point.x - item.hitArea.x, point.y - item.hitArea.y)
    if (distance <= item.hitArea.radius && distance < nearestDistance) {
      nearestDistance = distance
      nearestItem = item
    }
  }

  return nearestItem
}

export const clampPoint = (
  point: NormalizedPoint,
  minimum: NormalizedPoint,
  maximum: NormalizedPoint,
): NormalizedPoint => ({
  x: Math.min(maximum.x, Math.max(minimum.x, point.x)),
  y: Math.min(maximum.y, Math.max(minimum.y, point.y)),
})
