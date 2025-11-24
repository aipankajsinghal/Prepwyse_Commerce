# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to automatically synchronize user data between Clerk and the Prisma database.

## Why Webhooks?

Webhooks solve the user synchronization timing issue by automatically syncing user data when events occur in Clerk (user creation, updates, or deletion). This eliminates the need for manual `/api/user/sync` calls and ensures data consistency.

## Benefits

1. **Automatic Sync**: User data is synchronized immediately upon creation
2. **No Manual Calls**: Eliminates the need for manual sync API calls
3. **Data Consistency**: Ensures Clerk and Prisma database stay in sync
4. **Better User Experience**: Users can immediately use features that rely on database queries

## Setup Steps

### 1. Get Your Webhook Secret

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url/api/webhooks/clerk`
   - **Production**: `https://your-domain.com/api/webhooks/clerk`
6. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)

### 2. Add Webhook Secret to Environment Variables

Add the webhook secret to your `.env` or `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Testing Webhooks Locally

For local development, you need to expose your local server to the internet using a tool like ngrok:

#### Using ngrok:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start your Next.js app: `npm run dev`
3. In a new terminal, start ngrok: `ngrok http 3000`
4. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)
5. In Clerk Dashboard, update your webhook endpoint URL to: `https://abc123.ngrok.io/api/webhooks/clerk`
6. Test by creating/updating a user in Clerk

### 4. Verify Webhook is Working

You can verify the webhook is working by:

1. Creating a new user via Clerk sign-up
2. Checking your application logs for: `Clerk webhook received: user.created`
3. Verifying the user exists in your database:
   ```bash
   npx prisma studio
   # Check the User table for the newly created user
   ```

### 5. Production Deployment

For production:

1. Deploy your application to your hosting provider
2. Update the webhook endpoint URL in Clerk Dashboard to your production URL
3. Ensure `CLERK_WEBHOOK_SECRET` is set in your production environment variables
4. Monitor webhook delivery in Clerk Dashboard

## Webhook Events Handled

### user.created
- Triggered when a new user signs up
- Creates user record in Prisma database with:
  - `clerkId`: Clerk user ID
  - `email`: Primary email address
  - `name`: First and last name
  - `grade`: From public metadata (if set)
  - `preferredLanguage`: From public metadata (default: "en")

### user.updated
- Triggered when user data changes in Clerk
- Updates/upserts user record in Prisma database
- Syncs name, email, grade, and preferredLanguage

### user.deleted
- Triggered when a user is deleted in Clerk
- Deletes user record from Prisma database
- Cascade deletion handles related records (quiz attempts, mock tests, etc.)

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook secret**: Ensure `CLERK_WEBHOOK_SECRET` is correctly set
2. **Verify endpoint URL**: Make sure the URL is accessible from the internet
3. **Check Clerk Dashboard**: Look at the webhook delivery logs for errors
4. **Review application logs**: Check for any error messages in your logs

### Signature Verification Failing

- Ensure you're using the correct webhook secret
- Make sure the secret starts with `whsec_`
- Verify there are no extra spaces or characters in the secret

### Database Sync Issues

- Check database connection: Ensure `DATABASE_URL` is correct
- Verify Prisma schema is up to date: Run `npx prisma generate`
- Check for duplicate clerkId constraints

## Security Considerations

1. **Always verify signatures**: The webhook route uses Svix to verify webhook signatures
2. **Use HTTPS**: Webhooks should always use HTTPS in production
3. **Keep secrets secure**: Never commit `CLERK_WEBHOOK_SECRET` to version control
4. **Monitor logs**: Regularly review webhook delivery logs in Clerk Dashboard

## Testing Webhooks

You can test webhooks manually using the Clerk Dashboard:

1. Go to **Webhooks** in Clerk Dashboard
2. Click on your endpoint
3. Click **Testing** tab
4. Select an event type (e.g., `user.created`)
5. Click **Send Test Event**
6. Check your application logs to verify receipt

## Alternative: Manual Sync API

If you cannot use webhooks (e.g., during development without ngrok), you can still use the manual sync API:

```typescript
// Call this after user signs up or when needed
await fetch('/api/user/sync', { method: 'POST' });
```

However, webhooks are the **recommended approach** for production as they provide automatic, real-time synchronization.

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Documentation](https://docs.svix.com/)
- [ngrok Documentation](https://ngrok.com/docs)
