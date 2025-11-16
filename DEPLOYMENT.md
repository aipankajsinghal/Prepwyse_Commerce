# Deployment Guide for PrepWyse Commerce

This guide will help you deploy the PrepWyse Commerce application to production.

## Prerequisites

Before deploying, ensure you have:

1. A PostgreSQL database (e.g., from Vercel Postgres, Supabase, or Railway)
2. A Clerk account with API keys
3. A hosting platform account (Vercel recommended for Next.js)

## Environment Variables

You need to set the following environment variables in your production environment:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Clerk URLs (adjust based on your domain)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Step-by-Step Deployment

### 1. Set Up Database

#### Option A: Vercel Postgres
1. Go to your Vercel project
2. Navigate to Storage tab
3. Create a Postgres database
4. Copy the connection string (it will be automatically added to environment variables)

#### Option B: Supabase
1. Create a new project on Supabase
2. Go to Settings > Database
3. Copy the Connection String (URI format)
4. Add it as `DATABASE_URL` in your environment variables

#### Option C: Railway
1. Create a new PostgreSQL database on Railway
2. Copy the connection string
3. Add it as `DATABASE_URL` in your environment variables

### 2. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use an existing one
3. Go to API Keys section
4. Copy your Publishable Key and Secret Key
5. Add them to your environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
6. Configure the redirect URLs in Clerk settings to match your domain

### 3. Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Set environment variables**:
   - Go to your project on Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all required variables listed above

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### 4. Run Database Migrations

After deploying, you need to set up the database schema:

1. From your local machine, with the production DATABASE_URL:
   ```bash
   npx prisma migrate deploy
   ```

2. Generate Prisma Client (this happens automatically during build):
   ```bash
   npx prisma generate
   ```

3. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

### 5. Verify Deployment

1. Visit your deployed URL
2. Test the following:
   - Landing page loads correctly
   - Sign up/Sign in works
   - Dashboard is accessible after authentication
   - Quiz creation interface loads
   - Mock test page displays correctly
   - Results page is accessible

## Alternative Deployment Options

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add all environment variables in Netlify dashboard
5. Deploy

### Deploy to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect Next.js
4. Add environment variables
5. Deploy

### Deploy to AWS Amplify

1. Connect your GitHub repository
2. Set build settings for Next.js
3. Add environment variables
4. Deploy

## Post-Deployment

### Monitor Your Application

1. Set up error tracking (e.g., Sentry)
2. Monitor database performance
3. Set up uptime monitoring
4. Review logs regularly

### Performance Optimization

1. Enable caching in your hosting platform
2. Set up a CDN for static assets
3. Monitor and optimize database queries
4. Consider implementing Redis for session storage

### Security Checklist

- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] Database has proper access controls
- [ ] Clerk authentication is properly configured
- [ ] CORS is configured if needed
- [ ] Rate limiting is in place for API routes

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Ensure DATABASE_URL is accessible
- Verify Clerk keys are valid
- Check build logs for specific errors

### Authentication Not Working

- Verify Clerk keys are correct
- Check that redirect URLs match your domain
- Ensure middleware is properly configured
- Check browser console for errors

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check that database is accessible from your hosting platform
- Ensure migrations have been run
- Check database logs

## Maintenance

### Regular Tasks

1. **Update dependencies**: Run `npm update` regularly
2. **Database backups**: Set up automatic backups
3. **Monitor usage**: Track user activity and system performance
4. **Security updates**: Keep all packages updated

### Scaling Considerations

As your user base grows:

1. Upgrade database plan if needed
2. Consider implementing caching (Redis)
3. Optimize database queries
4. Use database connection pooling
5. Consider implementing a queue system for heavy operations

## Support

For issues during deployment:
- Check Next.js documentation: https://nextjs.org/docs
- Clerk documentation: https://clerk.com/docs
- Prisma documentation: https://www.prisma.io/docs
- Open an issue on the GitHub repository
