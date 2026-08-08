import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the user is on iOS
    const isIosDevice = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
    // Check if it's already installed (standalone mode)
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // Android/Desktop event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="install-pwa-banner" style={{
      background: 'var(--accent-primary)',
      color: 'white',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <Download size={20} />
        <div style={{ fontSize: '0.85rem' }}>
          <strong>Install N.M.T App</strong>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {isIOS 
              ? "Tap 'Share' then 'Add to Home Screen' for offline access." 
              : "Install this app on your device for quick offline access."}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {!isIOS && (
          <button onClick={handleInstallClick} style={{ background: 'white', color: 'var(--accent-primary)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
            Install
          </button>
        )}
        <button onClick={() => setShowPrompt(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem' }}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
