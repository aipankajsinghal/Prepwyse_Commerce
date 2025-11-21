import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk authentication middleware (v6+ syntax)
 * Protects all routes except public ones by default
 * 
 * Public routes: Routes that don't require authentication
 */

// Define route matchers for public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/health",
  "/api/subjects",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // If not a public route, protect it
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
