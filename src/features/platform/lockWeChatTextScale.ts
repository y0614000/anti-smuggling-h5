interface WeixinJSBridge {
  invoke(
    method: 'setFontSizeCallback',
    params: { fontSize: 0 },
    callback?: () => void,
  ): void
  on(event: 'menu:setfont', callback: () => void): void
}

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridge
  }
}

const resetWeChatFontSize = () => {
  window.WeixinJSBridge?.invoke('setFontSizeCallback', { fontSize: 0 })
}

/**
 * Android WeChat can scale page text through its JS bridge instead of the
 * browser's text-size-adjust CSS property. Reset it once the bridge is ready,
 * and again whenever the user changes WeChat's font-size menu setting.
 */
export const lockWeChatTextScale = () => {
  const handleBridgeReady = () => {
    resetWeChatFontSize()
    window.WeixinJSBridge?.on('menu:setfont', resetWeChatFontSize)
  }

  if (window.WeixinJSBridge) {
    handleBridgeReady()
    return
  }

  document.addEventListener('WeixinJSBridgeReady', handleBridgeReady, { once: true })
}

