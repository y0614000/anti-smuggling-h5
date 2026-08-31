export type Level3GameStatus =
  | 'loading'
  | 'playing'
  | 'feedback'
  | 'paused'
  | 'success'
  | 'failed'

export type Level3Zone = 'duty-free' | 'priority-goods'
export type Level3Judgment = 'normal' | 'report'
export type Level3JudgmentOutcome = 'ignored' | 'incorrect' | 'correct'

export interface Level3Case {
  id: string
  number: number
  zone: Level3Zone
  category: string
  title: string
  scene: string
  dialogue: readonly {
    speaker: string
    text: string
  }[]
  clues: readonly string[]
  judgment: Level3Judgment
  observationHint: string
  educationPoint: string
  signalPosition: {
    x: number
    y: number
  }
}

export interface Level3GameState {
  status: Level3GameStatus
  remainingSeconds: number
  currentCaseIndex: number
  isCaseOpen: boolean
  inspectedCaseIds: string[]
  reportedCaseIds: string[]
  lastOutcome: Exclude<Level3JudgmentOutcome, 'ignored'> | null
  guideMessage: string
}

export interface Level3JudgmentResult {
  state: Level3GameState
  outcome: Level3JudgmentOutcome
}
