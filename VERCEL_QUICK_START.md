# Vercel Quick Start - PrepWyse Commerce

Deploy PrepWyse Commerce to Vercel in 5 minutes!

## Prerequisites (5 minutes setup)

Before clicking deploy, have these ready:

1. **Clerk Account** (2 min)
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your **production** API keys (pk_live_*, sk_live_*)

2. **OpenAI API Key** (2 min)
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys section
   - Create a new secret key
   - Copy the key (sk-*)

3. **Database** (1 min - can be done after initial deploy)
   - Will use Vercel Postgres (easiest option)
   - Or prepare external PostgreSQL connection string

## Step 1: Deploy to Vercel

Click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faipankajsinghal%2FPrepwyse_Commerce&env=DATABASE_URL,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,OPENAI_API_KEY&envDescription=Required%20environment%20variables%20for%20PrepWyse%20Commerce&envLink=https%3A%2F%2Fgithub.com%2Faipankajsinghal%2FPrepwyse_Commerce%2Fblob%2Fmain%2FVERCEL_DEPLOYMENT.md&project-name=prepwyse-commerce&repository-name=prepwyse-commerce)

**What happens:**
1. Vercel will fork the repository to your GitHub account
2. You'll be prompted to enter environment variables
3. Vercel will deploy your application

## Step 2: Add Environment Variables

When prompted, add these variables:

### Required Variables

```bash
# Clerk Authentication (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# OpenAI API (from platform.openai.com)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Database (temporary - we'll add Vercel Postgres next)
DATABASE_URL=postgresql://temp:temp@localhost:5432/temp

# Clerk URLs (use these defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Note**: The temporary DATABASE_URL is just for the first build. We'll replace it with Vercel Postgres.

## Step 3: Add Vercel Postgres

After your first deployment:

1. Go to your project in Vercel Dashboard
2. Click **Storage** tab
3. Click **Create Database** → **Postgres**
4. Name it `prepwyse-db` (or any name)
5. Choose a region (same as your app for best performance)
6. Click **Create**
7. Vercel automatically adds `DATABASE_URL` to your environment variables
8. Click **Deploy** → **Redeploy** to apply the new database

## Step 4: Initialize Database

After Vercel Postgres is connected:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed database with sample data
npm run seed
```

### Option B: From Local Machine

```bash
# Set the production DATABASE_URL (copy from Vercel dashboard)
export DATABASE_URL="postgresql://user:pass@host.vercel-storage.com:5432/verceldb?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

## Step 5: Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your Vercel domain: `https://your-project.vercel.app`
5. In **Paths**, verify:
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`
   - Home path: `/dashboard`

## Step 6: Test Your Deployment

Visit your deployed app: `https://your-project.vercel.app`

Test these features:
- ✅ Home page loads
- ✅ Sign up creates a new account
- ✅ Sign in works
- ✅ Dashboard is accessible
- ✅ Quiz creation works
- ✅ Mock tests work

## ✅ You're Done!

Your PrepWyse Commerce application is now live on Vercel!

---

## Optional: Custom Domain

To add your own domain:

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain (e.g., `prepwyse.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)
6. Update Clerk with your custom domain

---

## Need Help?

- **Full Guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Troubleshooting**: [VERCEL_DEPLOYMENT.md#troubleshooting](./VERCEL_DEPLOYMENT.md#troubleshooting)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Clerk + Vercel**: [clerk.com/docs/deployments/deploy-to-vercel](https://clerk.com/docs/deployments/deploy-to-vercel)

---

## What's Next?

After deployment:

1. ✅ **Monitor**: Enable Vercel Analytics
2. ✅ **Secure**: Review security settings
3. ✅ **Optimize**: Enable caching and Edge functions
4. ✅ **Backup**: Set up database backups
5. ✅ **Scale**: Monitor usage and upgrade as needed

**Congratulations on deploying with Vercel! 🎉**
