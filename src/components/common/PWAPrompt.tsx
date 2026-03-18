import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Service worker registration with auto-update
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt after a delay
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setShowInstallPrompt(false);
    }
  }, []);

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2"
          >
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
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
            className="fixed bottom-24 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-[100] bg-card border border-border rounded-xl shadow-xl p-4"
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
            className="fixed bottom-24 lg:hidden left-4 right-4 z-[100] bg-card border border-border rounded-xl shadow-xl p-4"
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
