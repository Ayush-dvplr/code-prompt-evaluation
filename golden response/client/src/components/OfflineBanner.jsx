import { useState, useEffect } from 'react';

// Listens to browser online/offline events and shows a banner when offline
function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-yellow-400 py-2 text-center text-sm font-medium text-yellow-900">
      ⚠️ You are offline. Changes will sync automatically when you reconnect.
    </div>
  );
}

export default OfflineBanner;
