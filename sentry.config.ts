/**
 * Sentry Configuration
 *
 * Configures Sentry error tracking and performance monitoring for production.
 * Set SENTRY_DSN environment variable to enable error tracking.
 */

import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN;
const environment = process.env.NODE_ENV || "development";

// Only initialize Sentry if DSN is configured
if (sentryDsn) {
  Sentry.init({
    // Set DSN and tracesSampleRate
    dsn: sentryDsn,

    // Environment
    environment,

    // Performance Monitoring: sample 20% of transactions in production, 100% in development
    tracesSampleRate:
      environment === "production" ? 0.2 : environment === "development" ? 1.0 : 0.1,

    // Set `tracePropagationTargets` to control what URLs distributed tracing should be enabled for
    tracePropagationTargets: [
      "localhost",
      /^\//,
      // regex to match all URLs that start with your server URL
      /^https:\/\/(.*\.)?example\.com\/api/,
    ],

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Ignore specific errors
    ignoreErrors: [
      // Network errors often outside our control
      "NetworkError",
      "Failed to fetch",
      "ECONNABORTED",
      // Browser extensions
      "top.GLOBALS",
    ],

    // Deny URLs for errors not from our application
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      /^ms-browser-extension:\/\//i,
    ],

    beforeSend(event, hint) {
      // Don't send transaction errors to Sentry (too noisy)
      if (event.type === "transaction") {
        return event;
      }

      // Don't send 4xx client errors (not our responsibility)
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Filter out common client-side errors
          if (error.message.includes("404") || error.message.includes("401")) {
            return null;
          }
        }
      }

      return event;
    },
  });
}

export default Sentry;
