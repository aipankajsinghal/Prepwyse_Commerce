# Deployment Guide

This guide covers deploying PrepWyse Commerce for testing and production environments.

## Quick Start: Local Development

### 1. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# Database (local)
DATABASE_URL="postgresql://prepwyse:prepwyse_password@localhost:5432/prepwyse_db?schema=public"

# Clerk Authentication (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
CLERK_WEBHOOK_SECRET=your_secret

# Razorpay (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id

# OpenAI (https://platform.openai.com)
OPENAI_API_KEY=your_api_key

# Sentry (optional, https://sentry.io)
SENTRY_DSN=your_dsn

# API Usage Monitoring (optional)
API_USAGE_DAILY_LIMIT=10
API_USAGE_HOURLY_LIMIT=2
API_USAGE_MONTHLY_BUDGET=300
API_USAGE_CALLS_PER_DAY=1000

# Redis (for rate limiting - optional for local dev)
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed test data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Docker Deployment (Recommended for Testing)

### Quick Deploy with Docker Compose

```bash
# Create .env file for docker-compose
cat > .env << 'EOF'
POSTGRES_USER=prepwyse
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=prepwyse_db

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

OPENAI_API_KEY=your_openai_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
EOF

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

**What gets deployed:**
- PostgreSQL database on port 5435
- Next.js app on port 3000
- Automatic database migrations run on startup

**Verify deployment:**
```bash
# Check app health
curl http://localhost:3000/api/health

# Check database
docker-compose exec postgres psql -U prepwyse -d prepwyse_db -c "SELECT version();"
```

### Build Custom Docker Image

```bash
# Build image
docker build -t prepwyse-commerce:latest .

# Run container
docker run -d \
  --name prepwyse \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_key" \
  -e CLERK_SECRET_KEY="your_secret" \
  -e OPENAI_API_KEY="your_key" \
  prepwyse-commerce:latest

# View logs
docker logs -f prepwyse
```

---

## Production Deployment

### Option 1: Vercel (Recommended - Easiest)

#### 1. Push to GitHub

```bash
git push origin claude/production-readiness-review-01WPVs9MSq6BrkTKQq3ZR1Sm
```

#### 2. Deploy to Vercel

Visit [https://vercel.com/new](https://vercel.com/new) and:
1. Connect GitHub repository
2. Select your branch
3. Add environment variables (see `.env.example`)
4. Deploy

#### 3. Setup Database

For production, use a managed PostgreSQL service:
- **Railway**: `railway.app`
- **Supabase**: `supabase.com`
- **AWS RDS**: `aws.amazon.com/rds`
- **Render**: `render.com`

Update `DATABASE_URL` in Vercel environment variables.

#### 4. Setup Services

Required setup before deployment:

**Clerk Authentication** (https://dashboard.clerk.com)
- Create application
- Get publishable key and secret key
- Set signing key
- Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`

**Razorpay** (https://dashboard.razorpay.com)
- Get API key ID and secret
- Set webhook endpoint: `https://yourdomain.com/api/webhooks/razorpay`

**OpenAI** (https://platform.openai.com)
- Get API key from dashboard
- Set usage limits in Vercel environment

**Sentry** (Optional) (https://sentry.io)
- Create project
- Get DSN
- Errors will be automatically captured

#### 5. Run Migrations

```bash
# SSH into Vercel (via Railway/Supabase admin, or run locally then verify)
npm run build
npx prisma migrate deploy
```

**Vercel doesn't support SSH**, so migrations need to run:
1. Before first deployment (test locally)
2. Via database admin console
3. Or automated in CI/CD pipeline

### Option 2: Docker on Cloud (Railway, Render, Heroku)

#### Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub
3. Select this repository
4. Add PostgreSQL plugin
5. Add environment variables
6. Deploy

```bash
# Check deployment status
railway status

# View logs
railway logs
```

#### Deploy to Render

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
5. Add environment variables
6. Deploy

#### Deploy to AWS ECS/Fargate

```bash
# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker tag prepwyse-commerce:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/prepwyse:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/prepwyse:latest

# Create ECS task definition, service, cluster as needed
# Use AWS Console or Terraform
```

### Option 3: Kubernetes

```bash
# Create namespace
kubectl create namespace prepwyse

# Create secrets for environment variables
kubectl create secret generic prepwyse-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=CLERK_SECRET_KEY="..." \
  -n prepwyse

# Deploy
kubectl apply -f k8s-deployment.yaml -n prepwyse

# Check status
kubectl get pods -n prepwyse
kubectl logs -f deployment/prepwyse -n prepwyse
```

---

## Environment Checklist

Before deploying, ensure you have credentials for:

- [ ] **Clerk** (Authentication)
  - Publishable Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Secret Key: `CLERK_SECRET_KEY`
  - Webhook Secret: `CLERK_WEBHOOK_SECRET`

- [ ] **Razorpay** (Payment Processing)
  - Key ID: `RAZORPAY_KEY_ID`
  - Key Secret: `RAZORPAY_KEY_SECRET`
  - Public Key: `NEXT_PUBLIC_RAZORPAY_KEY_ID`

- [ ] **OpenAI** (AI Services)
  - API Key: `OPENAI_API_KEY`
  - Budget: `API_USAGE_MONTHLY_BUDGET`

- [ ] **PostgreSQL** (Database)
  - Connection URL: `DATABASE_URL`
  - Format: `postgresql://user:password@host:port/dbname?schema=public`

- [ ] **Redis** (Rate Limiting - Optional)
  - URL: `REDIS_URL`
  - Format: `redis://host:port` or `https://user:pass@endpoint.upstash.io`

- [ ] **Sentry** (Error Tracking - Optional)
  - DSN: `SENTRY_DSN`

---

## Pre-Deployment Testing

### 1. Run Tests

```bash
npm run test
npm run test:coverage
```

### 2. Lint Code

```bash
npm run lint
```

### 3. Build Locally

```bash
npm run build
```

### 4. Test Production Build

```bash
npm run build
npm start
# Visit http://localhost:3000
```

### 5. Docker Build Test

```bash
docker build -t prepwyse:test .
docker run -p 3000:3000 -e DATABASE_URL="..." prepwyse:test
```

---

## Database Migrations

### Apply Migrations

```bash
# For development
npm run dev  # Migrations run automatically with Prisma

# For production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Create New Migration

```bash
# After updating schema.prisma:
npx prisma migrate dev --name description_of_change

# Generate migration without applying
npx prisma migrate resolve --rolled-back migration_name
```

### Rollback Migration (if needed)

```bash
# WARNING: This rolls back data!
npx prisma migrate resolve --rolled-back add_api_usage_tracking
```

---

## Health Checks

### API Health Endpoint

All deployments should expose:

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-06T12:00:00Z",
  "database": "connected"
}
```

### Docker Health Check

Dockerfile includes automatic health checks:
```bash
docker inspect prepwyse_app | grep -A 5 "Health"
```

### Vercel Health

```bash
curl https://yourdomain.com/api/health
```

---

## Performance Optimization

### Enable Caching

```bash
# In next.config.js, already configured:
# - Image optimization with AVIF/WebP
# - Gzip compression
# - Security headers with cache-control
```

### Monitor Performance

1. **Vercel Analytics**: Built-in at vercel.com
2. **Sentry Performance**: Enable in sentry.config.ts
3. **OpenTelemetry**: Can be added via instrumentation.ts

### Database Optimization

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM "User" WHERE id = 'user-123';

-- Check indexes
SELECT * FROM pg_stat_user_indexes;

-- Monitor slow queries
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Monitoring & Logs

### Sentry Error Tracking

- Errors automatically sent to `SENTRY_DSN`
- View at sentry.io dashboard
- Alerts configured in project settings

### Application Logs

**Local:**
```bash
npm run dev  # Logs to console
```

**Docker:**
```bash
docker-compose logs -f app
```

**Vercel:**
- View in vercel.com dashboard under "Deployments"
- Real-time logs in "Functions" tab

**Production:**
```bash
# Recommend shipping to log aggregation service:
# - CloudWatch (AWS)
# - Datadog
# - LogRocket
# - Papertrail
```

---

## Scaling Considerations

### Database

- Currently configured for single PostgreSQL instance
- For high traffic, consider:
  - Read replicas
  - Connection pooling (PgBouncer)
  - Automated backups
  - Point-in-time recovery

### Application

- Stateless design supports horizontal scaling
- Use load balancer in front
- Session data stored in database (not in-memory)

### Caching

Add Redis caching for:
- Quiz results
- User profiles
- Subscription data
- AI generation results

```typescript
// Example cache usage
const cacheKey = `quiz:${quizId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

---

## Security Checklist

- [ ] All environment variables set (no defaults in code)
- [ ] HTTPS enabled (Vercel auto-enables)
- [ ] Database credentials secured
- [ ] API keys rotated regularly
- [ ] Database backups enabled
- [ ] Rate limiting enabled (Redis configured)
- [ ] CORS properly configured
- [ ] CSP headers set (done in next.config.js)
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS protection enabled (CSP headers)
- [ ] CSRF protection enabled (Next.js built-in)

---

## Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Verify connection locally
psql $DATABASE_URL -c "SELECT 1;"

# Check network connectivity
nc -zv host port
```

### Migrations Not Running

```bash
# Check migration status
npx prisma migrate status

# Reset migrations (CAUTION: deletes data!)
npx prisma migrate reset

# Apply specific migration
npx prisma migrate deploy
```

### API Key Errors

```bash
# Test Clerk
curl -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  https://api.clerk.com/v1/users

# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Razorpay
curl -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET" \
  https://api.razorpay.com/v1/payments
```

### High CPU Usage

```bash
# Check running processes
docker top prepwyse_app

# Monitor CPU/Memory
docker stats prepwyse_app

# Check Node.js memory usage
node --max-old-space-size=2048 server.js
```

### Database Slow Queries

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- View logs
SELECT query, mean_exec_time FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC;
```

---

## Next Steps

1. ✅ Complete production readiness review tasks
2. 🧪 Test locally with `npm run dev`
3. 🐳 Test with Docker: `docker-compose up`
4. 📤 Deploy to staging/testing environment
5. ✔️ Run full test suite
6. 🚀 Deploy to production
7. 📊 Monitor with Sentry and Vercel
8. 🔄 Setup CI/CD pipeline (see CI_CD.md)

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Docker Docs**: https://docs.docker.com
