# Deployment Guide

This comprehensive guide covers everything you need to know about deploying PrepWyse Commerce to production.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Options](#deployment-options)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Security](#security)
6. [Readiness Checklist](#readiness-checklist)

---

## 1. Quick Start

**Estimated Time**: 30-45 minutes

### Prerequisites Checklist

- [ ] **Server/VPS** with Docker installed (or Vercel/Railway account)
- [ ] **PostgreSQL Database** (local, cloud, or via docker-compose)
- [ ] **Clerk Account** with API keys
- [ ] **OpenAI Account** with API key
- [ ] **Domain Name** (optional but recommended)

### Deployment Path Selection

#### Option A: Docker on VPS (Recommended for Testing)

✅ Full control, Isolated environment, Easy to scale
⏱️ Time: 30-45 minutes

#### Option B: Vercel (Fastest for Serverless)

✅ Zero server management, Automatic scaling, Built-in CI/CD
⏱️ Time: 15-20 minutes

#### Option C: Railway (Easiest All-in-One)

✅ Includes database, Simple setup, Free tier available
⏱️ Time: 20-30 minutes

---

## 2. Deployment Options

### Environment Variables

You need to set the following environment variables in your production environment:

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

# OpenAI
OPENAI_API_KEY=sk-xxxxx
```

### Option A: Vercel Postgres

1. Go to your Vercel project
2. Navigate to Storage tab
3. Create a Postgres database
4. Copy the connection string (it will be automatically added to environment variables)

### Option B: Supabase

1. Create a new project on Supabase
2. Go to Settings > Database
3. Copy the Connection String (URI format)
4. Add it as `DATABASE_URL` in your environment variables

---

## 3. Docker Deployment

### Prerequisites on VPS

- Ubuntu 20.04+ or Debian 11+
- Minimum 2GB RAM, 2 CPU cores
- Docker 24.0+ and Docker Compose 2.0+
- Domain name pointing to your VPS

### Quick Start

1. **Clone Repository on VPS**

   ```bash
   git clone https://github.com/yourusername/Prepwyse_Commerce.git .
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Deploy with Docker Compose**

   ```bash
   docker-compose up -d
   ```

### Docker Compose Services

- **PostgreSQL**: `postgres:16-alpine` with persistent volume.
- **Next.js App**: Built from Dockerfile, auto-migrations.
- **Nginx (Optional)**: Reverse proxy with SSL termination.

### SSL/TLS Setup (Certbot)

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d your-domain.com
```

### Maintenance

- **Logs**: `docker-compose logs -f`
- **Backup**: `docker-compose exec postgres pg_dump ...`
- **Update**: `git pull && docker-compose build && docker-compose up -d`

---

## 4. CI/CD Pipeline

### Overview

The project includes two GitHub Actions workflows:
1. **CI Pipeline**: Linting, testing, building.
2. **Docker Build & Deploy**: Container builds and automatic deployment.

### CI Pipeline (`.github/workflows/ci.yml`)

- **Triggers**: Push/PR to `main` or `develop`.
- **Jobs**:
  - Linting & Type Checking
  - Security Scanning (`npm audit`, Trivy)
  - Build Verification

### Docker Build & Deploy

- **Triggers**: Push to `main` (deploy), PR (build only).
- **Jobs**:
  - Build Docker image
  - Push to GitHub Container Registry (GHCR)
  - Deploy to VPS (via SSH)

### Configuration

Set the following secrets in GitHub Repository Settings:
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `DATABASE_URL`, `OPENAI_API_KEY`

---

## 5. Security

### Authentication & Authorization

- **Clerk Integration**: Secure session management, CSRF protection.
- **Middleware**: All protected routes secured via middleware.
- **Access Control**: User data isolated by Clerk ID.

### Database Security

- **Prisma ORM**: Parameterized queries to prevent SQL injection.
- **No Raw SQL**: Unless absolutely necessary and audited.

### Environment Variables

- All secrets in environment variables.
- `.env` file in `.gitignore`.
- No hardcoded credentials.

### API Security

- Request validation on all endpoints.
- Rate limiting enabled.
- HTTPS enabled in production.

---

## 6. Readiness Checklist

### Code Quality

- [ ] ⚠️ All code changes reviewed and approved
- [ ] ⚠️ ESLint passes with no errors
- [ ] ⚠️ TypeScript type check passes (`npx tsc --noEmit`)
- [ ] ⚠️ Production build completes successfully (`npm run build`)

### Environment

- [ ] ⚠️ `.env` file created for production
- [ ] ⚠️ `DATABASE_URL` configured
- [ ] ⚠️ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` configured
- [ ] ⚠️ `OPENAI_API_KEY` configured

### Database

- [ ] ⚠️ Production database created
- [ ] ⚠️ Migrations applied (`npx prisma migrate deploy`)
- [ ] Backup strategy defined

### Security

- [ ] ⚠️ HTTPS/SSL enabled
- [ ] ⚠️ `npm audit` shows no critical vulnerabilities
- [ ] Admin routes protected

### Pre-Launch Testing

- [ ] ⚠️ Authentication works (sign-up, sign-in, sign-out)
- [ ] ⚠️ Quiz creation and taking works
- [ ] ⚠️ Mock test flow works
- [ ] ⚠️ Results page displays correctly

### Post-Deployment Verification

- [ ] ⚠️ Application accessible at production URL
- [ ] ⚠️ Health check endpoint returns healthy
- [ ] ⚠️ No 500 errors in logs

