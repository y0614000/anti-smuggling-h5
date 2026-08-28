import backButton from '../../assets/map/back-button-transparent.png'
import packageSwitchSound from '../../assets/audio/sfx/level-2-package-switch.mp3'
import guideBubble from '../../assets/map/dialog-bubble.png'
import guideMascot from '../../assets/level1/level-1-guide-mascot.png'
import backMapButton from '../../assets/level1/level-1-back-map-button.png'
import exitConfirmButton from '../../assets/level1/level-1-exit-confirm-button.png'
import exitContinueButton from '../../assets/level1/level-1-exit-continue-button.png'
import exitModalBackground from '../../assets/level1/level-1-exit-modal-bg.png'
import failurePopupBackground from '../../assets/level1/level-1-failure-popup-with-title.png'
import retryButton from '../../assets/level1/level-1-retry-button.png'
import successPopupBackground from '../../assets/level1/level-1-success-popup-with-title.png'
import successPopupButton from '../../assets/level1/level-1-success-popup-button.png'
import abnormalReportButton from '../../assets/level2/level-2-abnormal-report-button.png'
import declarationCard from '../../assets/level2/level-2-declaration-card-background.png'
import normalReleaseButton from '../../assets/level2/level-2-normal-release-button.png'
import background from '../../assets/level2/level-2-package-inspection-background.png'
import title from '../../assets/level2/level-2-package-inspection-title.png'
import scanned1 from '../../assets/level2/level-2-package-scanned-1.png'
import scanned2 from '../../assets/level2/level-2-package-scanned-2.png'
import scanned3 from '../../assets/level2/level-2-package-scanned-3.png'
import scanned4 from '../../assets/level2/level-2-package-scanned-4.png'
import scanned5 from '../../assets/level2/level-2-package-scanned-5.png'
import scanned6 from '../../assets/level2/level-2-package-scanned-6.png'
import arrowLeft from '../../assets/level2/level-2-package-scanner-arrow-left.png'
import arrowRight from '../../assets/level2/level-2-package-scanner-arrow-right.png'
import scannerMachine from '../../assets/level2/level-2-package-scanner-machine.png'
import unscanned1 from '../../assets/level2/level-2-package-unscanned-1.png'
import unscanned2 from '../../assets/level2/level-2-package-unscanned-2.png'
import unscanned3 from '../../assets/level2/level-2-package-unscanned-3.png'
import unscanned4 from '../../assets/level2/level-2-package-unscanned-4.png'
import unscanned5 from '../../assets/level2/level-2-package-unscanned-5.png'
import unscanned6 from '../../assets/level2/level-2-package-unscanned-6.png'
import scanButton from '../../assets/level2/level-2-scan-action-button-background.png'
import scannerLightBeam from '../../assets/level2/level-2-scanner-light-beam.png'
import statusBar from '../../assets/level2/level-2-status-bar-static.png'
import lecturerMascot from '../../assets/level2/guomen-little-guard-lecturer.png'
import lecturerChalkboard from '../../assets/level2/lecturer-chalkboard-transparent.png'

const packageImages = [
  { unscanned: unscanned1, scanned: scanned1 },
  { unscanned: unscanned2, scanned: scanned2 },
  { unscanned: unscanned3, scanned: scanned3 },
  { unscanned: unscanned4, scanned: scanned4 },
  { unscanned: unscanned5, scanned: scanned5 },
  { unscanned: unscanned6, scanned: scanned6 },
] as const

export const level2Assets = {
  abnormalReportButton,
  arrowLeft,
  arrowRight,
  backButton,
  backMapButton,
  background,
  declarationCard,
  exitConfirmButton,
  exitContinueButton,
  exitModalBackground,
  failurePopupBackground,
  guideBubble,
  guideMascot,
  lecturerChalkboard,
  lecturerMascot,
  normalReleaseButton,
  packageImages,
  packageSwitchSound,
  retryButton,
  scanButton,
  scannerLightBeam,
  scannerMachine,
  statusBar,
  successPopupBackground,
  successPopupButton,
  title,
} as const

export const level2CriticalAssetUrls = [
  background,
  title,
  statusBar,
  declarationCard,
  scannerMachine,
  arrowLeft,
  arrowRight,
  scanButton,
  normalReleaseButton,
  abnormalReportButton,
  guideBubble,
  guideMascot,
  lecturerChalkboard,
  lecturerMascot,
  ...packageImages.map((images) => images.unscanned),
]

export const level2DeferredAssetUrls = [
  ...packageImages.map((images) => images.scanned),
  scannerLightBeam,
  successPopupBackground,
  successPopupButton,
  failurePopupBackground,
  retryButton,
  backMapButton,
  exitModalBackground,
  exitContinueButton,
  exitConfirmButton,
]
