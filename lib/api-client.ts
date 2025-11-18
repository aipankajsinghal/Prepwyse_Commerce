/**
 * Enhanced API client with retry logic and error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enhanced fetch with retry logic and timeout
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData.code
        );
      }

      // Return successful response
      if (response.ok) {
        return response;
      }

      // Retry on server errors (5xx) or rate limit (429)
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        await sleep(delay);
        continue;
      }

      // Final attempt failed
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData.code
      );
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort (timeout) or network errors on final attempt
      if (attempt === retries) {
        if (error instanceof APIError) {
          throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new APIError("Request timeout", 408);
        }
        throw new APIError(
          lastError?.message || "Network error occurred",
          0,
          "NETWORK_ERROR"
        );
      }

      // Wait before retry
      const delay = retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError || new APIError("Unknown error occurred");
}

/**
 * Helper for GET requests
 */
export async function apiGet<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: "GET",
  });
  return response.json();
}

/**
 * Helper for POST requests
 */
export async function apiPost<T>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch<T>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: "DELETE",
  });
  return response.json();
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    if (error.status === 401) {
      return "You need to sign in to continue";
    }
    if (error.status === 403) {
      return "You don't have permission to perform this action";
    }
    if (error.status === 404) {
      return "The requested resource was not found";
    }
    if (error.status === 408) {
      return "Request timeout. Please check your connection and try again";
    }
    if (error.status === 429) {
      return "Too many requests. Please wait a moment and try again";
    }
    if (error.status && error.status >= 500) {
      return "Server error. Please try again later";
    }
    if (error.code === "NETWORK_ERROR") {
      return "Network error. Please check your internet connection";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
