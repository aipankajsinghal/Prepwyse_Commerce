"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Page error:", error);
    
    // In production, send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full edu-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-semantic-error/10 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-semantic-error" />
          </div>
        </div>
        
        <h1 className="text-2xl font-display font-bold text-primary mb-2">
          Something went wrong!
        </h1>
        
        <p className="font-body text-text-secondary mb-6">
          We encountered an unexpected error. Your progress has been saved. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-left">
            <p className="text-sm font-mono text-semantic-error break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
