import backButton from '../../assets/map/back-button-transparent.png'
import guideBubble from '../../assets/map/dialog-bubble.png'
import failurePopup from '../../assets/level1/level-1-failure-popup-with-title.png'
import exitConfirmButton from '../../assets/level1/level-1-exit-confirm-button.png'
import exitContinueButton from '../../assets/level1/level-1-exit-continue-button.png'
import exitModalBackground from '../../assets/level1/level-1-exit-modal-bg.png'
import mapButton from '../../assets/level1/level-1-back-map-button.png'
import resultButton from '../../assets/level1/level-1-success-popup-button.png'
import retryButton from '../../assets/level1/level-1-retry-button.png'
import successPopup from '../../assets/level1/level-1-success-popup-with-title.png'
import guideMascot from '../../assets/level1/level-1-guide-mascot.png'
import hintButton from '../../assets/level1/level-1-hint-button.png'
import whistle from '../../assets/images/prop-whistle.png'
import dutyFreePersonalPickup from '../../assets/level3/behaviors/behavior-01-duty-free-personal-pickup-normal.png'
import dutyFreeOrganizedCollection from '../../assets/level3/behaviors/behavior-02-duty-free-organized-collection-smuggling.png'
import luxuryElectronicsMisdeclaration from '../../assets/level3/behaviors/behavior-03-luxury-electronics-misdeclaration-smuggling.png'
import tobaccoConcealment from '../../assets/level3/behaviors/behavior-04-tobacco-concealment-smuggling.png'
import frozenSeafoodCompliantInspection from '../../assets/level3/behaviors/behavior-05-frozen-seafood-compliant-inspection-normal.png'
import frozenSeafoodIrregularTransfer from '../../assets/level3/behaviors/behavior-06-frozen-seafood-irregular-transfer-smuggling.png'
import fuelCompliantLoading from '../../assets/level3/behaviors/behavior-07-fuel-compliant-loading-normal.png'
import fuelIrregularTransfer from '../../assets/level3/behaviors/behavior-08-fuel-irregular-transfer-smuggling.png'
import panoramaBackground from '../../assets/level3/level-3-port-panorama-background-v5.webp'
import statusBar from '../../assets/level3/level-3-status-bar-v3.png'
import title from '../../assets/level3/level-3-title-banner.png'

export const level3Assets = {
  backButton,
  behaviors: {
    dutyFreePersonalPickup,
    dutyFreeOrganizedCollection,
    luxuryElectronicsMisdeclaration,
    tobaccoConcealment,
    frozenSeafoodCompliantInspection,
    frozenSeafoodIrregularTransfer,
    fuelCompliantLoading,
    fuelIrregularTransfer,
  },
  exitConfirmButton,
  exitContinueButton,
  exitModalBackground,
  failurePopup,
  guideBubble,
  guideMascot,
  hintButton,
  mapButton,
  panoramaBackground,
  resultButton,
  retryButton,
  statusBar,
  successPopup,
  title,
  whistle,
} as const

export const level3BehaviorAssetUrls = Object.values(level3Assets.behaviors)

export const level3CriticalAssetUrls = [
  panoramaBackground,
  backButton,
  title,
  statusBar,
  guideBubble,
  guideMascot,
  hintButton,
  exitModalBackground,
  exitContinueButton,
  exitConfirmButton,
  ...level3BehaviorAssetUrls,
]
