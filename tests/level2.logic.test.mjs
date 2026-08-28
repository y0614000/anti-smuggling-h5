import assert from 'node:assert/strict'
import test from 'node:test'

import { level2Packages } from '../src/features/level2/level2.config.ts'
import {
  advanceLevel2Countdown,
  createInitialLevel2State,
  findNextUncheckedPackageIndex,
  judgeLevel2Package,
  markCurrentPackageScanned,
} from '../src/features/level2/level2.logic.ts'

test('第二关初始为0/6、0/3和60秒', () => {
  const state = createInitialLevel2State('playing')
  assert.equal(state.remainingSeconds, 60)
  assert.deepEqual(state.inspectedPackageIds, [])
  assert.deepEqual(state.reportedAbnormalPackageIds, [])
})

test('未扫描的包裹不能直接判断', () => {
  const result = judgeLevel2Package(
    createInitialLevel2State('playing'),
    level2Packages[0],
    'normal',
  )
  assert.equal(result.outcome, 'ignored')
  assert.equal(result.state.inspectedPackageIds.length, 0)
})

test('扫描后正确放行正常包裹', () => {
  const scanningState = { ...createInitialLevel2State('playing'), status: 'scanning' }
  const scannedState = markCurrentPackageScanned(scanningState, level2Packages[0])
  const result = judgeLevel2Package(scannedState, level2Packages[0], 'normal')

  assert.equal(result.outcome, 'correct')
  assert.deepEqual(result.state.inspectedPackageIds, ['package-1'])
  assert.equal(result.state.reportedAbnormalPackageIds.length, 0)
})

test('判断错误时不计入已检查并可以重试', () => {
  const scanningState = { ...createInitialLevel2State('playing'), status: 'scanning' }
  const scannedState = markCurrentPackageScanned(scanningState, level2Packages[1])
  const result = judgeLevel2Package(scannedState, level2Packages[1], 'normal')

  assert.equal(result.outcome, 'incorrect')
  assert.equal(result.state.status, 'feedback')
  assert.equal(result.state.inspectedPackageIds.length, 0)
})

test('六个包裹全部正确判断后通关并上报3个异常包裹', () => {
  let state = createInitialLevel2State('playing')

  for (const packageItem of level2Packages) {
    state = markCurrentPackageScanned({ ...state, status: 'scanning' }, packageItem)
    state = judgeLevel2Package(state, packageItem, packageItem.judgment).state
  }

  assert.equal(state.status, 'success')
  assert.equal(state.inspectedPackageIds.length, 6)
  assert.deepEqual(state.reportedAbnormalPackageIds, ['package-2', 'package-4', 'package-6'])
})

test('导航会跳过已检查包裹', () => {
  assert.equal(findNextUncheckedPackageIndex(0, ['package-2', 'package-3']), 3)
  assert.equal(findNextUncheckedPackageIndex(5, ['package-1']), 1)
})

test('第二关倒计时归零后失败', () => {
  const state = { ...createInitialLevel2State('playing'), remainingSeconds: 1 }
  const nextState = advanceLevel2Countdown(state)

  assert.equal(nextState.status, 'failed')
  assert.equal(nextState.remainingSeconds, 0)
})
