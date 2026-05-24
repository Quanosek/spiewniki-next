import { useCallback, useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorWithInstallHints extends Navigator {
  standalone?: boolean
  getInstalledRelatedApps?: () => Promise<unknown[]>
}

const isStandaloneMode = (navigatorRef: NavigatorWithInstallHints) =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  navigatorRef.standalone === true ||
  document.referrer.includes('android-app://')

function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(true)

  useEffect(() => {
    let isMounted = true
    const navigatorRef = window.navigator as NavigatorWithInstallHints

    const markInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    const syncInstallState = async () => {
      const standalone = isStandaloneMode(navigatorRef)
      setIsStandalone(standalone)

      if (!navigatorRef.getInstalledRelatedApps) return

      try {
        const relatedApps = await navigatorRef.getInstalledRelatedApps()
        if (isMounted && relatedApps.length > 0) markInstalled()
      } catch {
        // Ignore
      }
    }

    void syncInstallState()

    const standalone = isStandaloneMode(navigatorRef)
    if (standalone) {
      return () => {
        isMounted = false
      }
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const e = event as InstallPromptEvent
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const onAppInstalled = () => markInstalled()

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      isMounted = false
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }
  }, [deferredPrompt])

  const showButton = !isStandalone && deferredPrompt !== null
  return { install, showButton }
}

export { useInstallPWA }
