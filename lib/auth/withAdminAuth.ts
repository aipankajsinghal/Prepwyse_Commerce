import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "./requireAdmin";

/**
 * Type definition for admin route handlers
 */
type AdminRouteHandler = (
  req: NextRequest,
  context: { user: any; params?: any }
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with admin authorization.
 * Automatically handles:
 * - Admin role verification
 * - Error responses for unauthorized/forbidden access
 * - Generic error handling with proper status codes
 * 
 * @param handler The route handler function to wrap
 * @returns A wrapped handler with admin authorization
 * 
 * @example
 * ```typescript
 * export const GET = withAdminAuth(async (req, { user }) => {
 *   const plans = await prisma.subscriptionPlan.findMany();
 *   return NextResponse.json({ plans }, { status: 200 });
 * });
 * ```
 */
export function withAdminAuth(
  handler: AdminRouteHandler
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    try {
      // Check admin authorization
      const authResult = await checkAdminAuth();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      // Extract user and pass to handler along with any route params
      const handlerContext = {
        user: authResult.user,
        ...(context?.params && { params: await context.params }),
      };

      // Call the actual handler
      return await handler(req, handlerContext);
    } catch (error) {
      console.error("Error in admin route:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}

/**
 * Variant for route handlers that need to access route parameters.
 * Used for dynamic routes like [id].
 * 
 * @example
 * ```typescript
 * export const GET = withAdminAuthParams(async (req, { user, params }) => {
 *   const { id } = params;
 *   const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
 *   return NextResponse.json({ plan }, { status: 200 });
 * });
 * ```
 */
export const withAdminAuthParams = withAdminAuth;
