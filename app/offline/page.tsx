"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 rounded-full p-4">
            <WifiOff className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-display font-bold text-primary mb-2">
          You&apos;re Offline
        </h1>
        
        <p className="font-body text-text-secondary mb-6">
          It looks like you&apos;ve lost your internet connection. Some features may be limited until you&apos;re back online.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">What you can still do:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>View cached quiz questions</li>
            <li>Continue unfinished quizzes</li>
            <li>Review your progress</li>
            <li>Browse previously loaded content</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 font-body text-text-primary rounded-lg font-medium hover:bg-gray-200 transition"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
