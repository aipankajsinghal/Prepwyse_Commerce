import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRedisRateLimit, webhookRateLimit } from "@/lib/middleware/redis-rateLimit";

// Clerk Webhook Event Types
type WebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, any>;
  };
};

// POST /api/webhooks/clerk - Handle Clerk webhook events
async function handler(req: NextRequest) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Clerk webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt);
        break;
      case "user.updated":
        await handleUserUpdated(evt);
        break;
      case "user.deleted":
        await handleUserDeleted(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle user.created event
async function handleUserCreated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

  const email = email_addresses?.[0]?.email_address;
  if (!email) {
    console.error("No email address found for user:", id);
    return;
  }

  const name = `${first_name || ""} ${last_name || ""}`.trim() || null;
  const grade = public_metadata?.grade as string | undefined;
  const preferredLanguage = (public_metadata?.preferredLanguage as string) || "en";

  // Create user in database
  await prisma.user.create({
    data: {
      clerkId: id,
      email,
      name,
      grade,
      preferredLanguage,
    },
  });

  console.log(`User created in database: ${email}`);
}

// Handle user.updated event
async function handleUserUpdated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

  const email = email_addresses?.[0]?.email_address;
  if (!email) {
    console.error("No email address found for user:", id);
    return;
  }

  const name = `${first_name || ""} ${last_name || ""}`.trim() || null;
  const grade = public_metadata?.grade as string | undefined;
  const preferredLanguage = public_metadata?.preferredLanguage as string | undefined;

  // Update user in database
  await prisma.user.upsert({
    where: { clerkId: id },
    update: {
      email,
      name,
      ...(grade !== undefined && { grade }),
      ...(preferredLanguage !== undefined && { preferredLanguage }),
    },
    create: {
      clerkId: id,
      email,
      name,
      grade,
      preferredLanguage: preferredLanguage || "en",
    },
  });

  console.log(`User updated in database: ${email}`);
}

// Handle user.deleted event
async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data;

  // Delete user from database (cascade will handle related records)
  await prisma.user.delete({
    where: { clerkId: id },
  });

  console.log(`User deleted from database: ${id}`);
}

// Apply rate limiting: 100 requests per 15 minutes (webhook rate limiter)
export const POST = withRedisRateLimit(handler, webhookRateLimit);
