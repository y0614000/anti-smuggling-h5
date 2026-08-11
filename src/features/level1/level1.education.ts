import { level1Assets } from './level1.assets'

export interface Level1EducationSection {
  title: string
  body: string
  icon: string
}

export interface Level1EducationContent {
  itemId: string
  itemName: string
  category: string
  itemIcon: string
  slogan: string
  sections: readonly Level1EducationSection[]
}

const createSections = (why: string, law: string, action: string): readonly Level1EducationSection[] => [
  {
    title: '为什么可疑',
    body: why,
    icon: level1Assets.education.whySuspiciousIcon,
  },
  {
    title: '法律小课堂',
    body: law,
    icon: level1Assets.education.lawClassIcon,
  },
  {
    title: '正确做法',
    body: action,
    icon: level1Assets.education.correctActionIcon,
  },
]

export const level1EducationByItemId: Readonly<Record<string, Level1EducationContent>> = {
  'animal-pattern-wallet': {
    itemId: 'animal-pattern-wallet',
    itemName: '疑似野生动物皮革钱包',
    category: '濒危物种制品',
    itemIcon: level1Assets.education.itemIcons.animalPatternWallet,
    slogan: '不明材质、主动申报',
    sections: createSections(
      '部分箱包可能使用受保护野生动物皮革，仅凭花纹无法确认材质。',
      '进出口受保护的野生动物及其制品，需要相关许可证明并接受海关查验。',
      '确认材质和来源，保存合法证明；无法判断时主动申报。',
    ),
  },
  'ivory-bracelet': {
    itemId: 'ivory-bracelet',
    itemName: '疑似象牙手镯',
    category: '濒危物种制品',
    itemIcon: level1Assets.education.itemIcons.ivoryBracelet,
    slogan: '不购买、不携带、不邮寄',
    sections: createSections(
      '象牙制品来自濒危野生动物，受国际公约保护，严禁非法贸易。',
      '根据《野生动物保护法》等规定，非法携带、邮寄象牙及制品属于违法行为。',
      '发现疑似象牙及制品，请主动向海关申报，配合检查。',
    ),
  },
  'tropical-fruit': {
    itemId: 'tropical-fruit',
    itemName: '未申报热带水果',
    category: '动植物产品',
    itemIcon: level1Assets.education.itemIcons.tropicalFruit,
    slogan: '不携带、先了解、主动申报',
    sections: createSections(
      '新鲜水果可能携带有害生物和病菌，未经检疫入境会威胁生态与农业安全。',
      '根据《进出境动植物检疫法》等规定，新鲜水果通常禁止携带、寄递进境。',
      '入境前了解相关规定，不携带禁止进境水果；已携带时主动申报。',
    ),
  },
}
