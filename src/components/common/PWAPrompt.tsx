import { useEffect, useState, useCallback, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, WifiOff, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Check if app is running in standalone mode (installed PWA)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone());
  const updateCheckInterval = useRef<number | null>(null);
  const visibilityHandler = useRef<(() => void) | null>(null);

  // Service worker registration with auto-update
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every hour in production
        const updateInterval = import.meta.env.PROD ? 60 * 60 * 1000 : 5 * 60 * 1000;

        updateCheckInterval.current = window.setInterval(() => {
          r.update();
        }, updateInterval);

        // Check for updates when app comes back to foreground
        visibilityHandler.current = () => {
          if (document.visibilityState === 'visible' && !document.hidden) {
            r.update();
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler.current);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  // Show offline ready notification
  useEffect(() => {
    if (offlineReady) {
      setShowOfflineReady(true);
      const timer = setTimeout(() => {
        setShowOfflineReady(false);
        setOfflineReady(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  // Clean up interval and visibility handler on unmount
  useEffect(() => {
    return () => {
      if (updateCheckInterval.current) {
        clearInterval(updateCheckInterval.current);
      }
      if (visibilityHandler.current) {
        document.removeEventListener('visibilitychange', visibilityHandler.current);
      }
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    // Don't show if already installed
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt after 5 seconds (less intrusive)
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  }, []);

  // Don't render install prompt if already installed
  if (isInstalled && !needRefresh && isOnline && !showOfflineReady) {
    return null;
  }

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 safe-area-top"
          >
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Ready Toast */}
      <AnimatePresence>
        {showOfflineReady && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-36 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-[100] bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">App ready for offline use</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bill Vault can now work without internet.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Toast */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-36 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-[100] bg-card border border-border rounded-xl shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <RefreshCw className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Update Available</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A new version is available. Refresh to update.
                </p>
              </div>
              <button
                onClick={() => setNeedRefresh(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNeedRefresh(false)}
                className="flex-1"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={() => updateServiceWorker(true)}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Update Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt - Mobile only */}
      <AnimatePresence>
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-36 lg:hidden left-4 right-4 z-[100] bg-card border border-border rounded-xl shadow-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Download className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Install Bill Vault</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add to your home screen for quick access and offline use.
                </p>
              </div>
              <button
                onClick={dismissInstall}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={dismissInstall}
                className="flex-1"
              >
                Not Now
              </Button>
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Install
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
