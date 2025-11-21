# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### 1. Code Ready ✅
- [ ] All changes committed and pushed to GitHub
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Build passes locally (if possible)
- [ ] TypeScript type check passes: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`

### 2. Required Accounts ✅
- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] GitHub account connected to Vercel
- [ ] Clerk account created ([clerk.com](https://clerk.com))
- [ ] OpenAI account with API access ([platform.openai.com](https://platform.openai.com))

### 3. API Keys Ready ✅
- [ ] Clerk Publishable Key (pk_live_* for production)
- [ ] Clerk Secret Key (sk_live_* for production)
- [ ] OpenAI API Key (sk-* format)
- [ ] (Optional) Gemini API Key if using Google AI
- [ ] (Optional) Razorpay keys if using payments

## Deployment Steps

### Step 1: Import to Vercel ⚡
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "Add New..." → "Project"
- [ ] Select GitHub repository
- [ ] Repository imported successfully

### Step 2: Configure Build Settings 🔧
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: ./ (default)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 20.x

### Step 3: Environment Variables 🔐
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables
- [ ] `DATABASE_URL` (temporary: `postgresql://temp:temp@localhost:5432/temp`)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_*)
- [ ] `CLERK_SECRET_KEY` (sk_live_*)
- [ ] `OPENAI_API_KEY` (sk-*)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`

#### Optional Variables
- [ ] `GEMINI_API_KEY` (if using Google AI)
- [ ] `RAZORPAY_KEY_ID` (if using payments)
- [ ] `RAZORPAY_KEY_SECRET` (if using payments)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (if using payments)
- [ ] `NEXT_PUBLIC_APP_URL` (auto-set by Vercel)

### Step 4: First Deployment 🚀
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Deployment successful
- [ ] Note your deployment URL: https://________.vercel.app

### Step 5: Setup Vercel Postgres 🗄️
- [ ] Go to Storage tab in Vercel Dashboard
- [ ] Click "Create Database" → "Postgres"
- [ ] Name: `prepwyse-db`
- [ ] Region: Same as your app
- [ ] Click "Create"
- [ ] Connect to your project
- [ ] `DATABASE_URL` automatically added to environment variables
- [ ] Trigger redeploy to use new database

### Step 6: Initialize Database 📊
Choose one method:

**Method A: Vercel CLI (Recommended)**
```bash
# Install and login
npm install -g vercel
vercel login

# Link project and pull env vars
vercel link
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

**Method B: Local with Production URL**
```bash
# Set DATABASE_URL from Vercel
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

- [ ] Migrations completed successfully
- [ ] Database seeded (if desired)
- [ ] Database accessible from Vercel

### Step 7: Configure Clerk 🔐
- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Select your application
- [ ] Navigate to Settings → Domains
- [ ] Add Vercel domain: `https://your-project.vercel.app`
- [ ] Verify redirect URLs:
  - Sign-in: `/sign-in`
  - Sign-up: `/sign-up`
  - After sign-in: `/dashboard`
  - After sign-up: `/dashboard`
- [ ] Test authentication on Vercel deployment

## Post-Deployment Verification

### Functional Testing 🧪
- [ ] Home page loads correctly
- [ ] Sign up creates new account
- [ ] Sign in works with test account
- [ ] Sign out works
- [ ] Dashboard is accessible after login
- [ ] Quiz creation works
- [ ] AI quiz generation works
- [ ] Mock test functionality works
- [ ] Results page displays correctly
- [ ] Profile page accessible
- [ ] Theme switching works
- [ ] Mobile responsive design works

### Performance Testing ⚡
- [ ] Page load time < 3 seconds
- [ ] No console errors in browser
- [ ] Images load properly
- [ ] API routes respond quickly
- [ ] Database queries are fast

### Security Testing 🔒
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Protected routes require authentication
- [ ] Admin routes check for admin role
- [ ] API routes validate input
- [ ] No sensitive data exposed in client
- [ ] Environment variables secure

## Optional Configuration

### Custom Domain 🌐
- [ ] Domain purchased/ready
- [ ] Added to Vercel (Settings → Domains)
- [ ] DNS configured correctly
- [ ] SSL certificate issued (automatic)
- [ ] Updated Clerk with custom domain
- [ ] Tested with custom domain

### Monitoring & Analytics 📊
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Database monitoring setup

### Performance Optimization 🚀
- [ ] Edge functions enabled where appropriate
- [ ] Image optimization verified
- [ ] Caching headers configured
- [ ] Database indexes added
- [ ] API routes optimized

## Troubleshooting

### Common Issues

**Build Fails**
- [ ] Check environment variables are set correctly
- [ ] Verify all required variables present
- [ ] Check build logs in Vercel dashboard
- [ ] Ensure no syntax errors

**Database Connection Fails**
- [ ] Verify DATABASE_URL is correct
- [ ] Check database is accessible
- [ ] Ensure migrations ran successfully
- [ ] Test connection locally first

**Authentication Issues**
- [ ] Verify Clerk keys are production keys (pk_live_*, sk_live_*)
- [ ] Check Clerk domain is configured
- [ ] Ensure redirect URLs match
- [ ] Test with incognito/private browser

**AI Features Not Working**
- [ ] Verify OPENAI_API_KEY is set
- [ ] Check API key has credits
- [ ] Review function logs for errors
- [ ] Test API key with OpenAI dashboard

## Final Verification ✅

Before announcing your deployment:
- [ ] All critical features tested and working
- [ ] No errors in Vercel function logs
- [ ] Database is populated with content
- [ ] Admin panel accessible
- [ ] Performance is acceptable
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] Mobile experience tested
- [ ] Documentation updated with production URL

## Maintenance Plan 🔧

After deployment:
- [ ] Schedule regular database backups
- [ ] Monitor API usage (OpenAI, Clerk)
- [ ] Set up alerts for downtime
- [ ] Plan for scaling as users grow
- [ ] Keep dependencies updated
- [ ] Review logs regularly
- [ ] Gather user feedback

---

## Quick Reference

### Important URLs
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Project: https://vercel.com/[your-org]/[your-project]
- Clerk Dashboard: https://dashboard.clerk.com
- OpenAI Dashboard: https://platform.openai.com/account/usage

### Essential Commands
```bash
# Deploy
vercel --prod

# Pull env vars
vercel env pull

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# View logs
vercel logs
```

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Quick Start Guide](./VERCEL_QUICK_START.md)
- [Clerk + Vercel Guide](https://clerk.com/docs/deployments/deploy-to-vercel)

---

**🎉 Congratulations on deploying to Vercel!**

For detailed troubleshooting and advanced configuration, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).
