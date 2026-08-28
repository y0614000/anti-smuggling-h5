export type Level2GameStatus =
  | 'loading'
  | 'playing'
  | 'scanning'
  | 'feedback'
  | 'paused'
  | 'success'
  | 'failed'

export type PackageJudgment = 'normal' | 'abnormal'

export interface Level2Package {
  id: string
  number: number
  declaration: string
  quantity: string
  xrayResult: string
  judgment: PackageJudgment
  educationPoint: string
}

export interface Level2GameState {
  status: Level2GameStatus
  remainingSeconds: number
  currentPackageIndex: number
  scannedPackageIds: string[]
  inspectedPackageIds: string[]
  reportedAbnormalPackageIds: string[]
  guideMessage: string
}

export type Level2JudgmentOutcome = 'ignored' | 'incorrect' | 'correct' | 'success'

export interface Level2JudgmentResult {
  state: Level2GameState
  outcome: Level2JudgmentOutcome
}
