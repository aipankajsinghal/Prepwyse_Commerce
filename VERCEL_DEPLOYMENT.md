# Vercel Deployment Guide for PrepWyse Commerce

This guide provides step-by-step instructions to deploy PrepWyse Commerce to Vercel, the recommended platform for Next.js applications.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Deployment (Recommended)](#quick-deployment-recommended)
3. [Manual Deployment with CLI](#manual-deployment-with-cli)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Database Setup](#database-setup)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code pushed to GitHub
3. **Clerk Account**: For authentication ([clerk.com](https://clerk.com))
4. **OpenAI or Gemini API Key**: For AI features
5. **PostgreSQL Database**: Vercel Postgres or external database

---

## Quick Deployment (Recommended)

This is the fastest way to deploy your application to Vercel.

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository: `aipankajsinghal/Prepwyse_Commerce`
5. Click **"Import"**

### Step 2: Configure Project

Vercel will auto-detect Next.js. Verify the following settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Before deploying, click **"Environment Variables"** and add the following:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Provider (at least one required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# App URL (will be auto-set, but can override)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional Variables

```bash
# Google Gemini (alternative to OpenAI)
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Razorpay (for payment features)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

# Node Environment
NODE_ENV=production
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (typically 2-5 minutes)
3. Your application will be available at: `https://your-project.vercel.app`

### Step 5: Setup Database

After successful deployment, you need to initialize the database:

#### Using Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Follow the wizard to create your database
4. Vercel will automatically add `DATABASE_URL` to your environment variables
5. Redeploy to apply the new environment variable

#### Using External Database

If using an external PostgreSQL database (Railway, Supabase, etc.):
- Ensure `DATABASE_URL` is set in environment variables
- Ensure the database is accessible from Vercel's IP addresses

#### Run Migrations

You have two options to run Prisma migrations:

**Option A: From Your Local Machine**

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npm run seed
```

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

### Step 6: Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (or create a new one for production)
3. Navigate to **"API Keys"**
4. Copy your **Production** keys (pk_live_*, sk_live_*)
5. Update environment variables in Vercel with production keys
6. In Clerk, go to **"Settings"** → **"Domains"**
7. Add your Vercel domain: `https://your-project.vercel.app`
8. Configure allowed redirect URLs:
   - Sign-in URL: `https://your-project.vercel.app/sign-in`
   - Sign-up URL: `https://your-project.vercel.app/sign-up`
   - After sign-in: `https://your-project.vercel.app/dashboard`

### Step 7: Verify Deployment

Visit your application and test:

- ✅ Home page loads
- ✅ Authentication works (sign up, sign in, sign out)
- ✅ Dashboard is accessible
- ✅ Quiz creation works
- ✅ Mock test functionality works
- ✅ AI features work (quiz generation, recommendations)

**🎉 Your application is now live on Vercel!**

---

## Manual Deployment with CLI

If you prefer using the command line:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project root
cd /path/to/Prepwyse_Commerce

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Set Environment Variables

```bash
# Set environment variables one by one
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add OPENAI_API_KEY production

# Or import from .env file
vercel env pull .env.production
```

---

## Environment Variables Setup

### Complete Environment Variables List

Here's a complete list of all environment variables you need to set in Vercel:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk publishable key | `pk_live_xxxxxxxx` |
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk secret key | `sk_live_xxxxxxxx` |
| `OPENAI_API_KEY` | ✅ Yes* | OpenAI API key | `sk-xxxxxxxx` |
| `GEMINI_API_KEY` | ⚠️ Optional | Google Gemini API key (alternative to OpenAI) | `AIxxxxxxxx` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ Yes | Sign in page path | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ Yes | Sign up page path | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ Yes | Redirect after sign in | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | ✅ Yes | Redirect after sign up | `/dashboard` |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Your app's URL | `https://your-app.vercel.app` |
| `RAZORPAY_KEY_ID` | ⚠️ Optional | Razorpay API key (for payments) | `rzp_live_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | ⚠️ Optional | Razorpay secret key | `xxxxxxxx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ⚠️ Optional | Public Razorpay key | `rzp_live_xxxxxxxx` |
| `NODE_ENV` | ✅ Auto | Node environment | `production` (auto-set by Vercel) |

\* Either `OPENAI_API_KEY` or `GEMINI_API_KEY` is required for AI features.

### How to Add Environment Variables in Vercel

**Method 1: Vercel Dashboard**

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
4. Click **"Save"**

**Method 2: Vercel CLI**

```bash
# Add a single variable
vercel env add VARIABLE_NAME production

# Remove a variable
vercel env rm VARIABLE_NAME production

# List all variables
vercel env ls
```

---

## Database Setup

### Option 1: Vercel Postgres (Recommended)

Vercel Postgres is fully managed and integrates seamlessly:

1. **Create Database**:
   - In Vercel Dashboard, go to **Storage** tab
   - Click **"Create Database"** → **"Postgres"**
   - Choose a name and region (same as your app)
   - Click **"Create"**

2. **Connect to Project**:
   - Select your project to connect
   - Vercel automatically adds `DATABASE_URL` and other connection variables

3. **Run Migrations**:
   ```bash
   # Pull environment variables
   vercel env pull .env.production
   
   # Run migrations
   npx prisma migrate deploy
   ```

4. **Seed Database** (Optional):
   ```bash
   npm run seed
   ```

### Option 2: External PostgreSQL Database

You can use any PostgreSQL provider:

**Popular Options:**
- [Railway](https://railway.app) - Easy setup, generous free tier
- [Supabase](https://supabase.com) - PostgreSQL with extras
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [ElephantSQL](https://www.elephantsql.com) - Managed PostgreSQL

**Setup Steps:**

1. Create a PostgreSQL database with your provider
2. Get the connection string (should look like):
   ```
   postgresql://username:password@host:5432/database_name
   ```
3. Add `DATABASE_URL` to Vercel environment variables
4. Ensure your database accepts connections from Vercel's IP ranges
5. Run migrations as described above

### Database Connection Considerations

- **Connection Pooling**: Vercel functions are serverless, so use connection pooling to avoid exhausting database connections
- **Connection Limits**: Ensure your database plan has enough concurrent connections
- **SSL Mode**: Most providers require SSL. If needed, append `?sslmode=require` to your `DATABASE_URL`

Example with SSL:
```
postgresql://user:password@host:5432/db?schema=public&sslmode=require
```

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

To use your own domain:

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

### 2. Clerk Domain Configuration

After setting up a custom domain:

1. Update Clerk with your production domain
2. Add the domain to allowed domains in Clerk settings
3. Update redirect URLs to use your custom domain

### 3. Monitoring and Analytics

Vercel provides built-in analytics:

1. Go to **Analytics** tab in your project
2. Enable **Web Analytics** for visitor insights
3. Enable **Speed Insights** for performance monitoring

### 4. Configure Webhooks (Optional)

If using webhooks for Clerk events:

1. In Clerk Dashboard, go to **Webhooks**
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
3. Select events to subscribe to
4. Save the webhook signing secret in Vercel environment variables

### 5. Setup Error Tracking (Recommended)

Consider integrating error tracking:

- **Sentry**: Error and performance monitoring
- **LogRocket**: Session replay and debugging
- **Vercel Logs**: Built-in log streaming

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Cannot find module '@prisma/client'"

**Solution**:
```bash
# Ensure postinstall script is in package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Issue**: Build fails with environment variable errors

**Solution**: 
- Ensure all required environment variables are set in Vercel
- Check that variable names match exactly (case-sensitive)
- Verify no typos in variable values

### Database Connection Issues

**Issue**: "Can't reach database server" error

**Solution**:
- Verify `DATABASE_URL` is correct
- Check if database accepts connections from external IPs
- Ensure SSL mode is configured if required
- Test connection from local machine first

**Issue**: "Too many database connections" error

**Solution**:
- Implement connection pooling
- Use Prisma's built-in connection pooling:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    directUrl = env("DIRECT_URL") // Optional for migrations
  }
  ```
- Consider using Vercel's pgBouncer or external pooling service

### Authentication Issues

**Issue**: "Invalid Clerk API Key" error

**Solution**:
- Ensure you're using production keys (pk_live_*, sk_live_*)
- Verify keys are correctly set in environment variables
- Check that there are no extra spaces or newlines

**Issue**: Infinite redirect loop on sign-in

**Solution**:
- Verify Clerk redirect URLs match your Vercel domain
- Check middleware.ts configuration
- Ensure `NEXT_PUBLIC_CLERK_*_URL` variables are correct

### AI Features Not Working

**Issue**: AI-generated quizzes fail

**Solution**:
- Verify `OPENAI_API_KEY` or `GEMINI_API_KEY` is set correctly
- Check API key has sufficient credits/quota
- Review API logs in OpenAI/Google dashboard
- Check Vercel function logs for specific errors

### Performance Issues

**Issue**: Slow page loads or timeouts

**Solution**:
- Enable **Edge Functions** where possible
- Optimize database queries (add indexes)
- Implement caching strategies
- Use **Vercel Edge Config** for frequently accessed data
- Enable **Image Optimization** (default in Next.js)

### Prisma Migration Issues

**Issue**: "Migration failed to apply" error

**Solution**:
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually apply migrations
npx prisma db push

# Then run
npx prisma migrate deploy
```

---

## Advanced Configuration

### 1. Vercel Configuration File (vercel.json)

The `vercel.json` file is already configured for optimal deployment. Key settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 60
    }
  }
}
```

### 2. Environment-Specific Builds

To use different configurations per environment:

```bash
# Preview deployments (from branches)
vercel env add VARIABLE_NAME preview

# Development (local)
vercel env add VARIABLE_NAME development

# Production (from main branch)
vercel env add VARIABLE_NAME production
```

### 3. Serverless Function Configuration

Optimize API routes for Vercel's serverless functions:

```typescript
// app/api/your-route/route.ts
export const runtime = 'edge'; // Use Edge runtime for faster responses
export const maxDuration = 60; // Max execution time in seconds
```

### 4. Caching Strategies

Implement caching for better performance:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

### 5. Preview Deployments

Every git push to a branch creates a preview deployment:

- Automatic URL: `https://your-app-git-branch-name.vercel.app`
- Perfect for testing before merging to production
- Each preview has its own environment variables

### 6. Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **main/master branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with comments

To disable auto-deployment:
1. Go to **Settings** → **Git**
2. Configure deployment branches

---

## Best Practices

### Security

1. ✅ Always use **production** API keys (pk_live_*, sk_live_*)
2. ✅ Never commit `.env` files
3. ✅ Enable **HTTPS only** (automatic on Vercel)
4. ✅ Use **environment variables** for all secrets
5. ✅ Enable **two-factor authentication** on Vercel
6. ✅ Regularly rotate API keys
7. ✅ Set up **Content Security Policy** headers

### Performance

1. ✅ Enable **Image Optimization** (Next.js Image component)
2. ✅ Use **Edge Functions** where appropriate
3. ✅ Implement **Incremental Static Regeneration** (ISR)
4. ✅ Add **database indexes** for frequent queries
5. ✅ Use **React Server Components** for data fetching
6. ✅ Implement proper **caching strategies**
7. ✅ Monitor with **Vercel Analytics**

### Monitoring

1. ✅ Enable **Vercel Analytics**
2. ✅ Set up **error tracking** (Sentry, etc.)
3. ✅ Monitor **database performance**
4. ✅ Set up **uptime monitoring**
5. ✅ Review **function logs** regularly
6. ✅ Track **API usage and costs** (OpenAI, Clerk)

### Maintenance

1. ✅ Keep dependencies updated
2. ✅ Regular database backups
3. ✅ Monitor and rotate API keys
4. ✅ Review and optimize function usage
5. ✅ Test preview deployments before production
6. ✅ Document any configuration changes

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk + Vercel Integration](https://clerk.com/docs/deployments/deploy-to-vercel)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## Support and Issues

If you encounter issues:

1. Check this troubleshooting guide
2. Review [Vercel Status](https://www.vercel-status.com/)
3. Check service status for Clerk, OpenAI, your database provider
4. Review Vercel function logs in your dashboard
5. Open an issue in the GitHub repository

---

## Next Steps After Deployment

1. ✅ Test all critical user flows
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Enable analytics
5. ✅ Document any production-specific configuration
6. ✅ Set up automated backups
7. ✅ Plan for scaling (database, API quotas)
8. ✅ Gather user feedback

**Congratulations on deploying PrepWyse Commerce to Vercel! 🚀**
