# Deployment Quick Start Guide

**Purpose**: Fast track guide to deploy PrepWyse Commerce for testing.

**Estimated Time**: 30-45 minutes

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Server/VPS** with Docker installed (or Vercel/Railway account)
- [ ] **PostgreSQL Database** (local, cloud, or via docker-compose)
- [ ] **Clerk Account** with API keys
- [ ] **OpenAI Account** with API key
- [ ] **Domain Name** (optional but recommended)

---

## Deployment Path Selection

Choose your deployment method:

### Option A: Docker on VPS (Recommended for Testing)
✅ Full control  
✅ Isolated environment  
✅ Easy to scale  
⏱️ Time: 30-45 minutes

**→ Go to [Section 1: Docker Deployment](#section-1-docker-deployment)**

### Option B: Vercel (Fastest for Serverless)
✅ Zero server management  
✅ Automatic scaling  
✅ Built-in CI/CD  
⏱️ Time: 15-20 minutes

**→ Go to [Section 2: Vercel Deployment](#section-2-vercel-deployment)**

### Option C: Railway (Easiest All-in-One)
✅ Includes database  
✅ Simple setup  
✅ Free tier available  
⏱️ Time: 20-30 minutes

**→ Go to [Section 3: Railway Deployment](#section-3-railway-deployment)**

---

## Section 1: Docker Deployment

### Step 1: Prepare VPS (5 minutes)

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group
exit
ssh user@your-vps-ip

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone Repository (2 minutes)

```bash
# Create application directory
sudo mkdir -p /opt/prepwyse
sudo chown $USER:$USER /opt/prepwyse
cd /opt/prepwyse

# Clone repository
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git .
```

### Step 3: Configure Environment (5 minutes)

```bash
# Create .env file
cp .env.example .env
nano .env
```

**Add your credentials:**

```env
# Database (leave as-is for docker-compose)
POSTGRES_USER=prepwyse
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
POSTGRES_DB=prepwyse_db
DATABASE_URL=postgresql://prepwyse:YOUR_STRONG_PASSWORD_HERE@postgres:5432/prepwyse_db?schema=public

# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI (get from https://platform.openai.com)
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://your-vps-ip:3000
```

**Save and exit** (Ctrl+X, Y, Enter)

### Step 4: Deploy with Docker Compose (10 minutes)

```bash
# Build and start services
docker-compose up -d

# This will:
# 1. Build the Next.js application (5-7 minutes)
# 2. Start PostgreSQL database
# 3. Start the application
# 4. Run database migrations

# Monitor the build progress
docker-compose logs -f app

# Wait until you see: "Ready on http://0.0.0.0:3000"
# Press Ctrl+C to exit logs (containers keep running)
```

### Step 5: Verify Deployment (3 minutes)

```bash
# Check all services are running
docker-compose ps

# Test health endpoint
curl http://localhost:3000/api/health

# Expected output:
# {"status":"healthy","timestamp":"...","services":{"database":"connected","api":"operational"}}

# Run automated smoke tests
./scripts/test-deployment.sh http://localhost:3000
```

### Step 6: Seed Database (Optional, 2 minutes)

```bash
# Add sample subjects, chapters, and questions
docker-compose exec app npm run seed

# This creates:
# - 3 subjects (Business Studies, Accountancy, Economics)
# - 20+ chapters
# - Sample questions
# - Pre-configured mock tests
```

### Step 7: Configure Firewall (2 minutes)

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # Keep SSH open!
sudo ufw enable
sudo ufw status
```

### Step 8: Access Your Application

Open browser and navigate to:
```
http://your-vps-ip:3000
```

**✅ Docker Deployment Complete!**

**Next steps:**
- Configure SSL/TLS (see DOCKER_DEPLOYMENT.md)
- Set up Nginx reverse proxy (optional)
- Configure domain name
- Set up monitoring

---

## Section 2: Vercel Deployment

### Step 1: Install Vercel CLI (2 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Set Up Database (5 minutes)

**Option A: Vercel Postgres**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Storage → Create Database
3. Choose Postgres
4. Copy connection string

**Option B: Supabase**
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (URI format)

### Step 3: Configure Environment (3 minutes)

```bash
# Clone repository locally
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git
cd Prepwyse_Commerce

# Link to Vercel project
vercel link

# Add environment variables
vercel env add DATABASE_URL
# Paste your database URL

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Paste your Clerk public key

vercel env add CLERK_SECRET_KEY
# Paste your Clerk secret key

vercel env add OPENAI_API_KEY
# Paste your OpenAI API key
```

### Step 4: Run Migrations (2 minutes)

```bash
# Install dependencies
npm install

# Run migrations
DATABASE_URL="your_database_url" npx prisma migrate deploy

# Seed database (optional)
DATABASE_URL="your_database_url" npm run seed
```

### Step 5: Deploy (5 minutes)

```bash
# Deploy to production
vercel --prod

# Vercel will:
# 1. Build your application
# 2. Deploy to global CDN
# 3. Provide you with a URL

# Example output:
# ✅ Production: https://prepwyse-commerce.vercel.app
```

### Step 6: Verify Deployment (2 minutes)

```bash
# Test deployment
./scripts/test-deployment.sh https://prepwyse-commerce.vercel.app

# Or manually visit:
open https://prepwyse-commerce.vercel.app
```

**✅ Vercel Deployment Complete!**

**Next steps:**
- Configure custom domain
- Set up monitoring
- Review Vercel logs and analytics

---

## Section 3: Railway Deployment

### Step 1: Create Railway Account (2 minutes)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 2: Deploy from GitHub (10 minutes)

1. Click "Deploy from GitHub repo"
2. Select your PrepWyse_Commerce repository
3. Railway will auto-detect Next.js

### Step 3: Add PostgreSQL Database (2 minutes)

1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway creates database automatically
4. Copy `DATABASE_URL` from Variables tab

### Step 4: Configure Environment Variables (5 minutes)

In Railway dashboard, go to your app → Variables:

```
DATABASE_URL=postgresql://...  (automatically set by Railway)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### Step 5: Run Migrations (3 minutes)

Railway doesn't auto-run migrations, so we need to do it manually:

```bash
# Option A: Local CLI
railway login
railway link
railway run npx prisma migrate deploy

# Option B: Add to package.json build script
# Edit package.json:
"build": "npx prisma migrate deploy && next build"
```

### Step 6: Deploy & Verify (5 minutes)

1. Railway auto-deploys on push
2. Wait for deployment to complete
3. Click "Open App" to view your site
4. Test with smoke tests:

```bash
# Get your Railway URL from dashboard
./scripts/test-deployment.sh https://prepwyse-commerce.up.railway.app
```

**✅ Railway Deployment Complete!**

**Next steps:**
- Configure custom domain
- Set up monitoring
- Review Railway logs

---

## Post-Deployment Testing

### Automated Tests

Run the comprehensive smoke test suite:

```bash
# For any deployment method
./scripts/test-deployment.sh YOUR_DEPLOYMENT_URL
```

### Manual Testing Checklist

- [ ] **Landing page** loads correctly
- [ ] **Sign up** flow works
- [ ] **Sign in** flow works
- [ ] **Dashboard** accessible after login
- [ ] **Create quiz** - select chapters and generate
- [ ] **Take quiz** - answer questions and submit
- [ ] **View results** - see scores and analytics
- [ ] **Mock test** - start and complete test
- [ ] **Profile page** loads
- [ ] **Theme switcher** works
- [ ] **Mobile responsive** - test on phone

---

## Troubleshooting

### Issue: Database Connection Failed

**Docker:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Vercel/Railway:**
```bash
# Verify DATABASE_URL is correct
# Format: postgresql://user:password@host:5432/database

# Test connection locally
npx prisma db pull
```

### Issue: Build Failed

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build

# Docker: Rebuild with no cache
docker-compose build --no-cache
```

### Issue: Application Won't Start

**Docker:**
```bash
# View detailed logs
docker-compose logs --tail=100 app

# Check for port conflicts
sudo lsof -i :3000

# Restart application
docker-compose restart app
```

### Issue: 500 Internal Server Error

```bash
# Check environment variables are set
docker-compose exec app env | grep -E "DATABASE|CLERK|OPENAI"

# Check application logs
docker-compose logs app | grep -i error
```

### Issue: Authentication Not Working

1. Verify Clerk keys are correct (pk_live_*, sk_live_*)
2. Check Clerk dashboard for your domain
3. Update redirect URLs in Clerk:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`

---

## Quick Reference Commands

### Docker Commands
```bash
# View logs
docker-compose logs -f app

# Restart service
docker-compose restart app

# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed

# Access PostgreSQL
docker-compose exec postgres psql -U prepwyse prepwyse_db
```

### Vercel Commands
```bash
# View logs
vercel logs

# List deployments
vercel ls

# Redeploy
vercel --prod

# Open in browser
vercel open
```

### Railway Commands
```bash
# Login
railway login

# View logs
railway logs

# Run command in production
railway run [command]

# Open app
railway open
```

---

## Security Reminders

- [ ] Change default database password
- [ ] Use production Clerk keys (not test keys)
- [ ] Keep API keys secure (never commit to git)
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Regular security updates

---

## Support & Resources

**Documentation:**
- [Full Deployment Guide](./DEPLOYMENT.md)
- [Docker Guide](./DOCKER_DEPLOYMENT.md)
- [CI/CD Setup](./CI_CD_SETUP.md)
- [Testing Guide](./DEPLOYMENT_TESTING_GUIDE.md)

**External Resources:**
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Clerk Setup Guide](https://clerk.com/docs)
- [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)

**Community:**
- GitHub Issues for bug reports
- Discussions for questions

---

**Success! 🎉**

Your PrepWyse Commerce application is now deployed and ready for testing!

**Next Steps:**
1. Share the URL with your team
2. Conduct thorough testing
3. Gather feedback
4. Monitor performance
5. Plan next release

---

**Document Version**: 1.0.0  
**Last Updated**: November 20, 2024
