import type { Level2Package } from './level2.types'

export const LEVEL2_DURATION_SECONDS = 60
export const LEVEL2_ABNORMAL_TOTAL = 3
export const LEVEL2_SCAN_DURATION_MS = 1_300
export const LEVEL2_GUIDE_VISIBLE_DURATION_MS = 3_000
export const LEVEL2_INITIAL_GUIDE_MESSAGE = '左右选择包裹，\n扫描后再判断！'

export const level2Packages: readonly Level2Package[] = [
  {
    id: 'package-1',
    number: 1,
    declaration: '图书文具',
    quantity: '6件',
    xrayResult: '图书、笔盒数量一致',
    judgment: 'normal',
    educationPoint: '申报信息与X光图像一致，可以正常放行。',
  },
  {
    id: 'package-2',
    number: 2,
    declaration: '儿童玩具',
    quantity: '5件',
    xrayResult: '玩具中出现活体龟轮廓',
    judgment: 'abnormal',
    educationPoint: '活体动物不能伪装成玩具寄递，应当异常上报。',
  },
  {
    id: 'package-3',
    number: 3,
    declaration: '陶瓷杯具',
    quantity: '4件',
    xrayResult: '杯碟形状、数量一致',
    judgment: 'normal',
    educationPoint: '图像复杂不等于异常，要认真比对品名和数量。',
  },
  {
    id: 'package-4',
    number: 4,
    declaration: '布艺玩偶',
    quantity: '3件',
    xrayResult: '玩偶内部出现高密度金属块',
    judgment: 'abnormal',
    educationPoint: '玩偶内部夹藏金属物，与申报不符，应当异常上报。',
  },
  {
    id: 'package-5',
    number: 5,
    declaration: '鞋帽服饰',
    quantity: '6件',
    xrayResult: '衣服、鞋帽数量一致',
    judgment: 'normal',
    educationPoint: '正常包裹也要仔细比对，确认申报与图像一致。',
  },
  {
    id: 'package-6',
    number: 6,
    declaration: '陶瓷摆件',
    quantity: '4件',
    xrayResult: '出现多个瓶状液体容器',
    judgment: 'abnormal',
    educationPoint: '实际物品与申报品名不符，应当异常上报。',
  },
] as const
