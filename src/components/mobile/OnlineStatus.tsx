import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { isOnline, addConnectivityListeners } from '../../utils/pwa';
import { toast } from 'sonner@2.0.3';

export function OnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const cleanup = addConnectivityListeners(
      () => {
        setOnline(true);
        toast.success('Back online! Data will sync automatically.');
      },
      () => {
        setOnline(false);
        toast.warning('You are offline. Some features may be limited.');
      }
    );

    return cleanup;
  }, []);

  if (online) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 z-50 flex items-center justify-center gap-2 text-sm">
      <WifiOff className="w-4 h-4" />
      <span>You are offline - Working in offline mode</span>
    </div>
  );
}
