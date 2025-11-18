"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full edu-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-accent-1/10 rounded-full p-4">
            <FileQuestion className="h-12 w-12 text-accent-1" />
          </div>
        </div>
        
        <h1 className="text-6xl font-display font-bold text-primary mb-2">404</h1>
        
        <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
          Page Not Found
        </h2>
        
        <p className="font-body text-text-secondary mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
