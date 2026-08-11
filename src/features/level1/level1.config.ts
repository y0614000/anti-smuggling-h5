import { level1Assets } from './level1.assets'
export {
  HINT_COOLDOWN_MS,
  HINT_VISIBLE_MS,
  INITIAL_GUIDE_MESSAGE,
  ITEM_HIT_DWELL_MS,
  LEVEL1_DURATION_SECONDS,
  LEVEL1_SUSPICIOUS_TOTAL,
} from './level1.constants'
import type { LuggageItem, NormalizedPoint } from './level1.types'

// 百分比坐标以完整 9:16 游戏画布为基准，避免不同设备产生像素偏移。
export const MAGNIFIER_INITIAL_CENTER: NormalizedPoint = { x: 11.5, y: 80.5 }

export const level1Items: readonly LuggageItem[] = [
  {
    id: 'ivory-bracelet',
    name: '雕花手镯',
    image: level1Assets.items.ivoryBracelet,
    suspicious: true,
    clueIndex: 0,
    message: '发现疑似象牙制品，应交由海关进一步查验！',
    position: { x: 13.5, y: 41.8, width: 24, rotation: -3, zIndex: 4 },
    hitArea: { x: 25.2, y: 47.3, radius: 5.4 },
  },
  {
    id: 'animal-pattern-wallet',
    name: '动物纹钱包',
    image: level1Assets.items.animalPatternWallet,
    suspicious: true,
    clueIndex: 1,
    message: '发现来源不明的动物皮制品，需要进一步查验！',
    position: { x: 36.2, y: 42, width: 24.5, rotation: 2, zIndex: 5 },
    hitArea: { x: 48.2, y: 47.7, radius: 5.3 },
  },
  {
    id: 'tropical-fruit',
    name: '热带水果',
    image: level1Assets.items.tropicalFruit,
    suspicious: true,
    clueIndex: 2,
    message: '发现未申报水果，动植物产品入境需要主动申报！',
    position: { x: 57.5, y: 40.7, width: 25.5, rotation: 1, zIndex: 4 },
    hitArea: { x: 69.5, y: 47.1, radius: 5.8 },
  },
  {
    id: 'clothes',
    name: '换洗衣物',
    image: level1Assets.items.clothes,
    suspicious: false,
    message: '这是普通旅行衣物，继续检查吧！',
    position: { x: 12, y: 49.2, width: 30, rotation: -1, zIndex: 3 },
    hitArea: { x: 26.5, y: 56, radius: 6 },
  },
  {
    id: 'travel-diary',
    name: '旅行日记',
    image: level1Assets.items.travelDiary,
    suspicious: false,
    message: '这是一本普通旅行日记，继续检查吧！',
    position: { x: 7.8, y: 59.6, width: 23, rotation: -2, zIndex: 5 },
    hitArea: { x: 19.3, y: 65.7, radius: 4.8 },
  },
  {
    id: 'camera',
    name: '相机',
    image: level1Assets.items.camera,
    suspicious: false,
    message: '这是普通自用相机，继续检查吧！',
    position: { x: 28.5, y: 58.3, width: 28, rotation: 0, zIndex: 6 },
    hitArea: { x: 42, y: 65.4, radius: 5.3 },
  },
  {
    id: 'teddy-bear',
    name: '玩具熊',
    image: level1Assets.items.teddyBear,
    suspicious: false,
    message: '这是普通玩具，继续检查吧！',
    position: { x: 49, y: 55.4, width: 23, rotation: 1, zIndex: 5 },
    hitArea: { x: 60.5, y: 63, radius: 5 },
  },
  {
    id: 'toiletry-pouch',
    name: '洗漱包',
    image: level1Assets.items.toiletryPouch,
    suspicious: false,
    message: '这是普通洗漱用品，继续检查吧！',
    position: { x: 66.5, y: 55.8, width: 20.5, rotation: 1, zIndex: 6 },
    hitArea: { x: 76.5, y: 63.3, radius: 4.5 },
  },
]

export const suspiciousItems = level1Items
  .filter((item) => item.suspicious)
  .sort((first, second) => (first.clueIndex ?? 0) - (second.clueIndex ?? 0))
