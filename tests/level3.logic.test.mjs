import assert from 'node:assert/strict'
import test from 'node:test'

import {
  LEVEL3_CASE_TOTAL,
  LEVEL3_REPORT_TOTAL,
  level3Cases,
} from '../src/features/level3/level3.config.ts'
import {
  advanceLevel3Countdown,
  closeLevel3Case,
  continueLevel3AfterFeedback,
  createInitialLevel3State,
  judgeLevel3Case,
  openCurrentLevel3Case,
  selectLevel3Case,
} from '../src/features/level3/level3.logic.ts'

test('第三关初始为0/8、180秒，案件尚未展开', () => {
  const state = createInitialLevel3State('playing')

  assert.equal(LEVEL3_CASE_TOTAL, 8)
  assert.equal(LEVEL3_REPORT_TOTAL, 5)
  assert.equal(state.remainingSeconds, 180)
  assert.equal(state.isCaseOpen, false)
  assert.deepEqual(state.inspectedCaseIds, [])
})

test('可以按任意顺序打开和关闭编号场景', () => {
  const initialState = createInitialLevel3State('playing')
  const selectedState = selectLevel3Case(initialState, 6)

  assert.equal(selectedState.currentCaseIndex, 6)
  assert.equal(selectedState.isCaseOpen, true)
  assert.equal(closeLevel3Case(selectedState).isCaseOpen, false)
})

test('未打开巡查信号时不能直接判断', () => {
  const state = createInitialLevel3State('playing')
  const result = judgeLevel3Case(state, level3Cases[0], 'report')

  assert.equal(result.outcome, 'ignored')
  assert.equal(result.state.inspectedCaseIds.length, 0)
})

test('错误判断进入反馈但不计入处置进度', () => {
  const state = openCurrentLevel3Case(createInitialLevel3State('playing'))
  const result = judgeLevel3Case(state, level3Cases[0], 'report')

  assert.equal(result.outcome, 'incorrect')
  assert.equal(result.state.status, 'feedback')
  assert.equal(result.state.inspectedCaseIds.length, 0)

  const retryState = continueLevel3AfterFeedback(result.state)
  assert.equal(retryState.status, 'playing')
  assert.equal(retryState.isCaseOpen, true)
})

test('正常免税购物不会被误计为报告', () => {
  const normalCase = level3Cases.find((caseItem) => caseItem.id === 'personal-duty-free-pickup')
  assert.ok(normalCase)

  const initialState = {
    ...createInitialLevel3State('playing'),
    currentCaseIndex: normalCase.number - 1,
  }
  const openedState = openCurrentLevel3Case(initialState)
  const result = judgeLevel3Case(openedState, normalCase, 'normal')

  assert.equal(result.outcome, 'correct')
  assert.deepEqual(result.state.inspectedCaseIds, [normalCase.id])
  assert.deepEqual(result.state.reportedCaseIds, [])
})

test('全部案件正确处置后进入成功并报告5起风险事件', () => {
  let state = createInitialLevel3State('playing')

  for (const [index, caseItem] of level3Cases.entries()) {
    state = openCurrentLevel3Case({ ...state, currentCaseIndex: index })
    state = judgeLevel3Case(state, caseItem, caseItem.judgment).state
    state = continueLevel3AfterFeedback(state)
  }

  assert.equal(state.status, 'success')
  assert.equal(state.inspectedCaseIds.length, LEVEL3_CASE_TOTAL)
  assert.equal(state.reportedCaseIds.length, LEVEL3_REPORT_TOTAL)
})

test('只有巡查判断阶段会消耗倒计时', () => {
  const playingState = { ...createInitialLevel3State('playing'), remainingSeconds: 2 }
  assert.equal(advanceLevel3Countdown(playingState).remainingSeconds, 1)

  const feedbackState = { ...playingState, status: 'feedback' }
  assert.strictEqual(advanceLevel3Countdown(feedbackState), feedbackState)
})

test('倒计时归零后任务失败', () => {
  const state = { ...createInitialLevel3State('playing'), remainingSeconds: 1 }
  const nextState = advanceLevel3Countdown(state)

  assert.equal(nextState.status, 'failed')
  assert.equal(nextState.remainingSeconds, 0)
})
