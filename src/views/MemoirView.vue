<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import memoirExpertSpeakingImage from '../assets/memoir/anti-smuggling-expert-speaking.png'
import memoirBookIcon from '../assets/memoir/book.svg'
import memoirLevelOneButtonImage from '../assets/memoir/level1_button.png'
import memoirLevelOneSummaryImage from '../assets/memoir/level1St.png'
import memoirLevelTwoSummaryImage from '../assets/memoir/level2St.png'
import backButtonImage from '../assets/map/back-button-transparent.png'
import memoirChapterBrushImage from '../assets/memoir/memoir-chapter-brush.png'
import memoirCornerTapeImage from '../assets/memoir/memoir-corner-tape.png'
import memoirLevelOneImage from '../assets/memoir/memoir-level1-luggage-check.png'
import memoirLevelTwoButtonImage from '../assets/memoir/level2_button.png'
import memoirLevelTwoImage from '../assets/memoir/memoir-level2-package-identification.png'
import memoirLevelThreeButtonImage from '../assets/memoir/level3_button.png'
import memoirLevelThreeImage from '../assets/memoir/memoir-level3-harbor-patrol.png'
import memoirLevelThreeSummaryImage from '../assets/memoir/level3St.png'
import memoirTitleImage from '../assets/memoir/memoir-title-transparent.png'

const emit = defineEmits<{
  back: []
}>()

const showScrollGuide = ref(true)
const memoirView = ref<HTMLElement | null>(null)
const memoirClosing = ref<HTMLElement | null>(null)
const typedClosingText = ref('')
const isExportingMemoir = ref(false)
const exportMemoirError = ref('')
const memoirPreviewUrl = ref('')

const memoirClosingText = [
  '太棒啦！我已经累计完成22次商品查验和15个场景巡查，成功发现11条异常线索！',
  '我能识别濒危物种及其制品、未申报动植物产品、夹藏金属，以及离岛免税、冻海产品、烟草、成品油、高档消费品、电子产品等重点走私风险。',
  '我真正成长为一名合格的反走私小专家啦！',
].join('\n\n')

const memoirClosingHighlights = [
  '22次商品查验',
  '15个场景巡查',
  '11条异常线索',
  '濒危物种及其制品',
  '未申报动植物产品',
  '夹藏金属',
  '离岛免税',
  '冻海产品',
  '烟草',
  '成品油',
  '高档消费品',
  '电子产品',
  '重点走私风险',
  '合格的反走私小专家',
]

const closingHighlightRanges = memoirClosingHighlights
  .map((text) => {
    const start = memoirClosingText.indexOf(text)
    return { start, end: start + text.length }
  })
  .filter(({ start }) => start >= 0)
  .sort((a, b) => a.start - b.start)

const typedClosingSegments = computed(() => {
  const typedLength = typedClosingText.value.length
  const segments: Array<{ text: string; emphasized: boolean }> = []
  let cursor = 0

  closingHighlightRanges.forEach(({ start, end }) => {
    if (start >= typedLength) return

    if (cursor < start) {
      segments.push({
        text: memoirClosingText.slice(cursor, Math.min(start, typedLength)),
        emphasized: false,
      })
    }

    const visibleEnd = Math.min(end, typedLength)
    segments.push({
      text: memoirClosingText.slice(start, visibleEnd),
      emphasized: true,
    })
    cursor = visibleEnd
  })

  if (cursor < typedLength) {
    segments.push({
      text: memoirClosingText.slice(cursor, typedLength),
      emphasized: false,
    })
  }

  return segments
})

let closingObserver: IntersectionObserver | null = null
let typewriterTimer: ReturnType<typeof setTimeout> | null = null
let hasStartedTypewriter = false

const typeClosingText = (index = 0) => {
  if (index >= memoirClosingText.length) return

  typedClosingText.value = memoirClosingText.slice(0, index + 1)
  const currentCharacter = memoirClosingText[index]
  const delay = currentCharacter === '\n'
    ? 260
    : '！。'.includes(currentCharacter ?? '')
      ? 210
      : '，、'.includes(currentCharacter ?? '')
        ? 90
        : 34

  typewriterTimer = setTimeout(() => typeClosingText(index + 1), delay)
}

const startTypewriter = () => {
  if (hasStartedTypewriter) return
  hasStartedTypewriter = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedClosingText.value = memoirClosingText
    return
  }

  typeClosingText()
}

const waitForMemoirImages = async (root: HTMLElement) => {
  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => resolve(), { once: true })
        })
      }

      if ('decode' in image) {
        await image.decode().catch(() => undefined)
      }
    }),
  )
}

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => resolve(String(reader.result)), { once: true })
  reader.addEventListener('error', () => reject(reader.error), { once: true })
  reader.readAsDataURL(blob)
})

const closeMemoirPreview = () => {
  memoirPreviewUrl.value = ''
}

const downloadMemoir = async () => {
  const root = memoirView.value
  const closing = memoirClosing.value
  if (!root || !closing || isExportingMemoir.value) return

  const originalScrollTop = root.scrollTop
  isExportingMemoir.value = true
  exportMemoirError.value = ''

  try {
    if (typewriterTimer) clearTimeout(typewriterTimer)
    hasStartedTypewriter = true
    typedClosingText.value = memoirClosingText

    await nextTick()
    await document.fonts?.ready
    await waitForMemoirImages(root)

    const bubble = closing.querySelector<HTMLElement>('.memoir-closing__bubble')
    const expert = closing.querySelector<HTMLElement>('.memoir-closing__expert')
    const closingContentBottom = Math.max(
      bubble ? bubble.offsetTop + bubble.offsetHeight : 0,
      expert ? expert.offsetTop + expert.offsetHeight : 0,
    )
    const exportHeight = Math.ceil(closing.offsetTop + closingContentBottom + 36)
    const exportWidth = root.clientWidth
    const viewportHeight = root.clientHeight
    const maximumCanvasHeight = 8192
    const maximumCanvasArea = 16_000_000
    const exportScale = Math.max(
      0.75,
      Math.min(
        window.devicePixelRatio || 1,
        2,
        maximumCanvasHeight / exportHeight,
        Math.sqrt(maximumCanvasArea / (exportWidth * exportHeight)),
      ),
    )
    const { default: html2canvas } = await import('html2canvas')
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = Math.ceil(exportWidth * exportScale)
    finalCanvas.height = Math.ceil(exportHeight * exportScale)
    const finalContext = finalCanvas.getContext('2d')
    if (!finalContext) throw new Error('无法创建长图画布')

    finalContext.fillStyle = '#fffdf6'
    finalContext.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    const finalSegmentStart = Math.max(0, exportHeight - viewportHeight)
    const segmentStarts: number[] = []
    for (let start = 0; start < finalSegmentStart; start += viewportHeight) {
      segmentStarts.push(start)
    }
    if (segmentStarts.at(-1) !== finalSegmentStart) {
      segmentStarts.push(finalSegmentStart)
    }

    for (const segmentStart of segmentStarts) {
      root.scrollTop = segmentStart
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      const segmentCanvas = await html2canvas(root, {
        backgroundColor: '#fffdf6',
        height: viewportHeight,
        scale: exportScale,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        width: exportWidth,
        windowHeight: viewportHeight,
        windowWidth: exportWidth,
        onclone: (clonedDocument) => {
          const clonedRoot = clonedDocument.querySelector<HTMLElement>('.memoir-view')
          if (!clonedRoot) return

          clonedRoot.classList.add('is-exporting')
          clonedRoot.scrollTop = segmentStart
          clonedRoot.style.backgroundPosition = `-1px ${-1 - segmentStart}px`
          clonedRoot.querySelectorAll<HTMLElement>('[data-export-hidden]').forEach((element) => {
            element.style.display = 'none'
          })
        },
      })
      const destinationY = Math.round(segmentStart * exportScale)
      const remainingHeight = exportHeight - segmentStart
      const segmentHeight = Math.min(viewportHeight, remainingHeight)
      const renderedSegmentHeight = Math.round(segmentHeight * exportScale)

      finalContext.drawImage(
        segmentCanvas,
        0,
        0,
        finalCanvas.width,
        renderedSegmentHeight,
        0,
        destinationY,
        finalCanvas.width,
        renderedSegmentHeight,
      )
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      finalCanvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('无法生成图片文件'))
      }, 'image/png')
    })
    const userAgent = navigator.userAgent
    const isAndroidWechat = /Android/i.test(userAgent) && /MicroMessenger/i.test(userAgent)
    if (isAndroidWechat) {
      memoirPreviewUrl.value = await blobToDataUrl(blob)
      return
    }

    const downloadUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = '反走私成长回忆录.png'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  } catch (error) {
    console.error('生成回忆录长图失败：', error)
    exportMemoirError.value = '生成失败，请稍后再试'
  } finally {
    root.scrollTop = originalScrollTop
    isExportingMemoir.value = false
  }
}

const handleMemoirScroll = (event: Event) => {
  if ((event.currentTarget as HTMLElement).scrollTop > 6) {
    showScrollGuide.value = false
  }
}

onMounted(() => {
  if (!memoirClosing.value || !('IntersectionObserver' in window)) {
    startTypewriter()
    return
  }

  closingObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      startTypewriter()
      closingObserver?.disconnect()
      closingObserver = null
    },
    {
      root: memoirView.value,
      threshold: 0.25,
    },
  )
  closingObserver.observe(memoirClosing.value)
})

onBeforeUnmount(() => {
  closingObserver?.disconnect()
  if (typewriterTimer) clearTimeout(typewriterTimer)
})
</script>

<template>
  <main
    ref="memoirView"
    class="memoir-view"
    aria-label="反走私小专家回忆录"
    @scroll.passive="handleMemoirScroll"
  >
    <button
      class="memoir-view__back"
      type="button"
      aria-label="返回冒险地图"
      data-export-hidden
      @click="emit('back')"
    >
      <img :src="backButtonImage" alt="" draggable="false" />
    </button>

    <img
      class="memoir-view__title"
      :src="memoirTitleImage"
      alt="反走私成长回忆录，每一次识别与坚守，都是成长的印记。"
      fetchpriority="high"
      decoding="async"
      draggable="false"
    />

    <section class="memoir-level-one" aria-labelledby="memoir-level-one-title">
      <div class="memoir-chapter-title">
        <img :src="memoirChapterBrushImage" alt="" decoding="async" draggable="false" />
        <h2 id="memoir-level-one-title">第一关 · 行李检查</h2>
      </div>

      <figure class="memoir-level-one__photo">
        <img
          class="memoir-level-one__scene"
          :src="memoirLevelOneImage"
          alt="国门小卫士在海关查验现场使用放大镜检查行李"
          decoding="async"
          draggable="false"
        />
        <img
          class="memoir-level-one__tape"
          :src="memoirCornerTapeImage"
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable="false"
        />
      </figure>

      <div class="memoir-level-one__learning-title">
        <img :src="memoirBookIcon" alt="" aria-hidden="true" draggable="false" />
        <h3>学习收获</h3>
      </div>

      <img
        class="memoir-level-one__learning-card"
        :src="memoirLevelOneButtonImage"
        alt="第一关学习收获"
        decoding="async"
        draggable="false"
      />

      <ul class="memoir-level-one__clues" aria-label="第一关发现的线索">
        <li>濒危物种制品</li>
        <li>未申报水果</li>
        <li>来源存疑</li>
        <li>主动申报</li>
      </ul>

      <img
        class="memoir-level-one__summary"
        :src="memoirLevelOneSummaryImage"
        alt="我学会了查"
        decoding="async"
        draggable="false"
      />

      <div class="memoir-level-one__separator" aria-hidden="true"></div>

      <!-- <p class="memoir-level-one__learning-copy">
        学会观察行李物品特征，识别疑似濒危物种制品、未申报动植物产品等风险线索；<br />
        遇到来源或材质不明的物品，主动申报并配合查验。
      </p> -->
    </section>

    <section class="memoir-level-two" aria-labelledby="memoir-level-two-title">
      <div class="memoir-chapter-title">
        <img :src="memoirChapterBrushImage" alt="" decoding="async" draggable="false" />
        <h2 id="memoir-level-two-title">第二关 · 包裹辨别</h2>
      </div>

      <figure class="memoir-level-two__photo">
        <img
          class="memoir-level-two__scene"
          :src="memoirLevelTwoImage"
          alt="国门小卫士在海关查验现场辨别扫描包裹"
          decoding="async"
          draggable="false"
        />
        <img
          class="memoir-level-two__tape"
          :src="memoirCornerTapeImage"
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable="false"
        />
      </figure>

      <div class="memoir-level-two__learning-title">
        <img :src="memoirBookIcon" alt="" aria-hidden="true" draggable="false" />
        <h3>学习收获</h3>
      </div>

      <img
        class="memoir-level-two__learning-card"
        :src="memoirLevelTwoButtonImage"
        alt="第二关学习收获"
        decoding="async"
        draggable="false"
      />

      <ul class="memoir-level-two__clues" aria-label="第二关发现的线索">
        <li>活体伪装</li>
        <li>夹藏金属</li>
        <li>申报不符</li>
        <li>异常上报</li>
      </ul>

      <img
        class="memoir-level-two__summary"
        :src="memoirLevelTwoSummaryImage"
        alt="第二关学习总结"
        decoding="async"
        draggable="false"
      />

      <div class="memoir-level-two__separator" aria-hidden="true"></div>
    </section>

    <section class="memoir-level-three" aria-labelledby="memoir-level-three-title">
      <div class="memoir-chapter-title">
        <img :src="memoirChapterBrushImage" alt="" decoding="async" draggable="false" />
        <h2 id="memoir-level-three-title">第三关 · 港口巡查</h2>
      </div>

      <figure class="memoir-level-three__photo">
        <img
          class="memoir-level-three__scene"
          :src="memoirLevelThreeImage"
          alt="国门小卫士在港口使用望远镜开展巡查"
          decoding="async"
          draggable="false"
        />
        <img
          class="memoir-level-three__tape"
          :src="memoirCornerTapeImage"
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable="false"
        />
      </figure>

      <div class="memoir-level-three__learning-title">
        <img :src="memoirBookIcon" alt="" aria-hidden="true" draggable="false" />
        <h3>学习收获</h3>
      </div>

      <img
        class="memoir-level-three__learning-card"
        :src="memoirLevelThreeButtonImage"
        alt="第三关学习收获"
        decoding="async"
        draggable="false"
      />

      <ul class="memoir-level-three__clues" aria-label="第三关发现的线索">
        <li>涉海走私</li>
        <li>离岛免税</li>
        <li>冻海产品</li>
        <li>成品油</li>
      </ul>

      <img
        class="memoir-level-three__summary"
        :src="memoirLevelThreeSummaryImage"
        alt="第三关学习总结"
        decoding="async"
        draggable="false"
      />
    </section>

    <section ref="memoirClosing" class="memoir-closing" aria-label="反走私小专家成长总结">
      <img
        class="memoir-closing__expert"
        :src="memoirExpertSpeakingImage"
        alt="反走私小专家"
        decoding="async"
        draggable="false"
      />

      <div class="memoir-closing__bubble">
        <p
          class="memoir-closing__typed"
          :class="{ 'is-finished': typedClosingText.length === memoirClosingText.length }"
          aria-hidden="true"
        ><template v-for="(segment, index) in typedClosingSegments" :key="index"><strong
            v-if="segment.emphasized"
          >{{ segment.text }}</strong><span v-else>{{ segment.text }}</span></template></p>
        <p class="memoir-sr-only">{{ memoirClosingText }}</p>
      </div>

      <div class="memoir-closing__actions" data-export-hidden>
        <button
          class="memoir-closing__download"
          type="button"
          :disabled="isExportingMemoir"
          @click="downloadMemoir"
        >
          <span>{{ isExportingMemoir ? '正在生成长图…' : '保存成长回忆录' }}</span>
          <i v-if="!isExportingMemoir" class="memoir-closing__download-arrow" aria-hidden="true"></i>
        </button>
        <p v-if="exportMemoirError" class="memoir-closing__download-error" role="status">
          {{ exportMemoirError }}
        </p>
      </div>
    </section>

    <Transition name="memoir-scroll-guide">
      <div
        v-if="showScrollGuide"
        class="memoir-view__scroll-guide"
        aria-hidden="true"
        data-export-hidden
      >
        <span></span>
        <span></span>
      </div>
    </Transition>

    <Teleport to="body">
      <div
        v-if="memoirPreviewUrl"
        class="memoir-save-preview"
        role="dialog"
        aria-modal="true"
        aria-label="保存成长回忆录长图"
      >
        <header class="memoir-save-preview__header">
          <p>请长按下方长图，选择“保存图片”</p>
          <button type="button" aria-label="关闭长图预览" @click="closeMemoirPreview">关闭</button>
        </header>
        <div class="memoir-save-preview__content">
          <img :src="memoirPreviewUrl" alt="反走私成长回忆录长图" />
        </div>
      </div>
    </Teleport>

  </main>
</template>

<style scoped>
.memoir-view {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fffdf6;
  background-image:
    linear-gradient(rgb(91 174 218 / 14%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(91 174 218 / 14%) 1px, transparent 1px);
  background-position: -1px -1px;
  background-size: 22px 22px;
}

.memoir-view__title {
  position: absolute;
  top: calc(2.8% + env(safe-area-inset-top, 0px));
  left: 50%;
  z-index: 1;
  display: block;
  width: min(82%, 720px);
  height: auto;
  transform: translateX(-50%);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one {
  position: absolute;
  top: calc(19.5% + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 1;
  width: min(48%, 380px);
}

.memoir-chapter-title {
  position: relative;
  width: 87%;
  pointer-events: none;
}

.memoir-chapter-title img {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-chapter-title h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 82%;
  margin: 0;
  color: #073c83;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.9rem, 3.8vw, 1.75rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.04em;
  text-align: center;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  -webkit-text-stroke: clamp(0.2px, 0.08vw, 0.55px) currentcolor;
}

.memoir-level-one__photo {
  position: relative;
  width: 80%;
  margin: 1% 0 0 2%;
}

.memoir-level-one__scene {
  display: block;
  width: 100%;
  height: auto;
  border-radius: clamp(9px, 2.2vw, 18px);
  box-shadow: 0 clamp(2px, 0.8vw, 6px) clamp(6px, 1.8vw, 14px) rgb(39 64 86 / 22%);
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one__tape {
  position: absolute;
  top: -15%;
  left: -13%;
  z-index: 1;
  display: block;
  width: 31%;
  height: auto;
  filter: drop-shadow(0 1px 1px rgb(118 85 29 / 18%));
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one__learning-title {
  position: absolute;
  top: 20%;
  left: 89%;
  display: flex;
  width: max-content;
  align-items: center;
  gap: clamp(3px, 0.8vw, 7px);
  color: #1354c1;
}

.memoir-level-one__learning-title img {
  display: block;
  width: clamp(25px, 4vw, 30px);
  height: auto;
  flex: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one__learning-title h3 {
  margin: 0;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.85rem, 3.6vw, 1.55rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  -webkit-text-stroke: clamp(0.15px, 0.06vw, 0.4px) currentcolor;
}

.memoir-level-one__learning-card {
  position: absolute;
  top: 39%;
  left: 85%;
  display: block;
  width: 106%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one__learning-copy {
  position: absolute;
  top: 39%;
  left: 96%;
  width: 100%;
  margin: 0;
  color: #27384b;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.75rem, 3.2vw, 1.15rem);
  font-weight: 600;
  line-height: 1.7;
  letter-spacing: 0.035em;
  text-align: justify;
}

.memoir-level-one__clues {
  position: absolute;
  top: 108%;
  left: 10%;
  display: grid;
  width: 92%;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(7px, 1.8vw, 13px) clamp(8px, 2vw, 14px);
  list-style: none;
}

.memoir-level-one__clues li {
  position: relative;
  display: flex;
  min-height: clamp(25px, 6.5vw, 42px);
  align-items: center;
  justify-content: center;
  padding: 0 clamp(5px, 1.5vw, 10px);
  border: clamp(1px, 0.35vw, 2px) solid #4f94d2;
  border-radius: 48% 52% 46% 54% / 58% 45% 55% 42%;
  background: rgb(218 239 255 / 72%);
  color: #174e8d;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.62rem, 2.5vw, 0.92rem);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  transform: rotate(-1.2deg);
}

.memoir-level-one__clues li::after {
  position: absolute;
  inset: 2px -2px -2px 2px;
  border: 1px solid currentcolor;
  border-radius: 52% 48% 55% 45% / 45% 57% 43% 55%;
  content: "";
  opacity: 0.28;
  pointer-events: none;
}

.memoir-level-one__clues li:nth-child(2) {
  border-color: #79af43;
  background: rgb(226 244 201 / 72%);
  color: #426d20;
  transform: rotate(0.8deg);
}

.memoir-level-one__clues li:nth-child(3) {
  border-color: #dea33a;
  background: rgb(255 237 183 / 72%);
  color: #8a5c12;
  transform: rotate(1.1deg);
}

.memoir-level-one__clues li:nth-child(4) {
  border-color: #b27ac9;
  background: rgb(239 218 250 / 72%);
  color: #6f3d85;
  transform: rotate(-0.7deg);
}

.memoir-level-one__summary {
  position: absolute;
  top: 108%;
  left: 112%;
  z-index: 1;
  display: block;
  width: 80%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-one__separator {
  position: absolute;
  top: 157%;
  left: 0;
  width: 193%;
  border-top: clamp(1px, 0.35vw, 2px) dashed rgb(74 151 204 / 55%);
}

.memoir-level-two {
  position: absolute;
  top: calc(24.5% + min(62vw, 490px) + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 1;
  width: min(48%, 380px);
}

.memoir-level-two .memoir-chapter-title {
  margin-left: 110%;
}

.memoir-level-two__photo {
  position: relative;
  width: 80%;
  margin: 1% 0 0 112%;
}

.memoir-level-two__scene {
  display: block;
  width: 100%;
  height: auto;
  border-radius: clamp(9px, 2.2vw, 18px);
  box-shadow: 0 clamp(2px, 0.8vw, 6px) clamp(6px, 1.8vw, 14px) rgb(39 64 86 / 22%);
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-two__tape {
  position: absolute;
  top: -15%;
  right: -13%;
  z-index: 1;
  display: block;
  width: 31%;
  height: auto;
  filter: drop-shadow(0 1px 1px rgb(118 85 29 / 18%));
  transform: scaleX(-1);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-two__learning-title {
  position: absolute;
  top: 20%;
  left: 2%;
  display: flex;
  width: max-content;
  align-items: center;
  gap: clamp(3px, 0.8vw, 7px);
  color: #1354c1;
}

.memoir-level-two__learning-title img {
  display: block;
  width: clamp(25px, 4vw, 30px);
  height: auto;
  flex: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-two__learning-title h3 {
  margin: 0;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.85rem, 3.6vw, 1.55rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  -webkit-text-stroke: clamp(0.15px, 0.06vw, 0.4px) currentcolor;
}

.memoir-level-two__learning-card {
  position: absolute;
  top: 39%;
  left: -7%;
  display: block;
  width: 114%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-two__clues {
  position: absolute;
  top: 108%;
  left: 95%;
  display: grid;
  width: 92%;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(7px, 1.8vw, 13px) clamp(8px, 2vw, 14px);
  list-style: none;
}

.memoir-level-two__clues li {
  position: relative;
  display: flex;
  min-height: clamp(25px, 6.5vw, 42px);
  align-items: center;
  justify-content: center;
  padding: 0 clamp(5px, 1.5vw, 10px);
  border: clamp(1px, 0.35vw, 2px) solid #4f94d2;
  border-radius: 48% 52% 46% 54% / 58% 45% 55% 42%;
  background: rgb(218 239 255 / 72%);
  color: #174e8d;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.62rem, 2.5vw, 0.92rem);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  transform: rotate(-1.2deg);
}

.memoir-level-two__clues li::after {
  position: absolute;
  inset: 2px -2px -2px 2px;
  border: 1px solid currentcolor;
  border-radius: 52% 48% 55% 45% / 45% 57% 43% 55%;
  content: "";
  opacity: 0.28;
  pointer-events: none;
}

.memoir-level-two__clues li:nth-child(2) {
  border-color: #79af43;
  background: rgb(226 244 201 / 72%);
  color: #426d20;
  transform: rotate(0.8deg);
}

.memoir-level-two__clues li:nth-child(3) {
  border-color: #dea33a;
  background: rgb(255 237 183 / 72%);
  color: #8a5c12;
  transform: rotate(1.1deg);
}

.memoir-level-two__clues li:nth-child(4) {
  border-color: #b27ac9;
  background: rgb(239 218 250 / 72%);
  color: #6f3d85;
  transform: rotate(-0.7deg);
}

.memoir-level-two__summary {
  position: absolute;
  top: 108%;
  left: 5%;
  z-index: 1;
  display: block;
  width: 80%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-two__separator {
  position: absolute;
  top: 157%;
  left: 0;
  width: 193%;
  border-top: clamp(1px, 0.35vw, 2px) dashed rgb(74 151 204 / 55%);
}

.memoir-level-three {
  position: absolute;
  top: calc(28.5% + min(124vw, 980px) + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 1;
  width: min(48%, 380px);
}

.memoir-level-three__photo {
  position: relative;
  width: 80%;
  margin: 1% 0 0 2%;
}

.memoir-level-three__scene {
  display: block;
  width: 100%;
  height: auto;
  border-radius: clamp(9px, 2.2vw, 18px);
  box-shadow: 0 clamp(2px, 0.8vw, 6px) clamp(6px, 1.8vw, 14px) rgb(39 64 86 / 22%);
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-three__tape {
  position: absolute;
  top: -15%;
  left: -13%;
  z-index: 1;
  display: block;
  width: 31%;
  height: auto;
  filter: drop-shadow(0 1px 1px rgb(118 85 29 / 18%));
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-three__learning-title {
  position: absolute;
  top: 20%;
  left: 89%;
  display: flex;
  width: max-content;
  align-items: center;
  gap: clamp(3px, 0.8vw, 7px);
  color: #1354c1;
}

.memoir-level-three__learning-title img {
  display: block;
  width: clamp(25px, 4vw, 30px);
  height: auto;
  flex: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-three__learning-title h3 {
  margin: 0;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.85rem, 3.6vw, 1.55rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  -webkit-text-stroke: clamp(0.15px, 0.06vw, 0.4px) currentcolor;
}

.memoir-level-three__learning-card {
  position: absolute;
  top: 39%;
  left: 85%;
  display: block;
  width: 106%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-level-three__clues {
  position: absolute;
  top: 108%;
  left: 10%;
  display: grid;
  width: 92%;
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(7px, 1.8vw, 13px) clamp(8px, 2vw, 14px);
  list-style: none;
}

.memoir-level-three__clues li {
  position: relative;
  display: flex;
  min-height: clamp(25px, 6.5vw, 42px);
  align-items: center;
  justify-content: center;
  padding: 0 clamp(5px, 1.5vw, 10px);
  border: clamp(1px, 0.35vw, 2px) solid #4f94d2;
  border-radius: 48% 52% 46% 54% / 58% 45% 55% 42%;
  background: rgb(218 239 255 / 72%);
  color: #174e8d;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.62rem, 2.5vw, 0.92rem);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  transform: rotate(-1.2deg);
}

.memoir-level-three__clues li::after {
  position: absolute;
  inset: 2px -2px -2px 2px;
  border: 1px solid currentcolor;
  border-radius: 52% 48% 55% 45% / 45% 57% 43% 55%;
  content: "";
  opacity: 0.28;
  pointer-events: none;
}

.memoir-level-three__clues li:nth-child(2) {
  border-color: #79af43;
  background: rgb(226 244 201 / 72%);
  color: #426d20;
  transform: rotate(0.8deg);
}

.memoir-level-three__clues li:nth-child(3) {
  border-color: #dea33a;
  background: rgb(255 237 183 / 72%);
  color: #8a5c12;
  transform: rotate(1.1deg);
}

.memoir-level-three__clues li:nth-child(4) {
  border-color: #b27ac9;
  background: rgb(239 218 250 / 72%);
  color: #6f3d85;
  transform: rotate(-0.7deg);
}

.memoir-level-three__summary {
  position: absolute;
  top: 108%;
  left: 112%;
  z-index: 1;
  display: block;
  width: 80%;
  height: auto;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-closing {
  position: absolute;
  top: calc(28.5% + min(194vw, 1535px) + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  display: grid;
  width: min(93%, 760px);
  min-height: min(58vw, 440px);
  padding-bottom: calc(7vh + env(safe-area-inset-bottom, 0px));
  grid-template-columns: 36% minmax(0, 1fr);
  align-items: end;
  column-gap: 1.5%;
}

.memoir-closing__expert {
  position: relative;
  z-index: 2;
  display: block;
  width: 112%;
  height: auto;
  margin-left: -10%;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.memoir-closing__bubble {
  position: relative;
  align-self: center;
  min-height: clamp(205px, 52vw, 340px);
  padding: clamp(14px, 3.8vw, 28px) clamp(15px, 4vw, 30px);
  border: clamp(1.5px, 0.45vw, 3px) solid #84c6e7;
  border-radius: 8% 5% 7% 4% / 7% 9% 5% 8%;
  background: rgb(255 253 244 / 93%);
  box-shadow:
    3px 3px 0 rgb(110 184 222 / 18%),
    inset 0 0 0 2px rgb(255 255 255 / 72%);
  color: #174a78;
}

.memoir-closing__typed {
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.7rem, 2.85vw, 1.12rem);
  font-weight: 600;
  line-height: 1.72;
  letter-spacing: 0.025em;
  text-align: left;
  white-space: pre-line;
}

.memoir-closing__typed strong {
  color: #0d3e6d;
  font-weight: 900;
  -webkit-text-stroke: clamp(0.12px, 0.04vw, 0.35px) currentcolor;
}

.memoir-closing__typed::after {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 2px;
  background: #4aa4d2;
  content: "";
  vertical-align: -0.15em;
  animation: memoir-typewriter-cursor 720ms step-end infinite;
}

.memoir-closing__typed.is-finished::after {
  display: none;
}

.memoir-view.is-exporting .memoir-closing__typed::after {
  display: none;
}

.memoir-closing__actions {
  display: flex;
  width: 100%;
  margin-top: clamp(18px, 5vw, 36px);
  padding-bottom: clamp(10px, 3vw, 24px);
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.memoir-closing__download {
  display: inline-flex;
  min-width: min(68%, 330px);
  padding: clamp(10px, 2.8vw, 16px) clamp(22px, 6vw, 42px);
  border: clamp(2px, 0.55vw, 4px) solid #e78b18;
  border-radius: 48% 52% 47% 53% / 52% 45% 55% 48%;
  background: #ffb52f;
  box-shadow:
    inset 0 2px 0 rgb(255 255 255 / 55%),
    2px 3px 0 rgb(174 91 7 / 22%);
  color: #fff;
  font-family: "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: clamp(0.88rem, 3.7vw, 1.35rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 1px rgb(128 57 0 / 34%);
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2.4vw, 14px);
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.memoir-closing__download:active:not(:disabled) {
  box-shadow: inset 0 2px 3px rgb(140 67 0 / 22%);
  transform: translateY(2px) scale(0.98);
}

.memoir-closing__download:disabled {
  cursor: wait;
  opacity: 0.68;
}

.memoir-closing__download:focus-visible {
  outline: 3px solid #60bde9;
  outline-offset: 3px;
}

.memoir-closing__download-arrow {
  position: relative;
  display: block;
  width: clamp(14px, 3.8vw, 20px);
  height: clamp(18px, 4.8vw, 25px);
  flex: none;
  animation: memoir-download-arrow 1.1s ease-in-out infinite;
}

.memoir-closing__download-arrow::before {
  position: absolute;
  top: 1px;
  left: 50%;
  width: clamp(2px, 0.65vw, 4px);
  height: 68%;
  border-radius: 999px;
  background: #fff;
  content: "";
  transform: translateX(-50%);
}

.memoir-closing__download-arrow::after {
  position: absolute;
  bottom: 1px;
  left: 50%;
  width: 48%;
  aspect-ratio: 1;
  border-right: clamp(2px, 0.65vw, 4px) solid #fff;
  border-bottom: clamp(2px, 0.65vw, 4px) solid #fff;
  content: "";
  transform: translateX(-50%) rotate(45deg);
}

.memoir-closing__download-error {
  margin: 0;
  color: #b54a28;
  font-size: clamp(0.7rem, 2.6vw, 0.95rem);
  font-weight: 700;
}

.memoir-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.memoir-view__back {
  position: fixed;
  top: calc(1.8% + env(safe-area-inset-top, 0px));
  left: max(3.5%, env(safe-area-inset-left, 0px));
  z-index: 20;
  width: 10.5%;
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  background: #f89b12;
  box-shadow: 0 2px 4px rgb(76 34 0 / 24%);
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.memoir-view__back img {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.memoir-view__back:active {
  transform: scale(0.94);
}

.memoir-view__back:focus-visible {
  outline: clamp(2px, 0.6vw, 4px) solid #fff;
  outline-offset: 2px;
}

.memoir-view__scroll-guide {
  position: fixed;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  z-index: 10;
  width: clamp(28px, 8vw, 42px);
  height: clamp(42px, 11vw, 58px);
  pointer-events: none;
  transform: translateX(-50%);
}

.memoir-view__scroll-guide span {
  position: absolute;
  left: 50%;
  width: clamp(16px, 4.8vw, 25px);
  height: clamp(16px, 4.8vw, 25px);
  border-right: clamp(2px, 0.7vw, 4px) solid #82cdec;
  border-bottom: clamp(2px, 0.7vw, 4px) solid #82cdec;
  filter: drop-shadow(0 1px 1px rgb(255 255 255 / 85%));
  animation: memoir-scroll-arrow-breathe 1.45s ease-in-out infinite;
}

.memoir-view__scroll-guide span:first-child {
  top: 0;
}

.memoir-view__scroll-guide span:last-child {
  top: 35%;
  animation-delay: 0.18s;
}

.memoir-save-preview {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: rgb(18 31 44 / 96%);
}

.memoir-save-preview__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  min-height: 56px;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgb(18 31 44 / 94%);
  color: #fff;
}

.memoir-save-preview__header p {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.memoir-save-preview__header button {
  flex: none;
  padding: 7px 14px;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  appearance: none;
}

.memoir-save-preview__content {
  flex: 1;
  padding: 12px 12px calc(22px + env(safe-area-inset-bottom, 0px));
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.memoir-save-preview__content img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  background: #fffdf6;
  user-select: none;
  -webkit-touch-callout: default;
}

.memoir-scroll-guide-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.memoir-scroll-guide-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@keyframes memoir-scroll-arrow-breathe {
  0%,
  100% {
    opacity: 0.28;
    transform: translate(-50%, -3px) rotate(45deg) scale(0.9);
  }

  50% {
    opacity: 0.95;
    transform: translate(-50%, 5px) rotate(45deg) scale(1.05);
  }
}

@keyframes memoir-typewriter-cursor {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}

@keyframes memoir-download-arrow {
  0%,
  100% {
    opacity: 0.72;
    transform: translateY(-2px);
  }

  50% {
    opacity: 1;
    transform: translateY(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .memoir-view__scroll-guide span {
    animation: none;
    opacity: 0.8;
    transform: translateX(-50%) rotate(45deg);
  }

  .memoir-closing__download-arrow {
    animation: none;
  }
}
</style>
