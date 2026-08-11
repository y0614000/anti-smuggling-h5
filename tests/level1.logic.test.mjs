import assert from 'node:assert/strict'
import test from 'node:test'

import {
  advanceCountdown,
  clampPoint,
  createInitialLevel1State,
  findItemAtPoint,
  inspectLuggageItem,
  selectHintTarget,
} from '../src/features/level1/level1.logic.ts'

const createItem = (id, suspicious, x) => ({
  id,
  name: id,
  image: `${id}.png`,
  suspicious,
  clueIndex: suspicious ? Number(id.at(-1)) - 1 : undefined,
  message: `${id} message`,
  position: { x, y: 40, width: 20 },
  hitArea: { x, y: 50, radius: 5 },
})

const suspiciousItems = [
  createItem('s1', true, 20),
  createItem('s2', true, 40),
  createItem('s3', true, 60),
]
const normalItem = createItem('normal', false, 80)

test('初始状态为 0/3、60 秒', () => {
  const state = createInitialLevel1State('playing')
  assert.equal(state.remainingSeconds, 60)
  assert.deepEqual(state.foundItemIds, [])
})

test('普通物品不能增加进度且不会重复记录', () => {
  const first = inspectLuggageItem(createInitialLevel1State('playing'), normalItem)
  const second = inspectLuggageItem(first.state, normalItem)
  assert.equal(first.outcome, 'normal')
  assert.equal(second.outcome, 'ignored')
  assert.equal(second.state.foundItemIds.length, 0)
  assert.deepEqual(second.state.inspectedNormalItemIds, ['normal'])
})

test('可疑物品只能计数一次', () => {
  const first = inspectLuggageItem(createInitialLevel1State('playing'), suspiciousItems[0])
  const second = inspectLuggageItem(first.state, suspiciousItems[0])
  assert.equal(first.state.foundItemIds.length, 1)
  assert.equal(second.outcome, 'ignored')
  assert.equal(second.state.foundItemIds.length, 1)
})

test('找到三个可疑物品后进入成功状态', () => {
  let state = createInitialLevel1State('playing')
  for (const item of suspiciousItems) state = inspectLuggageItem(state, item).state
  assert.equal(state.status, 'success')
  assert.equal(state.foundItemIds.length, 3)
})

test('倒计时归零进入失败状态', () => {
  const state = { ...createInitialLevel1State('playing'), remainingSeconds: 1 }
  const nextState = advanceCountdown(state)
  assert.equal(nextState.status, 'failed')
  assert.equal(nextState.remainingSeconds, 0)
})

test('成功后倒计时停止', () => {
  const state = { ...createInitialLevel1State('success'), remainingSeconds: 28 }
  assert.strictEqual(advanceCountdown(state), state)
})

test('失败后不能继续计数', () => {
  const state = createInitialLevel1State('failed')
  const result = inspectLuggageItem(state, suspiciousItems[0])
  assert.equal(result.outcome, 'ignored')
  assert.equal(result.state.foundItemIds.length, 0)
})

test('重建初始状态能够完整重置', () => {
  const state = createInitialLevel1State('playing')
  assert.deepEqual(state.foundItemIds, [])
  assert.deepEqual(state.inspectedNormalItemIds, [])
  assert.equal(state.hintsRemaining, 2)
  assert.equal(state.hintTargetId, null)
  assert.equal(state.remainingSeconds, 60)
})

test('提示只选择尚未找到的可疑物品', () => {
  assert.equal(selectHintTarget(suspiciousItems, ['s1']), 's2')
  assert.equal(selectHintTarget(suspiciousItems, ['s1', 's2', 's3']), null)
})

test('暂停时倒计时不变化', () => {
  const state = { ...createInitialLevel1State('paused'), remainingSeconds: 35 }
  assert.strictEqual(advanceCountdown(state), state)
})

test('放大镜坐标可被约束在允许范围内', () => {
  assert.deepEqual(clampPoint({ x: -12, y: 114 }, { x: 2, y: 3 }, { x: 98, y: 97 }), {
    x: 2,
    y: 97,
  })
})

test('碰撞检测使用圆形热点并返回最近物品', () => {
  assert.equal(findItemAtPoint({ x: 21, y: 51 }, suspiciousItems)?.id, 's1')
  assert.equal(findItemAtPoint({ x: 30, y: 50 }, suspiciousItems), undefined)
})

