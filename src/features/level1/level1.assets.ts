import backButton from '../../assets/map/back-button-transparent.png'
import guideBubble from '../../assets/map/dialog-bubble.png'
import backMapButton from '../../assets/level1/level-1-back-map-button.png'
import clueSlots from '../../assets/level1/level-1-clue-slots.png'
import draggableMagnifier from '../../assets/level1/level-1-draggable-magnifier.png'
import exitConfirmButton from '../../assets/level1/level-1-exit-confirm-button.png'
import exitContinueButton from '../../assets/level1/level-1-exit-continue-button.png'
import exitModalBackground from '../../assets/level1/level-1-exit-modal-bg.png'
import educationCardBackground from '../../assets/level1/level-1-education-card-blank-background.png'
import educationCategoryBackground from '../../assets/level1/level-1-education-card-category-label-background.png'
import educationContinueButton from '../../assets/level1/level-1-education-card-continue-button.png'
import educationSloganBackground from '../../assets/level1/level-1-education-card-slogan-banner-background.png'
import educationCorrectActionIcon from '../../assets/level1/level-1-education-icon-correct-action.png'
import educationLawClassIcon from '../../assets/level1/level-1-education-icon-law-class.png'
import educationWhySuspiciousIcon from '../../assets/level1/level-1-education-icon-why-suspicious.png'
import educationWalletIcon from '../../assets/level1/level-1-education-item-animal-pattern-wallet-icon.png'
import educationIvoryBraceletIcon from '../../assets/level1/level-1-education-item-ivory-bracelet-icon.png'
import educationTropicalFruitIcon from '../../assets/level1/level-1-education-item-tropical-fruit-icon.png'
import failurePopupBackground from '../../assets/level1/level-1-failure-popup-with-title.png'
import guideMascot from '../../assets/level1/level-1-guide-mascot.png'
import hintButton from '../../assets/level1/level-1-hint-button.png'
import animalPatternWallet from '../../assets/level1/level-1-item-animal-pattern-wallet.png'
import camera from '../../assets/level1/level-1-item-camera.png'
import clothes from '../../assets/level1/level-1-item-clothes.png'
import ivoryBracelet from '../../assets/level1/level-1-item-ivory-bracelet.png'
import teddyBear from '../../assets/level1/level-1-item-teddy-bear.png'
import toiletryPouch from '../../assets/level1/level-1-item-toiletry-pouch.png'
import travelDiary from '../../assets/level1/level-1-item-travel-diary.png'
import tropicalFruit from '../../assets/level1/level-1-item-tropical-fruit.png'
import background from '../../assets/level1/level-1-luggage-check-background.png'
import emptySuitcase from '../../assets/level1/level-1-open-empty-suitcase.png'
import progressTimer from '../../assets/level1/level-1-progress-timer.png'
import retryButton from '../../assets/level1/level-1-retry-button.png'
import successPopupBackground from '../../assets/level1/level-1-success-popup-with-title.png'
import successPopupButton from '../../assets/level1/level-1-success-popup-button.png'
import titleBanner from '../../assets/level1/level-1-title-banner.png'

export const level1Assets = {
  backButton,
  backMapButton,
  background,
  emptySuitcase,
  progressTimer,
  clueSlots,
  draggableMagnifier,
  exitConfirmButton,
  exitContinueButton,
  exitModalBackground,
  education: {
    cardBackground: educationCardBackground,
    categoryBackground: educationCategoryBackground,
    continueButton: educationContinueButton,
    sloganBackground: educationSloganBackground,
    whySuspiciousIcon: educationWhySuspiciousIcon,
    lawClassIcon: educationLawClassIcon,
    correctActionIcon: educationCorrectActionIcon,
    itemIcons: {
      animalPatternWallet: educationWalletIcon,
      ivoryBracelet: educationIvoryBraceletIcon,
      tropicalFruit: educationTropicalFruitIcon,
    },
  },
  guideBubble,
  guideMascot,
  hintButton,
  successPopupBackground,
  successPopupButton,
  failurePopupBackground,
  retryButton,
  titleBanner,
  items: {
    ivoryBracelet,
    animalPatternWallet,
    tropicalFruit,
    clothes,
    travelDiary,
    camera,
    teddyBear,
    toiletryPouch,
  },
} as const

export const level1CriticalAssetUrls = [
  background,
  emptySuitcase,
  progressTimer,
  clueSlots,
  draggableMagnifier,
  guideBubble,
  guideMascot,
  hintButton,
  titleBanner,
  ivoryBracelet,
  animalPatternWallet,
  tropicalFruit,
  clothes,
  travelDiary,
  camera,
  teddyBear,
  toiletryPouch,
]

export const level1DeferredAssetUrls = [
  successPopupBackground,
  successPopupButton,
  failurePopupBackground,
  retryButton,
  backMapButton,
  educationCardBackground,
  educationCategoryBackground,
  educationContinueButton,
  educationSloganBackground,
  educationWhySuspiciousIcon,
  educationLawClassIcon,
  educationCorrectActionIcon,
  educationWalletIcon,
  educationIvoryBraceletIcon,
  educationTropicalFruitIcon,
  exitModalBackground,
  exitContinueButton,
  exitConfirmButton,
]
