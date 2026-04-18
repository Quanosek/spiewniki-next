import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(true) // default true to hide button on SSR

  useEffect(() => {
    const installedFromStorage = localStorage.getItem('pwaInstalled') === 'true'
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as NavigatorStandalone).standalone === true ||
      document.referrer.includes('android-app://')

    const hideInstallButton = standalone || installedFromStorage
    setIsStandalone(hideInstallButton)

    if (standalone) return

    const handler = (e: Event) => {
      e.preventDefault()
      // If install prompt is available again, app is not installed anymore.
      localStorage.removeItem('pwaInstalled')
      setIsStandalone(false)
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      localStorage.setItem('pwaInstalled', 'true')
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true')
        setDeferredPrompt(null)
        setIsStandalone(true)
      }
      return
    }

    // Fallback for browsers without beforeinstallprompt
    const ua = navigator.userAgent
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(ua) || /^((?!crios|fxios|edgios).)*safari/i.test(ua)

    if (isSafari) {
      alert(
        'Instalacja PWA w Safari:\n1. Otwórz menu "Udostępnij"\n2. Wybierz "Dodaj do ekranu początkowego" (iOS) lub "Dodaj do Docka" (macOS)'
      )
    } else {
      alert(
        'Ta funkcja nie jest obsługiwana przez twoją przeglądarkę.\nSpróbuj użyć przeglądarki bazującej na silniku Chromium np. Google Chrome, Microsoft Edge lub Opera.'
      )
    }
  }, [deferredPrompt])

  const showButton = !isStandalone

  return { install, showButton }
}
