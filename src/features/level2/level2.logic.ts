import {
  LEVEL2_DURATION_SECONDS,
  LEVEL2_INITIAL_GUIDE_MESSAGE,
  level2Packages,
} from './level2.config.ts'
import type {
  Level2GameState,
  Level2JudgmentResult,
  Level2Package,
  PackageJudgment,
} from './level2.types'

export const createInitialLevel2State = (
  status: Level2GameState['status'] = 'loading',
): Level2GameState => ({
  status,
  remainingSeconds: LEVEL2_DURATION_SECONDS,
  currentPackageIndex: 0,
  scannedPackageIds: [],
  inspectedPackageIds: [],
  reportedAbnormalPackageIds: [],
  guideMessage: LEVEL2_INITIAL_GUIDE_MESSAGE,
})

export const markCurrentPackageScanned = (
  state: Level2GameState,
  packageItem: Level2Package,
): Level2GameState => {
  if (state.status !== 'scanning' || state.inspectedPackageIds.includes(packageItem.id)) {
    return state
  }

  return {
    ...state,
    status: 'playing',
    scannedPackageIds: state.scannedPackageIds.includes(packageItem.id)
      ? state.scannedPackageIds
      : [...state.scannedPackageIds, packageItem.id],
    guideMessage: '扫描完成！\n对照申报信息作出判断。',
  }
}

export const judgeLevel2Package = (
  state: Level2GameState,
  packageItem: Level2Package,
  judgment: PackageJudgment,
): Level2JudgmentResult => {
  if (
    state.status !== 'playing' ||
    !state.scannedPackageIds.includes(packageItem.id) ||
    state.inspectedPackageIds.includes(packageItem.id)
  ) {
    return { state, outcome: 'ignored' }
  }

  if (judgment !== packageItem.judgment) {
    return {
      outcome: 'incorrect',
      state: {
        ...state,
        status: 'feedback',
        guideMessage: `再比对一下：\n${packageItem.educationPoint}`,
      },
    }
  }

  const inspectedPackageIds = [...state.inspectedPackageIds, packageItem.id]
  const reportedAbnormalPackageIds =
    judgment === 'abnormal'
      ? [...state.reportedAbnormalPackageIds, packageItem.id]
      : state.reportedAbnormalPackageIds
  const isComplete = inspectedPackageIds.length === level2Packages.length

  return {
    outcome: isComplete ? 'success' : 'correct',
    state: {
      ...state,
      status: isComplete ? 'success' : 'feedback',
      inspectedPackageIds,
      reportedAbnormalPackageIds,
      guideMessage: `判断正确！\n${packageItem.educationPoint}`,
    },
  }
}

export const findNextUncheckedPackageIndex = (
  currentIndex: number,
  inspectedPackageIds: readonly string[],
): number => {
  for (let offset = 1; offset <= level2Packages.length; offset += 1) {
    const index = (currentIndex + offset) % level2Packages.length
    if (!inspectedPackageIds.includes(level2Packages[index]!.id)) return index
  }
  return currentIndex
}

export const advanceLevel2Countdown = (state: Level2GameState): Level2GameState => {
  if (state.status !== 'playing' && state.status !== 'scanning') return state

  const remainingSeconds = Math.max(0, state.remainingSeconds - 1)
  if (remainingSeconds > 0) return { ...state, remainingSeconds }

  return {
    ...state,
    status: 'failed',
    remainingSeconds: 0,
    guideMessage: '时间到，再试一次一定能成功！',
  }
}
