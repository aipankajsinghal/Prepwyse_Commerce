/**
 * Performance Monitoring Middleware
 * 
 * Tracks API response times and database query performance.
 * Provides insights for optimization opportunities.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export interface PerformanceMetrics {
  route: string;
  method: string;
  responseTime: number;
  timestamp: number;
  statusCode: number;
  queryCount?: number;
  cacheHit?: boolean;
}

// In-memory store for performance metrics (last 1000 requests)
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Add metrics to the store
 */
function addMetrics(metrics: PerformanceMetrics): void {
  metricsStore.push(metrics);
  
  // Keep only the last MAX_METRICS entries
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift();
  }
}

/**
 * Get performance statistics for a route
 */
export function getRoutePerformance(route: string): {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalRequests: number;
  slowRequests: number; // > 1s
} {
  const routeMetrics = metricsStore.filter(m => m.route === route);
  
  if (routeMetrics.length === 0) {
    return {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalRequests: 0,
      slowRequests: 0,
    };
  }

  const responseTimes = routeMetrics.map(m => m.responseTime);
  const slowRequests = routeMetrics.filter(m => m.responseTime > 1000).length;

  return {
    avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    totalRequests: routeMetrics.length,
    slowRequests,
  };
}

/**
 * Get overall performance statistics
 */
export function getOverallPerformance(): {
  totalRequests: number;
  avgResponseTime: number;
  slowRoutes: Array<{ route: string; avgTime: number }>;
  errorRate: number;
} {
  if (metricsStore.length === 0) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      slowRoutes: [],
      errorRate: 0,
    };
  }

  const totalRequests = metricsStore.length;
  const avgResponseTime =
    metricsStore.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;

  // Group by route and calculate average
  const routeStats = new Map<string, number[]>();
  metricsStore.forEach(m => {
    if (!routeStats.has(m.route)) {
      routeStats.set(m.route, []);
    }
    routeStats.get(m.route)!.push(m.responseTime);
  });

  // Find slow routes (avg > 500ms)
  const slowRoutes = Array.from(routeStats.entries())
    .map(([route, times]) => ({
      route,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
    }))
    .filter(r => r.avgTime > 500)
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 10);

  // Calculate error rate (5xx responses)
  const errorCount = metricsStore.filter(m => m.statusCode >= 500).length;
  const errorRate = (errorCount / totalRequests) * 100;

  return {
    totalRequests,
    avgResponseTime,
    slowRoutes,
    errorRate,
  };
}

/**
 * Clear metrics store (useful for testing)
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}

/**
 * Performance monitoring middleware
 * 
 * @example
 * ```typescript
 * import { withPerformanceMonitoring } from '@/lib/middleware/performance';
 * 
 * export const GET = withPerformanceMonitoring(async (req) => {
 *   // Handler implementation
 *   return NextResponse.json({ data: 'result' });
 * });
 * ```
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();
    const route = req.nextUrl.pathname;

    try {
      // Call the handler
      const response = await handler(req, context);
      const responseTime = Date.now() - startTime;

      // Record metrics
      const metrics: PerformanceMetrics = {
        route,
        method: req.method,
        responseTime,
        timestamp: Date.now(),
        statusCode: response.status,
      };

      addMetrics(metrics);

      // Warn on slow requests
      if (responseTime > 1000) {
        logger.warn("Slow API Response", {
          route,
          method: req.method,
          responseTime,
          statusCode: response.status,
        });
      }

      // Add performance headers
      response.headers.set("X-Response-Time", `${responseTime}ms`);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error metrics
      const metrics: PerformanceMetrics = {
        route,
        method: req.method,
        responseTime,
        timestamp: Date.now(),
        statusCode: 500,
      };

      addMetrics(metrics);

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Combined middleware with logging and performance monitoring
 * 
 * @example
 * ```typescript
 * import { withMonitoring } from '@/lib/middleware/performance';
 * 
 * export const GET = withMonitoring(async (req) => {
 *   // Handler implementation
 * });
 * ```
 */
export function withMonitoring(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return withPerformanceMonitoring(handler);
}
