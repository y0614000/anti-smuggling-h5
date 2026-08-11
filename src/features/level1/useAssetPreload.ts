const loadImage = async (url: string) => {
  const image = new Image()
  image.decoding = 'async'
  image.src = url

  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => resolve(), { once: true })
    })
  }

  if ('decode' in image) await image.decode().catch(() => undefined)
}

export const preloadImages = (urls: readonly string[]) => Promise.all(urls.map(loadImage))

export const deferImagePreload = (urls: readonly string[]) => {
  const preload = () => void preloadImages(urls)
  const idleWindow = window as Window & {
    requestIdleCallback?: typeof window.requestIdleCallback
    cancelIdleCallback?: typeof window.cancelIdleCallback
  }

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const idleId = idleWindow.requestIdleCallback(preload, { timeout: 2_000 })
    return () => idleWindow.cancelIdleCallback?.(idleId)
  }

  const timer = globalThis.setTimeout(preload, 800)
  return () => globalThis.clearTimeout(timer)
}
