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
    retryPoint: '包裹申报为“图书文具”，扫描图像中可见书本、笔记本和文具等。\n请重新核对申报信息与扫描内容。',
    educationPoint: '扫描图像中的书本、笔记本和文具等与“图书文具”申报一致，未发现明显异常。',
  },
  {
    id: 'package-2',
    number: 2,
    declaration: '儿童玩具',
    quantity: '5件',
    xrayResult: '玩具中出现活体龟轮廓',
    judgment: 'abnormal',
    retryPoint: '包裹申报为“儿童玩具”，但扫描图像中出现了一只疑似活体乌龟。\n活体动物属于重点检疫监管对象，请根据申报信息与图像内容重新判断。',
    educationPoint: '包裹申报为“儿童玩具”，但扫描图像中发现疑似活体乌龟，申报信息与实际内容不符。\n活体动物不能伪装成普通玩具寄递，应依法申报并接受相关检查。',
  },
  {
    id: 'package-3',
    number: 3,
    declaration: '陶瓷餐具',
    quantity: '4件',
    xrayResult: '杯碟形状、数量一致',
    judgment: 'normal',
    retryPoint: '图像中的杯、碗、盘等均属于陶瓷餐具。\n暂未发现与申报信息明显不符的内容。',
    educationPoint: '申报品类与扫描图像一致，未发现明显异常。\n图像复杂不代表异常，关键要看扫描内容是否与申报信息相符。',
  },
  {
    id: 'package-4',
    number: 4,
    declaration: '布艺玩偶',
    quantity: '3件',
    xrayResult: '玩偶内部出现高密度金属块',
    judgment: 'abnormal',
    retryPoint: '扫描图像显示，玩偶内部存在申报中未提及的疑似金属物。\n进出境物品应如实申报，请重新比对申报信息与实际内容。',
    educationPoint: '玩偶内部夹藏疑似金属物，与“布艺玩偶”的申报内容不符，应进一步查验。',
  },
  {
    id: 'package-5',
    number: 5,
    declaration: '鞋帽服饰',
    quantity: '6件',
    xrayResult: '衣服、鞋帽数量一致',
    judgment: 'normal',
    retryPoint: '申报为“鞋帽服饰”，扫描图像中的衣物、鞋类和围巾等物品均属于同类日常穿戴用品。请重新比对申报信息与扫描内容。',
    educationPoint: '扫描图像中的衣物、鞋类与申报品类一致，未发现明显异常。',
  },
  {
    id: 'package-6',
    number: 6,
    declaration: '陶瓷摆件',
    quantity: '4件',
    xrayResult: '出现多个瓶状液体容器',
    judgment: 'abnormal',
    retryPoint: '申报为“陶瓷摆件”，但扫描图像中除了摆件，还出现了多件瓶状物。\n请重新核对申报信息与实际内容。',
    educationPoint: '包裹申报为“陶瓷摆件”，但扫描图像中还出现了多件瓶状容器，申报信息与实际内容不一致。\n进出境物品应如实申报。',
  },
] as const
