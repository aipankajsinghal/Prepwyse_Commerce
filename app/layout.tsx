import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PrepWyse Commerce - AI-Powered EdTech Platform for Commerce Students",
    template: "%s | PrepWyse Commerce",
  },
  description:
    "Master Commerce exams with AI-powered adaptive learning. Comprehensive preparation for Class 11, Class 12, and CUET Commerce with personalized quizzes, mock tests, and intelligent study recommendations.",
  keywords: [
    "commerce education",
    "CUET preparation",
    "class 11 commerce",
    "class 12 commerce",
    "AI learning",
    "adaptive quizzes",
    "business studies",
    "accountancy",
    "economics",
    "mock tests",
    "exam preparation",
    "india education",
  ],
  authors: [{ name: "PrepWyse Commerce" }],
  creator: "PrepWyse Commerce",
  publisher: "PrepWyse Commerce",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://prepwyse-commerce.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PrepWyse Commerce - AI-Powered EdTech Platform",
    description:
      "Master Commerce exams with AI-powered adaptive learning. Personalized quizzes, mock tests, and intelligent recommendations.",
    url: "https://prepwyse-commerce.com",
    siteName: "PrepWyse Commerce",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepWyse Commerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepWyse Commerce - AI-Powered EdTech Platform",
    description:
      "Master Commerce exams with AI-powered adaptive learning for Class 11, 12, and CUET.",
    images: ["/twitter-image.png"],
    creator: "@prepwyse",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = /^pk_(test|live)_[a-zA-Z0-9]{20,}$/.test(clerkPublishableKey ?? "");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appShell = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PrepWyse" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "ocean", "forest", "sunset"]}
        >
          <ErrorBoundary>
            <ToastProvider>
              <OnboardingProvider>
                <ServiceWorkerRegistration />
                <PWAInstallPrompt />
                <CookieConsent />
                {children}
                <OfflineIndicator />
              </OnboardingProvider>
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );

  if (!hasValidClerkKey) {
    return appShell;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{appShell}</ClerkProvider>;
}
