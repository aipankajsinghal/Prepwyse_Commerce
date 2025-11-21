# Deployment Guide for PrepWyse Commerce

This consolidated deployment guide includes Quick Start instructions, full deployment steps, readiness checklist, and testing guidance. For Docker-specific instructions see `DOCKER_DEPLOYMENT.md`.

## Quick Start (local development)

Run these copy-paste commands to get a local dev instance up quickly:

```powershell
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git
cd Prepwyse_Commerce
npm install
# Create .env from .env.example and populate required keys
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000

For the full one-page quickstart see `QUICKSTART.md` (kept intentionally as a short quick reference that links here).

---

## Full Deployment Instructions

The following material is drawn from the previous `DEPLOYMENT.md` and expanded with checklists and tests.

### Prerequisites

- PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
- Clerk account and API keys
- Hosting platform (Vercel recommended for Next.js) or VPS + Docker

### Environment Variables (required)

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step-by-step

1. Set up your production Postgres and add `DATABASE_URL` to environment variables.
2. Create a Clerk application, copy publishable and secret keys, and add them to environment variables; configure redirect URLs.
3. Choose deployment platform:
   - Vercel (recommended): use `vercel link` and `vercel --prod` after adding env vars in Vercel dashboard.
   - Docker on VPS: use `docker-compose` and ensure `docker-compose.yml` is configured for production.
   - GitHub Actions auto-deploy to your registry or host.
4. Run Prisma migrations in production:
   ```powershell
   npx prisma migrate deploy
   npx prisma generate
   ```
5. Verify deployment by testing the landing page, sign-in/up, dashboard, quiz flows, and results.

---

## Readiness Checklist

This checklist consolidates the previous `DEPLOYMENT_READINESS_CHECKLIST.md`. Run through and check items prior to deployment.

(Checklist starts)

<!-- Begin pasted checklist -->

# Deployment Readiness Checklist

**Purpose**: Comprehensive checklist to ensure PrepWyse Commerce is ready for production deployment.

**Last Updated**: November 20, 2024  
**Version**: 1.0.0

---

## How to Use This Checklist

1. Review each section before deployment
2. Check off items as you complete them
3. Ensure all critical items (marked ⚠️) are completed
4. Document any items that cannot be completed with justification

---

## 1. Code Quality & Testing

### Code Review
- [ ] ⚠️ All code changes reviewed and approved
- [ ] No unresolved merge conflicts
- [ ] Code follows project conventions and style guide
- [ ] No commented-out code blocks (except for documentation)
- [ ] All TODO/FIXME comments resolved or documented

### Linting & Type Checking
- [ ] ⚠️ ESLint passes with no errors (warnings acceptable)
- [ ] ⚠️ TypeScript type check passes (`npx tsc --noEmit`)
- [ ] No unused imports or variables
- [ ] Proper error handling in all API routes

### Build Verification
- [ ] ⚠️ Production build completes successfully (`npm run build`)
- [ ] Build size is reasonable (< 100MB)
- [ ] No build warnings about missing dependencies
- [ ] All dynamic imports work correctly

### Testing
- [ ] Unit tests pass (if available)
- [ ] Integration tests pass (if available)
- [ ] Manual testing completed for critical paths
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

---

## 2. Environment Configuration

### Environment Files
- [ ] ⚠️ `.env` file created and populated for production
- [ ] `.env.example` updated with all required variables
- [ ] `.env` is in `.gitignore`
- [ ] No secrets committed to repository

### Required Environment Variables
- [ ] ⚠️ `DATABASE_URL` - PostgreSQL connection string
- [ ] ⚠️ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] ⚠️ `CLERK_SECRET_KEY` - Clerk secret key
- [ ] ⚠️ `OPENAI_API_KEY` - OpenAI API key (or GEMINI_API_KEY)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `NODE_ENV=production`

### Optional Environment Variables
- [ ] `RAZORPAY_KEY_ID` - Payment gateway (if Phase C deployed)
- [ ] `RAZORPAY_KEY_SECRET` - Payment gateway secret
- [ ] `GEMINI_API_KEY` - Alternative AI provider

### Key Validation
- [ ] Database URL is accessible from production server
- [ ] Clerk keys are for production (pk_live_*, sk_live_*)
- [ ] OpenAI/Gemini API key is valid and has sufficient credits
- [ ] All API keys tested and working

---

## 3. Database Setup

### Database Configuration
- [ ] ⚠️ Production PostgreSQL database created
- [ ] Database credentials secured
- [ ] Database accessible from production server
- [ ] Database has sufficient resources (storage, connections)
- [ ] Connection pooling configured if needed

### Schema & Migrations
- [ ] ⚠️ All Prisma migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database schema matches Prisma schema
- [ ] No pending migrations
- [ ] Migration rollback plan documented

### Database Seeding
- [ ] Decision made on seeding production data
- [ ] Seed script tested if using (`npm run seed`)
- [ ] Essential data (subjects, chapters) loaded
- [ ] Test users created if needed for initial testing

### Database Backup
- [ ] ⚠️ Backup strategy defined
- [ ] Initial backup created (if migrating data)
- [ ] Backup restoration tested
- [ ] Automated backup scheduled

---

## 4. Authentication & Security

### Clerk Setup
- [ ] ⚠️ Clerk application created for production
- [ ] Production keys configured
- [ ] Redirect URLs configured correctly
- [ ] Session settings reviewed
- [ ] Email/SMS providers configured
- [ ] Social login providers configured (if used)

### Security Configuration
- [ ] ⚠️ HTTPS/SSL enabled
- [ ] Security headers configured (Nginx/Next.js)
- [ ] CORS configured appropriately
- [ ] Rate limiting enabled on sensitive endpoints
- [ ] Environment variables not exposed to client

### Security Audit
- [ ] ⚠️ `npm audit` shows no critical vulnerabilities
- [ ] Dependencies updated to latest stable versions
- [ ] No hardcoded secrets in codebase
- [ ] API endpoints require proper authentication
- [ ] Admin routes protected with role-based access

---

## 5. Infrastructure & Deployment

### Hosting Platform
- [ ] ⚠️ Hosting platform selected (VPS, Vercel, Railway, etc.)
- [ ] Server resources adequate (2GB RAM minimum)
- [ ] Domain name configured
- [ ] DNS records updated
- [ ] SSL certificate installed

### Docker Setup (if using)
- [ ] Docker installed on server
- [ ] Docker Compose installed
- [ ] `docker-compose.yml` configured for production
- [ ] Docker images build successfully
- [ ] Container health checks configured
- [ ] Volume mounts for persistent data configured

### Server Configuration
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] SSH access secured
- [ ] Non-root user created for deployment
- [ ] Server timezone set correctly
- [ ] Log rotation configured

### CI/CD Setup (if using)
- [ ] GitHub Actions workflows configured
- [ ] Repository secrets set (VPS credentials, API keys)
- [ ] CI pipeline passes
- [ ] Auto-deployment tested on staging branch
- [ ] Deployment notifications configured

---

## 6. Monitoring & Logging

### Application Monitoring
- [ ] Health check endpoint accessible (`/api/health`)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring setup (optional)

### Logging
- [ ] Application logs accessible
- [ ] Log level set appropriately for production
- [ ] Log rotation configured
- [ ] Critical errors trigger alerts

### Metrics
- [ ] Response time monitoring
- [ ] Database query performance monitoring
- [ ] Memory and CPU usage tracking
- [ ] Disk space monitoring

---

## 7. Performance Optimization

### Next.js Optimization
- [ ] Static pages pre-rendered where possible
- [ ] Dynamic imports used for heavy components
- [ ] Images optimized (Next.js Image component)
- [ ] Fonts optimized (next/font)
- [ ] Bundle size analyzed and optimized

### Database Optimization
- [ ] Database indexes created for frequently queried fields
- [ ] Query optimization reviewed
- [ ] Connection pooling configured
- [ ] Database performance tested under load

### Caching
- [ ] Browser caching configured
- [ ] API response caching considered
- [ ] Static assets served via CDN (optional)
- [ ] Service worker for offline support (PWA)

---

## 8. Documentation

### Deployment Documentation
- [ ] Deployment steps documented
- [ ] Environment setup documented
- [ ] Rollback procedure documented
- [ ] Common issues and troubleshooting documented

### User Documentation
- [ ] User guide available (optional for MVP)
- [ ] Admin guide available
- [ ] FAQ updated
- [ ] Support contact information available

### Technical Documentation
- [ ] API documentation current
- [ ] Database schema documented
- [ ] Architecture diagrams updated
- [ ] Code comments adequate

---

## 9. Legal & Compliance

### Privacy & Terms
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Cookie consent mechanism implemented (if in EU)
- [ ] GDPR compliance reviewed (if applicable)
- [ ] DPDP Act compliance reviewed (India)

### Data Protection
- [ ] User data encryption at rest (database level)
- [ ] User data encryption in transit (HTTPS)
- [ ] Data backup and retention policy defined
- [ ] Data deletion mechanism implemented

---

## 10. Pre-Launch Testing

### Smoke Tests
- [ ] ⚠️ Home page loads correctly
- [ ] ⚠️ Authentication works (sign-up, sign-in, sign-out)
- [ ] ⚠️ Dashboard accessible for authenticated users
- [ ] ⚠️ Quiz creation and taking works end-to-end
- [ ] ⚠️ Mock test flow works
- [ ] ⚠️ Results page displays correctly
- [ ] ⚠️ Admin panel accessible (for admin users)

### User Journeys
- [ ] New user can sign up
- [ ] User can complete profile
- [ ] User can create and take a quiz
- [ ] User can take a mock test
- [ ] User can view results and analytics
- [ ] User can access recommendations
- [ ] Admin can manage users
- [ ] Admin can manage content

### Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome)

### Performance Testing
- [ ] Page load times acceptable (< 3s)
- [ ] API response times acceptable (< 1s)
- [ ] Database queries optimized
- [ ] No memory leaks detected

---

## 11. Launch Preparation

### Team Readiness
- [ ] Team notified of deployment schedule
- [ ] On-call support arranged
- [ ] Rollback plan communicated
- [ ] Support documentation ready

### Communication
- [ ] Stakeholders notified of launch
- [ ] Users notified if applicable
- [ ] Social media announcement prepared (optional)
- [ ] Status page ready (optional)

### Post-Launch Plan
- [ ] Monitoring plan for first 24 hours
- [ ] Incident response plan documented
- [ ] Schedule for post-launch review
- [ ] Plan for gathering user feedback

---

## 12. Post-Deployment Verification

### Immediate Checks (within 5 minutes)
- [ ] ⚠️ Application accessible at production URL
- [ ] ⚠️ Health check endpoint returns healthy status
- [ ] ⚠️ SSL certificate valid
- [ ] ⚠️ No 500 errors in logs
- [ ] ⚠️ Database connections established

### Short-Term Checks (within 1 hour)
- [ ] All critical user journeys working
- [ ] Error rates normal
- [ ] Performance metrics acceptable
- [ ] No unusual spikes in resource usage
- [ ] Monitoring alerts configured and working

### Medium-Term Checks (within 24 hours)
- [ ] Application stable
- [ ] No critical bugs reported
- [ ] User feedback collected
- [ ] Performance metrics analyzed
- [ ] Any issues documented and prioritized

---

## 13. Rollback Plan

### Rollback Triggers
- [ ] Critical security vulnerability discovered
- [ ] Application unavailable for > 5 minutes
- [ ] Data loss or corruption detected
- [ ] Error rate > 10%
- [ ] Performance degradation > 50%

### Rollback Procedure
- [ ] ⚠️ Rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Database rollback plan ready
- [ ] Previous deployment artifacts available
- [ ] Team trained on rollback procedure

### Post-Rollback
- [ ] Root cause analysis performed
- [ ] Fixes implemented and tested
- [ ] Redeployment plan created

---

## Testing Guide

This section merges the essential testing guidance from `DEPLOYMENT_TESTING_GUIDE.md`. Use the original file for a more detailed checklist and scripts.

<!-- Begin pasted testing guide (abridged) -->

### Pre-Deployment Testing

1. Local Build Verification

```powershell
# Install dependencies
npm ci

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Generate Prisma client
npx prisma generate

# Build
npm run build
```

2. Environment Variables Validation

Use a simple validation script or manual check to ensure required variables are present: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `OPENAI_API_KEY`.

3. Database Connection Test

```powershell
npx prisma db pull
npx prisma migrate status
npx prisma migrate deploy
```

4. Docker Build Test (if using Docker)

```powershell
docker build -t prepwyse-test:local .
docker run -d --name prepwyse-test -p 3001:3000 -e DATABASE_URL="$env:DATABASE_URL" -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -e CLERK_SECRET_KEY="$env:CLERK_SECRET_KEY" -e OPENAI_API_KEY="$env:OPENAI_API_KEY" prepwyse-test:local
```

### Deployment Verification & Post-Deployment Testing

- Run smoke tests (landing page, health endpoint, sign-in/up)
- Run functional tests for core flows: quiz creation, taking quizzes, mock tests, results, profile
- Run cross-browser checks and basic performance checks

<!-- End pasted testing guide -->

---

## Docker

Docker-specific deployment instructions are kept in `DOCKER_DEPLOYMENT.md`. This guide links to that file for compose examples, image build commands, and registry usage.

---

## Notes & Next Steps

- Keep `QUICKSTART.md` as a one-page quick reference that links to this guide.
- If you want the full, unabridged testing guide preserved separately, keep `DEPLOYMENT_TESTING_GUIDE.md` (currently present) and link to it instead of duplicating. The current `DEPLOYMENT_GUIDE.md` contains the essential elements.
