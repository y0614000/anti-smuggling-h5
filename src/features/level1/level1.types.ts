export type Level1GameStatus =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'success'
  | 'failed'
  | 'paused'

export interface NormalizedPoint {
  x: number
  y: number
}

export interface ItemPosition {
  x: number
  y: number
  width: number
  rotation?: number
  zIndex?: number
}

export interface HitArea extends NormalizedPoint {
  radius: number
}

export interface LuggageItem {
  id: string
  name: string
  image: string
  suspicious: boolean
  clueIndex?: number
  message: string
  position: ItemPosition
  hitArea: HitArea
}

export interface Level1GameState {
  status: Level1GameStatus
  remainingSeconds: number
  foundItemIds: string[]
  inspectedNormalItemIds: string[]
  hintTargetId: string | null
  hintsRemaining: number
  hintCoolingDown: boolean
  guideMessage: string
}

export type InspectionOutcome = 'ignored' | 'normal' | 'suspicious' | 'success'

export interface InspectionResult {
  state: Level1GameState
  outcome: InspectionOutcome
}
