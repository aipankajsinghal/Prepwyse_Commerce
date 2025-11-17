"use client";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Delay hiding to show "Back online" message briefly
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
        isOnline
          ? "bg-green-600 text-white animate-slide-in-bottom"
          : "bg-red-600 text-white animate-pulse"
      }`}
    >
      {!isOnline && <WifiOff className="h-5 w-5" />}
      <span className="font-medium">
        {isOnline ? "Back online" : "You are offline"}
      </span>
    </div>
  );
}
