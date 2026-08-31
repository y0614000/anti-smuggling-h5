<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import bannerImage from '../assets/images/banner.png'
import parcelImage from '../assets/images/box1.png'
import suitcaseImage from '../assets/images/box2.png'
import catalogBackgroundImage from '../assets/images/daoju-tujian-bg-transparent.png'
import characterAnimation from '../assets/images/ip-opening.webp'
import characterAudio from '../assets/images/ip-opening.m4a'
import characterStaticImage from '../assets/images/ip-opening-static.webp'
import rememberedButtonImage from '../assets/images/i-remembered-button.png'
import itemCardBackgroundImage from '../assets/images/item-card-bg.png'
import levelIntroHarborImage from '../assets/images/level-intro-harbor.png'
import levelIntroModalBackgroundImage from '../assets/images/level-intro-modal-bg-transparent.png'
import levelIntroParcelImage from '../assets/images/level-intro-parcel.png'
import levelIntroSuitcaseImage from '../assets/images/level-intro-suitcase.png'
import levelImage from '../assets/images/nav-level-intro.png'
import propImage from '../assets/images/nav-item-catalog.png'
import ruleImage from '../assets/images/nav-activity-rules.png'
import tipsImage from '../assets/images/nav-smuggling-tips.png'
import obtainedIcon from '../assets/images/obtained-icon-final.png'
import goObtainIcon from '../assets/images/go-obtain-icon-blue-final.png'
import okImage from '../assets/images/ok.png'
import progressCardBackgroundImage from '../assets/images/progress-card-bg.png'
import knowledgeBadgeImage from '../assets/images/prop-knowledge-badge.png'
import magnifierImage from '../assets/images/prop-magnifier.png'
import whistleImage from '../assets/images/prop-whistle.png'
import ruleBackgroundImage from '../assets/images/ruleBg.png'
import startImage from '../assets/images/start.png'
import summonImage from '../assets/images/summon.png'
import tipsMnemonicCardImage from '../assets/images/anti-smuggling-mnemonic-card-v2.png'
import tipsModalBackgroundImage from '../assets/images/anti-smuggling-tips-modal-bg.png'
import tipsRefuseCardImage from '../assets/images/anti-smuggling-card-refuse.png'
import tipsReportCardImage from '../assets/images/anti-smuggling-card-report-v2.png'

const props = withDefaults(
  defineProps<{
    completedLevelCount?: number
    isSummoned?: boolean
  }>(),
  {
    completedLevelCount: 0,
    isSummoned: false,
  },
)

const emit = defineEmits<{
  'audio-unlock': []
  'acquire-level-item': [level: number]
  start: []
}>()

const isRuleOpen = ref(false)
const isCatalogOpen = ref(false)
const isLevelIntroOpen = ref(false)
const isTipsOpen = ref(false)
const isSummonPromptVisible = ref(!props.isSummoned)
const isCharacterVisible = ref(props.isSummoned)
const isCharacterAnimating = ref(false)
const characterAnimationKey = ref(0)
const characterAudioRef = ref<HTMLAudioElement | null>(null)
const ruleDialog = ref<HTMLElement | null>(null)
const ruleTrigger = ref<HTMLButtonElement | null>(null)
const catalogDialog = ref<HTMLElement | null>(null)
const catalogTrigger = ref<HTMLButtonElement | null>(null)
const levelIntroDialog = ref<HTMLElement | null>(null)
const levelTrigger = ref<HTMLButtonElement | null>(null)
const tipsDialog = ref<HTMLElement | null>(null)
const tipsTrigger = ref<HTMLButtonElement | null>(null)

const CHARACTER_ANIMATION_DURATION_MS = 4000
let characterAnimationTimer: ReturnType<typeof setTimeout> | undefined
let preloadIdleId: number | undefined
let preloadFallbackTimer: ReturnType<typeof setTimeout> | undefined

const preloadAsset = (href: string, as: 'audio' | 'image', type: string) => {
  const isAlreadyPreloaded = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')).some(
    (link) => link.href === new URL(href, window.location.href).href,
  )

  if (isAlreadyPreloaded) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.type = type
  link.href = href
  document.head.appendChild(link)
}

const preloadCharacterAssets = () => {
  preloadAsset(characterAnimation, 'image', 'image/webp')
  preloadAsset(characterStaticImage, 'image', 'image/webp')
  preloadAsset(characterAudio, 'audio', 'audio/mp4')
}

onMounted(() => {
  if ('requestIdleCallback' in window) {
    preloadIdleId = window.requestIdleCallback(preloadCharacterAssets, { timeout: 2_000 })
    return
  }

  preloadFallbackTimer = setTimeout(preloadCharacterAssets, 1_000)
})

onBeforeUnmount(() => {
  window.clearTimeout(characterAnimationTimer)
  window.clearTimeout(preloadFallbackTimer)

  if (preloadIdleId !== undefined && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(preloadIdleId)
  }
})

const levelIntroItems = [
  {
    id: 'suitcase',
    step: '第一关',
    name: '行李检查',
    description: ['仔细观察旅客行李', '找出隐藏的可疑物品'],
    image: levelIntroSuitcaseImage,
  },
  {
    id: 'parcel',
    step: '第二关',
    name: '包裹辨别',
    description: ['扫描查验6个包裹', '找出并上报3个异常包裹'],
    image: levelIntroParcelImage,
  },
  {
    id: 'harbor',
    step: '第三关',
    name: '港口巡查',
    description: ['滑动巡查8个场景', '找出并报告5起可疑行为'],
    image: levelIntroHarborImage,
  },
] as const

const catalogItemDefinitions = [
  {
    level: 1,
    id: 'magnifier',
    name: '侦查放大镜',
    sourcePrefix: '通过第一关「',
    sourceHighlight: '行李检查',
    sourceSuffix: '」获得',
    description: '检查行李并发现可疑物品',
    image: magnifierImage,
  },
  {
    level: 2,
    id: 'badge',
    name: '知识徽章',
    sourcePrefix: '通过第二关「',
    sourceHighlight: '包裹辨别',
    sourceSuffix: '」获得',
    description: '辨别并上报异常包裹',
    image: knowledgeBadgeImage,
  },
  {
    level: 3,
    id: 'whistle',
    name: '巡查小哨子',
    sourcePrefix: '通过第三关「',
    sourceHighlight: '港口巡查',
    sourceSuffix: '」获得',
    description: '巡查并报告可疑行为',
    image: whistleImage,
  },
] as const

const catalogItems = computed(() =>
  catalogItemDefinitions.map((item, index) => ({
    ...item,
    obtained: props.completedLevelCount >= index + 1,
  })),
)
const collectedCount = computed(() => Math.min(3, Math.max(0, props.completedLevelCount)))

const acquireCatalogItem = (level: number, obtained: boolean) => {
  if (obtained) return

  emit('audio-unlock')
  isCatalogOpen.value = false
  emit('acquire-level-item', level)
}

const summonCharacter = () => {
  emit('audio-unlock')
  isSummonPromptVisible.value = false
  isCharacterVisible.value = true
  isCharacterAnimating.value = true
  characterAnimationKey.value += 1

  const audio = characterAudioRef.value
  if (!audio) return

  try {
    audio.currentTime = 0
  } catch {
    // iOS 在音频元数据尚未就绪时可能拒绝设置 currentTime。
  }

  // play() 必须留在这次点击的同步调用栈中，不能放到 nextTick/setTimeout 里。
  void audio.play().catch(() => {
    // 个别静音模式或 WebView 会拦截音频，不影响 IP 动画展示。
  })
}

const handleCharacterAnimationLoad = () => {
  window.clearTimeout(characterAnimationTimer)
  characterAnimationTimer = window.setTimeout(() => {
    isCharacterAnimating.value = false
  }, CHARACTER_ANIMATION_DURATION_MS)
}

const handleCharacterAnimationError = () => {
  window.clearTimeout(characterAnimationTimer)
  isCharacterAnimating.value = false
}

const openRule = async () => {
  isRuleOpen.value = true
  await nextTick()
  ruleDialog.value?.focus()
}

const closeRule = async () => {
  isRuleOpen.value = false
  await nextTick()
  ruleTrigger.value?.focus()
}

const openCatalog = async () => {
  isCatalogOpen.value = true
  await nextTick()
  catalogDialog.value?.focus()
}

const closeCatalog = async () => {
  isCatalogOpen.value = false
  await nextTick()
  catalogTrigger.value?.focus()
}

const openLevelIntro = async () => {
  isLevelIntroOpen.value = true
  await nextTick()
  levelIntroDialog.value?.focus()
}

const closeLevelIntro = async () => {
  isLevelIntroOpen.value = false
  await nextTick()
  levelTrigger.value?.focus()
}

const openTips = async () => {
  isTipsOpen.value = true
  await nextTick()
  tipsDialog.value?.focus()
}

const closeTips = async () => {
  isTipsOpen.value = false
  await nextTick()
  tipsTrigger.value?.focus()
}

const handleStart = () => {
  emit('audio-unlock')
  emit('start')
}
</script>

<template>
  <main class="opening-screen">
    <div class="scene" aria-label="国门小卫士反走私大冒险开屏页">
      <div class="sprite banner" aria-hidden="true">
        <img :src="bannerImage" alt="" draggable="false" />
      </div>

      <!-- <p class="slogan">闯过3个小关卡，集齐3个道具，成为“反走私小专家”！</p> -->

      <button
        ref="ruleTrigger"
        class="sprite menu-item menu-button rules"
        type="button"
        aria-label="查看活动规则"
        @click="openRule"
      >
        <img :src="ruleImage" alt="" draggable="false" />
      </button>
      <button
        ref="levelTrigger"
        class="sprite menu-item menu-button levels"
        type="button"
        aria-label="查看关卡介绍"
        @click="openLevelIntro"
      >
        <img :src="levelImage" alt="" draggable="false" />
      </button>
      <button
        ref="catalogTrigger"
        class="sprite menu-item menu-button props"
        type="button"
        aria-label="查看道具图鉴"
        @click="openCatalog"
      >
        <img :src="propImage" alt="" draggable="false" />
      </button>
      <button
        ref="tipsTrigger"
        class="sprite menu-item menu-button tips"
        type="button"
        aria-label="查看反走私小贴士"
        @click="openTips"
      >
        <img :src="tipsImage" alt="" draggable="false" />
      </button>

      <div
        v-if="isCharacterVisible"
        class="character-stage"
        role="img"
        aria-label="国门小卫士卡通形象"
      >
        <img
          v-show="!isCharacterAnimating"
          class="character character-static"
          :src="characterStaticImage"
          alt=""
          draggable="false"
        />
        <img
          v-if="isCharacterAnimating"
          :key="characterAnimationKey"
          class="character character-animation"
          :src="characterAnimation"
          alt=""
          aria-hidden="true"
          draggable="false"
          @load="handleCharacterAnimationLoad"
          @error="handleCharacterAnimationError"
        />
      </div>
      <audio
        ref="characterAudioRef"
        :src="characterAudio"
        preload="auto"
        playsinline
        aria-hidden="true"
      ></audio>

      <Transition name="summon-prompt">
        <button
          v-if="isSummonPromptVisible"
          class="summon-overlay"
          type="button"
          aria-label="点击屏幕即可召唤小卫士"
          @click="summonCharacter"
        >
          <span class="summon-copy" aria-hidden="true">
            <img :src="summonImage" alt="" draggable="false" />
          </span>
        </button>
      </Transition>

      <img
        class="scene-box suitcase"
        :src="suitcaseImage"
        alt="海关主题旅行箱"
        draggable="false"
      />
      <img
        class="scene-box parcel"
        :src="parcelImage"
        alt="查验包裹箱"
        draggable="false"
      />

      <button class="start-button" type="button" aria-label="开始冒险" @click="handleStart">
        <span class="sprite start-art" aria-hidden="true">
          <img :src="startImage" alt="" draggable="false" />
        </span>
      </button>

      <Transition name="rule-modal">
        <div v-if="isRuleOpen" class="rule-overlay">
          <section
            ref="ruleDialog"
            class="rule-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rule-dialog-title"
            tabindex="-1"
          >
            <img class="rule-dialog-bg" :src="ruleBackgroundImage" alt="" draggable="false" />
            <h2 id="rule-dialog-title" class="visually-hidden">活动规则</h2>

            <div class="rule-copy">
              <p class="rule-welcome">欢迎参加“国门小卫士——<br />反走私大冒险”！</p>

              <ol class="rule-list">
                <li>
                  本次冒险共设有<span class="emphasis">3个反走私关卡</span>，按照顺序完成挑战。
                </li>
                <li>
                  每通过一个关卡，即可获得一个<span class="emphasis">专属道具</span>。
                </li>
                <li>
                  集齐侦查放大镜、知识徽章、巡查小哨子，即可成为<span class="highlight">“反走私小专家”</span>。
                </li>
                <li>遇到可疑物品时，请认真观察并选择正确的处理方式；回答错误可根据提示重新挑战。</li>
                <li>
                  完成全部关卡后，可解锁<span class="highlight">“反走私小专家”</span>荣誉页面。
                </li>
              </ol>
            </div>

            <aside class="rule-reminder">
              <strong>★ 📣 温馨提示 ★</strong>
              <p>不替陌生人携带物品，不购买来源不明商品，发现可疑线索及时报告。</p>
            </aside>

            <button class="dialog-ok" type="button" aria-label="我知道了" @click="closeRule">
              <span class="sprite ok-art" aria-hidden="true">
                <img :src="okImage" alt="" draggable="false" />
              </span>
            </button>
          </section>
        </div>
      </Transition>

      <Transition name="level-intro-modal">
        <div
          v-if="isLevelIntroOpen"
          class="level-intro-overlay"
        >
          <section
            ref="levelIntroDialog"
            class="level-intro-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-intro-dialog-title"
            tabindex="-1"
          >
            <img
              class="level-intro-dialog-bg"
              :src="levelIntroModalBackgroundImage"
              alt=""
              draggable="false"
            />
            <h2 id="level-intro-dialog-title" class="visually-hidden">关卡介绍</h2>

            <p class="level-intro-lead">
              完成<span>3个关卡</span>，成为<span>反走私小专家</span>
            </p>

            <div class="level-intro-cards">
              <article
                v-for="(item, index) in levelIntroItems"
                :key="item.id"
                class="level-intro-card"
              >
                <!-- <span class="level-intro-index" aria-hidden="true">{{ index + 1 }}</span> -->
                <img
                  class="level-intro-illustration"
                  :class="`level-intro-illustration--${item.id}`"
                  :src="item.image"
                  alt=""
                  draggable="false"
                />
                <div class="level-intro-copy">
                  <h3>{{ item.step }} · <strong>{{ item.name }}</strong></h3>
                  <p v-for="line in item.description" :key="line">{{ line }}</p>
                </div>
              </article>
            </div>

            <button
              class="level-intro-ok"
              type="button"
              aria-label="我知道了"
              @click="closeLevelIntro"
            >
              <span class="sprite ok-art" aria-hidden="true">
                <img :src="okImage" alt="" draggable="false" />
              </span>
            </button>
          </section>
        </div>
      </Transition>

      <Transition name="tips-modal">
        <div v-if="isTipsOpen" class="tips-overlay">
          <section
            ref="tipsDialog"
            class="tips-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tips-dialog-title"
            tabindex="-1"
          >
            <img
              class="tips-dialog-bg"
              :src="tipsModalBackgroundImage"
              alt=""
              draggable="false"
            />
            <h2 id="tips-dialog-title" class="visually-hidden">反走私小贴士</h2>

            <p class="tips-lead"><span>✦</span> 遇到可疑物品，先想一想！ <span>✦</span></p>

            <img
              class="tips-card tips-card--refuse"
              :src="tipsRefuseCardImage"
              alt="陌生物品，不帮带"
              draggable="false"
            />
            <img
              class="tips-card tips-card--report"
              :src="tipsReportCardImage"
              alt="发现可疑，快报告"
              draggable="false"
            />
            <img
              class="tips-mnemonic"
              :src="tipsMnemonicCardImage"
              alt="记住口诀：不替人携带、不购买可疑物品、发现及时报告"
              draggable="false"
            />

            <button class="tips-ok" type="button" aria-label="我记住了" @click="closeTips">
              <img :src="rememberedButtonImage" alt="" draggable="false" />
            </button>
          </section>
        </div>
      </Transition>

      <Transition name="catalog-modal">
        <div v-if="isCatalogOpen" class="catalog-overlay">
          <section
            ref="catalogDialog"
            class="catalog-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-dialog-title"
            tabindex="-1"
          >
            <img
              class="catalog-dialog-bg"
              :src="catalogBackgroundImage"
              alt=""
              draggable="false"
            />
            <h2 id="catalog-dialog-title" class="visually-hidden">道具图鉴</h2>

            <p class="catalog-lead" aria-hidden="true">
              <span>✦</span> 完成关卡，收集专属道具 <span>✦</span>
            </p>

            <div class="catalog-items">
              <article v-for="item in catalogItems" :key="item.id" class="catalog-item">
                <img
                  class="catalog-item-bg"
                  :src="itemCardBackgroundImage"
                  alt=""
                  draggable="false"
                />
                <div
                  class="catalog-item-art-wrap"
                  :class="`catalog-item-art-wrap--${item.id}`"
                  aria-hidden="true"
                >
                  <img
                    class="catalog-item-art"
                    :src="item.image"
                    alt=""
                    draggable="false"
                  />
                </div>
                <div class="catalog-item-copy">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.sourcePrefix }}<span class="catalog-text-accent">{{ item.sourceHighlight }}</span>{{ item.sourceSuffix }}</p>
                  <p>{{ item.description }}</p>
                </div>
                <img
                  v-if="item.obtained"
                  class="catalog-item-status"
                  :src="obtainedIcon"
                  alt="已获得"
                  draggable="false"
                />
                <button
                  v-else
                  class="catalog-item-status catalog-item-status--action"
                  type="button"
                  :aria-label="`去${item.name}对应的第${item.level}关获得道具`"
                  @click="acquireCatalogItem(item.level, item.obtained)"
                >
                  <img :src="goObtainIcon" alt="去获得" draggable="false" />
                </button>
              </article>
            </div>

            <div class="catalog-progress">
              <img
                class="catalog-progress-bg"
                :src="progressCardBackgroundImage"
                alt=""
                draggable="false"
              />
              <p class="catalog-progress-count">
                已收集 <strong>{{ collectedCount }}/3</strong>
              </p>
              <p class="catalog-progress-tip">
                集齐<span class="catalog-text-accent">3个专属道具</span>，即可成为「<span
                  class="catalog-text-honor"
                  >反走私小专家</span
                >」
              </p>
              <div class="catalog-progress-slots" aria-label="已收集的专属道具">
                <div
                  v-for="(item, index) in catalogItems"
                  :key="item.id"
                  class="catalog-progress-slot"
                  :class="[
                    `catalog-progress-slot--${index + 1}`,
                    `catalog-progress-slot--${item.id}`,
                  ]"
                >
                  <img
                    v-if="item.obtained"
                    :src="item.image"
                    :alt="`已收集${item.name}`"
                    draggable="false"
                  />
                </div>
              </div>
            </div>

            <button class="catalog-ok" type="button" aria-label="我知道了" @click="closeCatalog">
              <span class="sprite ok-art" aria-hidden="true">
                <img :src="okImage" alt="" draggable="false" />
              </span>
            </button>
          </section>
        </div>
      </Transition>
    </div>
  </main>
</template>

<style>
:root {
  color-scheme: light;
  font-family:
    "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  background: #31b8ec;
}

button,
img,
video {
  -webkit-user-select: none;
  user-select: none;
}

.opening-screen {
  display: grid;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  place-items: center;
  background: #31b8ec;
}

.scene {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  flex: none;
  overflow: hidden;
  background: url("../assets/images/homeBg.png") center / 100% 100% no-repeat;
  isolation: isolate;
}

.sprite {
  position: absolute;
  display: block;
  overflow: hidden;
  pointer-events: none;
}

.sprite img {
  position: absolute;
  display: block;
  max-width: none;
}

/* banner.png: 1536×1024, visible pixels: 1197×397 at (150, 299) */
.banner {
  top: 5.8%;
  left: 14.6%;
  z-index: 3;
  width: 72.4%;
  aspect-ratio: 1197 / 397;
  transform: scaleY(1.2);
  transform-origin: 50% 0;
}

.banner img {
  top: -75.315%;
  left: -12.531%;
  width: 128.321%;
}

.slogan {
  position: absolute;
  top: 22.15%;
  left: 17.6%;
  z-index: 4;
  display: grid;
  width: 64.8%;
  min-height: 4.15%;
  margin: 0;
  padding: 0.45em 0.7em 0.5em;
  place-items: center;
  border: clamp(2px, 0.52vw, 5px) solid #f4c66f;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff8e9 0%, #ffe9bd 100%);
  box-shadow:
    0 0.42em 0.62em rgb(86 74 34 / 25%),
    inset 0 0.12em 0 rgb(255 255 255 / 90%);
  color: #4c2516;
  font-size: clamp(9px, 2.28vw, 25px);
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0.06em 0 #fff8e7;
}

.menu-item {
  z-index: 2;
}

.menu-button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
  touch-action: manipulation;
}

.menu-button:focus-visible {
  outline: clamp(2px, 0.55vw, 5px) solid #fff;
  outline-offset: clamp(2px, 0.5vw, 5px);
  border-radius: 18%;
}

.menu-button:active {
  transform: scale(0.95);
}

/* nav-activity-rules.png: 1254×1254, visible pixels: 1063×1164 at (96, 39) */
.rules {
  top: 13.05%;
  left: 1.2%;
  width: 14.15%;
  aspect-ratio: 1063 / 1164;
}

.rules img {
  top: -3.351%;
  left: -9.031%;
  width: 117.968%;
}

/* nav-level-intro.png: 1254×1254, visible pixels: 1092×1110 at (85, 69) */
.levels {
  top: 13.05%;
  right: 1.2%;
  width: 13.85%;
  aspect-ratio: 1092 / 1110;
}

.levels img {
  top: -6.216%;
  left: -7.784%;
  width: 114.835%;
}

/* nav-item-catalog.png: 1254×1254, visible pixels: 1052×1088 at (101, 85) */
.props {
  top: 23.55%;
  right: 1.25%;
  width: 14.1%;
  aspect-ratio: 1052 / 1088;
}

.props img {
  top: -7.813%;
  left: -9.601%;
  width: 119.202%;
}

/* nav-smuggling-tips.png: 1254×1254, visible pixels: 1165×1194 at (42, 22) */
.tips {
  top: 23.35%;
  left: 1.25%;
  width: 14.1%;
  aspect-ratio: 1165 / 1194;
}

.tips img {
  top: -1.843%;
  left: -3.605%;
  width: 107.639%;
}

.character-stage {
  position: absolute;
  top: 37.1%;
  left: 21.05%;
  z-index: 3;
  display: block;
  width: 58.5%;
  aspect-ratio: 500 / 656;
  pointer-events: none;
  filter: drop-shadow(0 0.7vw 0.8vw rgb(74 73 28 / 18%));
}

.character {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.character-static {
  z-index: 0;
}

.character-animation {
  z-index: 1;
}

.summon-overlay {
  position: absolute;
  inset: 0;
  z-index: 15;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgb(4 44 56 / 38%);
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
  backdrop-filter: blur(1.5px);
}

.summon-copy {
  position: absolute;
  top: 31.5%;
  left: 50%;
  display: block;
  width: 84%;
  aspect-ratio: 887 / 655;
  overflow: hidden;
  pointer-events: none;
  transform: translateX(-50%);
  filter: drop-shadow(0 0.7em 0.85em rgb(14 39 44 / 28%));
}

.summon-copy img {
  position: absolute;
  top: -49.008%;
  left: -7.553%;
  display: block;
  width: 115.445%;
  max-width: none;
}

.summon-overlay:focus-visible {
  outline: none;
}

.summon-overlay:focus-visible .summon-copy {
  outline: clamp(2px, 0.6vw, 5px) solid #fff;
  outline-offset: clamp(3px, 0.7vw, 6px);
}

@media (prefers-reduced-motion: no-preference) {
  .summon-copy {
    animation: summon-breathe 1.7s ease-in-out infinite;
  }
}

@keyframes summon-breathe {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.035);
  }
}

.summon-prompt-enter-active,
.summon-prompt-leave-active {
  transition: opacity 180ms ease;
}

.summon-prompt-enter-from,
.summon-prompt-leave-to {
  opacity: 0;
}

.scene-box {
  position: absolute;
  z-index: 4;
  display: block;
  width: 28%;
  height: auto;
  pointer-events: none;
}

.suitcase {
  top: 54.5%;
  left: 2.2%;
}

.parcel {
  top: 62.75%;
  left: 65.2%;
}

.start-button {
  position: absolute;
  top: 78.4%;
  left: 24.85%;
  z-index: 5;
  width: 50.7%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.start-button:focus-visible {
  outline: clamp(2px, 0.6vw, 5px) solid #fff;
  outline-offset: clamp(2px, 0.7vw, 6px);
}

.start-button:active {
  transform: translateY(1.2%) scale(0.97);
}

/* start.png: 1024×1536, visible pixels: 847×381 at (96, 589) */
.start-art {
  position: relative;
  width: 100%;
  aspect-ratio: 847 / 381;
}

.start-art img {
  top: -154.593%;
  left: -11.334%;
  width: 120.898%;
}

@media (prefers-reduced-motion: no-preference) {
  .start-button {
    animation: button-breathe 2.4s ease-in-out infinite;
  }
}

@keyframes button-breathe {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.025);
  }
}

.rule-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  overflow: hidden;
  place-items: center;
  background: rgb(8 15 15 / 78%);
}

.rule-dialog {
  position: relative;
  width: 100%;
  width: min(100%, calc(100vh * 2 / 3));
  width: min(100%, calc(100dvh * 2 / 3));
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  color: #512813;
  outline: none;
}

.rule-dialog-bg {
  position: absolute;
  inset: -2px;
  display: block;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  pointer-events: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.dialog-ok {
  position: absolute;
  z-index: 3;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.dialog-ok:focus-visible {
  outline: clamp(2px, 0.55vw, 5px) solid #fff;
  outline-offset: 2px;
}

.dialog-ok:active {
  transform: scale(0.95);
}

.rule-copy {
  position: absolute;
  top: 17.6%;
  left: 17.2%;
  z-index: 2;
  width: 65.6%;
}

.rule-welcome {
  margin: 0 0 0.72em;
  color: #4c2714;
  font-size: clamp(13px, 3.75vw, 25px);
  font-weight: 900;
  line-height: 1.5;
  text-align: center;
  text-shadow: 0 0.06em 0 #fff4c8;
}

.rule-welcome::after {
  display: block;
  margin-top: 0.45em;
  color: #f5b62e;
  content: "──────── ★ ────────";
  font-size: 0.72em;
  letter-spacing: -0.08em;
}

.rule-list {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.42em;
  color: #512813;
  counter-reset: rule-item;
  font-size: clamp(10.5px, 2.92vw, 19px);
  font-weight: 650;
  line-height: 1.45;
  list-style: none;
}

.rule-list li {
  position: relative;
  padding-left: 2.05em;
  counter-increment: rule-item;
}

.rule-list li::before {
  position: absolute;
  top: -0.05em;
  left: 0;
  color: #ff6d16;
  content: counter(rule-item) ".";
  font-size: 1.18em;
  font-weight: 900;
}

.emphasis {
  color: #ff5a16;
  font-weight: 900;
}

.highlight {
  color: #0877e8;
  font-weight: 900;
}

.rule-reminder {
  position: absolute;
  top: 61.1%;
  left: 16.4%;
  z-index: 2;
  width: 67.2%;
  min-height: 10.7%;
  padding: 1.25% 3% 1.6%;
  border: clamp(1px, 0.3vw, 2px) solid #eba839;
  border-radius: 5.2% / 22%;
  background: rgb(255 240 189 / 72%);
  box-shadow: inset 0 0 1em rgb(255 255 255 / 48%);
  text-align: center;
}

.rule-reminder strong {
  display: block;
  color: #df6220;
  font-size: clamp(11px, 3.15vw, 21px);
  font-weight: 900;
}

.rule-reminder p {
  margin: 0.35em 0 0;
  color: #4d2818;
  font-size: clamp(9.5px, 2.48vw, 16px);
  font-weight: 650;
  line-height: 1.4;
  text-align: left;
}

.dialog-ok {
  bottom: 14.8%;
  left: 27%;
  width: 46%;
  aspect-ratio: 698 / 240;
  border-radius: 999px;
}

.ok-art {
  position: relative;
  width: 100%;
  height: 100%;
}

/* ok.png: 1024×1536, visible pixels: 698×240 at (163, 612) */
.ok-art img {
  top: -255%;
  left: -23.352%;
  width: 146.705%;
}

.level-intro-overlay {
  position: absolute;
  inset: 0;
  z-index: 22;
  display: grid;
  overflow: hidden;
  place-items: center;
  background: rgb(8 15 15 / 74%);
}

.level-intro-dialog {
  position: relative;
  width: 84%;
  width: min(84%, calc(96vh * 980 / 1604));
  width: min(84%, calc(96dvh * 980 / 1604));
  max-width: 100%;
  max-height: 96%;
  aspect-ratio: 980 / 1604;
  overflow: hidden;
  color: #5B2D18;
  outline: none;
  filter: drop-shadow(0 0.9em 1.1em rgb(20 16 7 / 38%));
}

.level-intro-dialog-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.level-intro-ok {
  position: absolute;
  z-index: 5;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.level-intro-ok:focus-visible {
  outline: clamp(2px, 0.55vw, 5px) solid #FFF;
  outline-offset: 2px;
}

.level-intro-ok:active {
  transform: scale(0.95);
}

.level-intro-lead {
  position: absolute;
  top: 17.5%;
  left: 7%;
  z-index: 2;
  width: 86%;
  margin: 0;
  color: #5B2D18;
  font-size: clamp(11px, 3.32vw, 21px);
  font-weight: 850;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.level-intro-lead span {
  color: #FF4F25;
}

.level-intro-cards {
  position: absolute;
  top: 24.2%;
  left: 6.7%;
  z-index: 2;
  display: grid;
  width: 86.6%;
  height: 57.2%;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 2.2%;
}

.level-intro-card {
  position: relative;
  min-height: 0;
  overflow: hidden;
  border: clamp(1.5px, 0.48vw, 4px) solid #EFC36C;
  border-radius: 7.5% / 18%;
  background:
    radial-gradient(circle at 28% 35%, rgb(255 255 255 / 72%) 0, transparent 38%),
    linear-gradient(180deg, #FFF9EB 0%, #FFF0CE 100%);
  box-shadow:
    0 0.34em 0.42em rgb(116 66 13 / 22%),
    inset 0 0 0 1px rgb(255 255 255 / 90%);
}

.level-intro-index {
  position: absolute;
  top: 6.5%;
  left: 2.7%;
  z-index: 3;
  display: grid;
  width: 11.2%;
  aspect-ratio: 1;
  place-items: center;
  border: clamp(1px, 0.38vw, 3px) solid #FFD36B;
  border-radius: 50%;
  background: linear-gradient(180deg, #FF7137 0%, #EF3D18 100%);
  box-shadow:
    0 0.12em 0.2em rgb(103 46 13 / 34%),
    inset 0 0 0 1px rgb(255 255 255 / 55%);
  color: #FFF8DF;
  font-size: clamp(14px, 4.5vw, 28px);
  font-weight: 950;
  line-height: 1;
  text-shadow: 0 0.08em 0 #A83312;
}

.level-intro-illustration {
  position: absolute;
  top: 5%;
  left: 5.5%;
  z-index: 2;
  display: block;
  /* width: 34%; */
  height: 99%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 0.3em 0.22em rgb(95 56 17 / 18%));
}

.level-intro-illustration--suitcase {
  top: 1%;
  left: 4.5%;
  width: 36%;
  height: 98%;
}

.level-intro-illustration--harbor {
  top: 2%;
  left: 3.8%;
  width: 37%;
  height: 96%;
}

.level-intro-copy {
  position: absolute;
  top: 20%;
  left: 41.8%;
  z-index: 2;
  width: 55.5%;
}

.level-intro-copy h3 {
  margin: 0 0 0.5em;
  color: #5B2D18;
  font-size: clamp(12px, 3.48vw, 22px);
  font-weight: 900;
  line-height: 1.12;
  white-space: nowrap;
}

.level-intro-copy h3 strong {
  color: #F04420;
  font-weight: 950;
}

.level-intro-copy p {
  margin: 0 0 0.25em;
  color: #5B2D18;
  font-size: clamp(9px, 2.7vw, 17px);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.level-intro-ok {
  bottom: 2.7%;
  left: 26%;
  width: 48%;
  aspect-ratio: 698 / 240;
  border-radius: 999px;
}

.level-intro-modal-enter-active,
.level-intro-modal-leave-active {
  transition: opacity 180ms ease;
}

.level-intro-modal-enter-active .level-intro-dialog,
.level-intro-modal-leave-active .level-intro-dialog {
  transition: transform 220ms cubic-bezier(0.2, 0.85, 0.25, 1.1);
}

.level-intro-modal-enter-from,
.level-intro-modal-leave-to {
  opacity: 0;
}

.level-intro-modal-enter-from .level-intro-dialog,
.level-intro-modal-leave-to .level-intro-dialog {
  transform: translateY(2%) scale(0.92);
}

.tips-overlay {
  position: absolute;
  inset: 0;
  z-index: 23;
  display: grid;
  overflow: hidden;
  place-items: center;
  background: rgb(8 15 15 / 74%);
}

.tips-dialog {
  position: relative;
  width: 84%;
  width: min(84%, calc(96vh * 982 / 1720));
  width: min(84%, calc(96dvh * 982 / 1720));
  max-width: 100%;
  max-height: 96%;
  aspect-ratio: 982 / 1720;
  overflow: hidden;
  color: #5B2D18;
  outline: none;
  filter: drop-shadow(0 0.9em 1.1em rgb(20 16 7 / 38%));
}

.tips-dialog-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tips-ok {
  position: absolute;
  z-index: 5;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.tips-ok:focus-visible {
  outline: clamp(2px, 0.55vw, 5px) solid #FFF;
  outline-offset: 2px;
}

.tips-ok:active {
  transform: scale(0.95);
}

.tips-lead {
  position: absolute;
  top: 17.7%;
  left: 8%;
  z-index: 2;
  width: 84%;
  margin: 0;
  color: #5B2D18;
  font-size: clamp(11px, 3.25vw, 20px);
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.tips-lead span {
  color: #F6A91A;
}

.tips-card,
.tips-mnemonic {
  position: absolute;
  left: 50%;
  z-index: 2;
  display: block;
  height: auto;
  pointer-events: none;
  transform: translateX(-50%);
  filter: drop-shadow(0 0.32em 0.24em rgb(91 50 12 / 20%));
}

.tips-card {
  width: 80%;
}

.tips-card--refuse {
  top: 21.2%;
}

.tips-card--report {
  top: 45.8%;
}

.tips-mnemonic {
  top: 72.4%;
  width: 80%;
  height: 15%;
  object-fit: fill;
}

.tips-ok {
  bottom: 1.3%;
  left: 25%;
  width: 50%;
  aspect-ratio: 1440 / 563;
  border-radius: 999px;
}

.tips-ok img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.tips-modal-enter-active,
.tips-modal-leave-active {
  transition: opacity 180ms ease;
}

.tips-modal-enter-active .tips-dialog,
.tips-modal-leave-active .tips-dialog {
  transition: transform 220ms cubic-bezier(0.2, 0.85, 0.25, 1.1);
}

.tips-modal-enter-from,
.tips-modal-leave-to {
  opacity: 0;
}

.tips-modal-enter-from .tips-dialog,
.tips-modal-leave-to .tips-dialog {
  transform: translateY(2%) scale(0.92);
}

.catalog-overlay {
  position: absolute;
  inset: 0;
  z-index: 21;
  display: grid;
  overflow: hidden;
  place-items: center;
  background: rgb(8 15 15 / 70%);
}

.catalog-dialog {
  position: relative;
  width: 93%;
  width: min(93%, calc(100vh * 941 / 1672));
  width: min(93%, calc(100dvh * 941 / 1672));
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 941 / 1672;
  overflow: hidden;
  color: #5B2D18;
  outline: none;
}

.catalog-dialog-bg {
  position: absolute;
  inset: -1px;
  display: block;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  pointer-events: none;
}

.catalog-ok {
  position: absolute;
  z-index: 4;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: manipulation;
}

.catalog-ok:focus-visible {
  outline: clamp(2px, 0.55vw, 5px) solid #fff;
  outline-offset: 2px;
}

.catalog-ok:active {
  transform: scale(0.95);
}

.catalog-lead {
  position: absolute;
  top: 22.45%;
  left: 12%;
  z-index: 2;
  width: 76%;
  margin: 0;
  color: #5B2D18;
  font-size: clamp(12px, 3.5vw, 22px);
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
}

.catalog-lead span {
  color: #f6b92f;
}

.catalog-items {
  position: absolute;
  top: 26.35%;
  left: 10.8%;
  z-index: 2;
  display: grid;
  width: 78.4%;
  gap: 0;
}

.catalog-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1854 / 603;
}

.catalog-item-bg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.catalog-item-art-wrap {
  position: absolute;
  top: 7%;
  left: 2.2%;
  display: grid;
  width: 27%;
  height: 86%;
  place-items: center;
  pointer-events: none;
}

.catalog-item-art-wrap::before,
.catalog-item-art-wrap::after {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.catalog-item-art-wrap::before {
  top: 15%;
  left: 9%;
  width: 82%;
  height: 68%;
  background: radial-gradient(
    ellipse,
    rgb(223 159 70 / 22%) 0%,
    rgb(223 159 70 / 8%) 55%,
    transparent 75%
  );
}

.catalog-item-art-wrap::after {
  bottom: 7%;
  left: 23%;
  width: 54%;
  height: 13%;
  background: rgb(107 63 18 / 22%);
  filter: blur(clamp(3px, 0.75vw, 7px));
}

.catalog-item-art {
  position: relative;
  z-index: 1;
  display: block;
  width: 80%;
  height: 80%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 0.2em 0.22em rgb(103 61 10 / 16%));
}

.catalog-item-art-wrap--badge .catalog-item-art {
  width: 78%;
  height: 78%;
}

.catalog-item-art-wrap--whistle {
  left: 1.5%;
}

.catalog-item-art-wrap--whistle .catalog-item-art {
  width: 88%;
  height: 78%;
}

.catalog-item-copy {
  position: absolute;
  top: 14%;
  left: 32.1%;
  width: 51%;
}

.catalog-item-copy h3 {
  margin: 0 0 0.28em;
  color: #5B2D18;
  font-size: clamp(13px, 3.85vw, 24px);
  font-weight: 900;
  line-height: 1.2;
}

.catalog-item-copy p {
  margin: 0 0 0.34em;
  color: #5B2D18;
  font-size: clamp(9px, 2.62vw, 16px);
  font-weight: 650;
  line-height: 1.25;
  white-space: nowrap;
}

.catalog-item-status {
  position: absolute;
  right: 3.2%;
  bottom: 12.5%;
  display: block;
  width: 18.5%;
  height: auto;
  pointer-events: none;
}

.catalog-item-status--action {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.catalog-item-status--action img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.catalog-item-status--action:focus-visible {
  border-radius: 18%;
  outline: clamp(2px, 0.45vw, 3px) solid #fff;
  outline-offset: 2px;
}

.catalog-item-status--action:active {
  transform: scale(0.96);
}

.catalog-progress {
  position: absolute;
  top: 68.7%;
  left: 10.7%;
  z-index: 2;
  width: 78.6%;
  aspect-ratio: 2126 / 678;
}

.catalog-progress-bg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.catalog-progress-count,
.catalog-progress-tip {
  position: absolute;
  left: 6.3%;
  z-index: 2;
  margin: 0;
  color: #5B2D18;
}

.catalog-text-accent {
  color: #FF5A32;
}

.catalog-text-honor {
  color: #168BFF;
}

.catalog-progress-count {
  top: 34%;
  font-size: clamp(14px, 4.15vw, 26px);
  font-weight: 900;
  line-height: 1;
}

.catalog-progress-count strong {
  color: #ed6b15;
  font-size: 1.18em;
}

.catalog-progress-slots {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.catalog-progress-slot {
  position: absolute;
  top: 18.2%;
  display: grid;
  width: 14.4%;
  aspect-ratio: 1;
  place-items: center;
}

.catalog-progress-slot--1 {
  left: 46.5%;
}

.catalog-progress-slot--2 {
  left: 62.9%;
}

.catalog-progress-slot--3 {
  left: 79.2%;
}

.catalog-progress-slot img {
  display: block;
  width: 76%;
  height: 76%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 0.12em 0.12em rgb(91 52 8 / 22%));
}

.catalog-progress-slot--magnifier img {
  width: 70%;
  height: 79%;
}

.catalog-progress-slot--whistle img {
  width: 80%;
  height: 72%;
}

.catalog-progress-tip {
  top: 65%;
  font-size: clamp(8.5px, 2.38vw, 15px);
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
}

.catalog-ok {
  bottom: 7.2%;
  left: 27%;
  width: 46%;
  aspect-ratio: 698 / 240;
  border-radius: 999px;
}

.catalog-modal-enter-active,
.catalog-modal-leave-active {
  transition: opacity 180ms ease;
}

.catalog-modal-enter-active .catalog-dialog,
.catalog-modal-leave-active .catalog-dialog {
  transition: transform 220ms cubic-bezier(0.2, 0.85, 0.25, 1.1);
}

.catalog-modal-enter-from,
.catalog-modal-leave-to {
  opacity: 0;
}

.catalog-modal-enter-from .catalog-dialog,
.catalog-modal-leave-to .catalog-dialog {
  transform: translateY(2%) scale(0.92);
}

.rule-modal-enter-active,
.rule-modal-leave-active {
  transition: opacity 180ms ease;
}

.rule-modal-enter-active .rule-dialog,
.rule-modal-leave-active .rule-dialog {
  transition: transform 220ms cubic-bezier(0.2, 0.85, 0.25, 1.1);
}

.rule-modal-enter-from,
.rule-modal-leave-to {
  opacity: 0;
}

.rule-modal-enter-from .rule-dialog,
.rule-modal-leave-to .rule-dialog {
  transform: translateY(2%) scale(0.92);
}

@media (prefers-reduced-motion: reduce) {
  .tips-modal-enter-active,
  .tips-modal-leave-active,
  .tips-modal-enter-active .tips-dialog,
  .tips-modal-leave-active .tips-dialog,
  .level-intro-modal-enter-active,
  .level-intro-modal-leave-active,
  .level-intro-modal-enter-active .level-intro-dialog,
  .level-intro-modal-leave-active .level-intro-dialog,
  .catalog-modal-enter-active,
  .catalog-modal-leave-active,
  .catalog-modal-enter-active .catalog-dialog,
  .catalog-modal-leave-active .catalog-dialog,
  .rule-modal-enter-active,
  .rule-modal-leave-active,
  .rule-modal-enter-active .rule-dialog,
  .rule-modal-leave-active .rule-dialog {
    transition: none;
  }
}
</style>
