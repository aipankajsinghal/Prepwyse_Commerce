# Deployment Testing Guide

**Purpose**: Step-by-step guide for testing the PrepWyse Commerce application before and after deployment.

**Last Updated**: November 20, 2024  
**Version**: 1.0.0

---

## Table of Contents

1. [Pre-Deployment Testing](#pre-deployment-testing)
2. [Deployment Verification](#deployment-verification)
3. [Post-Deployment Testing](#post-deployment-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Testing

### 1. Local Build Verification

**Purpose**: Ensure the application builds successfully before deployment.

```bash
# Navigate to project directory
cd /home/runner/work/Prepwyse_Commerce/Prepwyse_Commerce

# Install dependencies
npm ci

# Run linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Generate Prisma Client
npx prisma generate

# Build the application
npm run build
```

**Expected Results**:
- ✅ Dependencies install without errors
- ✅ Linter passes (warnings acceptable, no errors)
- ✅ TypeScript type check passes
- ✅ Prisma Client generates successfully
- ✅ Build completes without errors
- ✅ `.next` directory created with build artifacts

### 2. Environment Variables Validation

**Purpose**: Verify all required environment variables are set.

```bash
# Create validation script
cat > /tmp/validate-env.sh << 'EOF'
#!/bin/bash

echo "🔍 Validating Environment Variables..."

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "OPENAI_API_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  Missing ${#MISSING_VARS[@]} required environment variable(s)"
  exit 1
else
  echo ""
  echo "✅ All required environment variables are set!"
  exit 0
fi
EOF

chmod +x /tmp/validate-env.sh

# Run validation (with .env loaded)
source .env && /tmp/validate-env.sh
```

**Expected Results**:
- ✅ All required environment variables present
- ✅ DATABASE_URL properly formatted
- ✅ Clerk keys start with correct prefixes (pk_*, sk_*)
- ✅ OpenAI key starts with sk-

### 3. Database Connection Test

**Purpose**: Verify database is accessible and schema is up-to-date.

```bash
# Test database connection
npx prisma db pull

# Check migration status
npx prisma migrate status

# If migrations pending, apply them
npx prisma migrate deploy
```

**Expected Results**:
- ✅ Database connection successful
- ✅ No pending migrations (or migrations applied successfully)
- ✅ Schema matches Prisma schema

### 4. Docker Build Test

**Purpose**: Ensure Docker image builds successfully.

```bash
# Build Docker image locally
docker build -t prepwyse-test:local .

# Verify image was created
docker images | grep prepwyse-test

# Test run the container (with environment variables)
docker run -d \
  --name prepwyse-test \
  -p 3001:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  -e CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  prepwyse-test:local

# Wait for container to start
sleep 10

# Check container logs
docker logs prepwyse-test

# Test health endpoint
curl http://localhost:3001/api/health

# Cleanup
docker stop prepwyse-test
docker rm prepwyse-test
docker rmi prepwyse-test:local
```

**Expected Results**:
- ✅ Docker image builds without errors
- ✅ Container starts successfully
- ✅ Health check returns 200 status
- ✅ No critical errors in logs

### 5. CI/CD Pipeline Check

**Purpose**: Verify GitHub Actions workflows pass.

```bash
# Check CI workflow status
gh workflow view "CI Pipeline"

# Check Docker build workflow status
gh workflow view "Docker Build and Deploy"

# View recent runs
gh run list --limit 5
```

**Expected Results**:
- ✅ CI Pipeline passes all checks
- ✅ Docker Build completes successfully
- ✅ No failed workflow runs

---

## Deployment Verification

### 1. Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All tests pass locally
- [ ] Environment variables configured on target server
- [ ] Database migrations tested in staging
- [ ] Backup of current production database created
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Monitoring tools ready

### 2. Deployment Methods

#### Option A: Docker Compose Deployment (Recommended)

```bash
# On VPS
cd /opt/prepwyse

# Pull latest changes
git pull origin main

# Build and start services
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Check service health
docker-compose ps
docker-compose logs -f app
```

#### Option B: GitHub Actions Auto-Deploy

```bash
# Trigger deployment by pushing to main
git push origin main

# Monitor deployment
gh run watch

# Or manually trigger
gh workflow run "Docker Build and Deploy"
```

#### Option C: Manual Docker Deployment

```bash
# Pull latest image from registry
docker pull ghcr.io/aipankajsinghal/prepwyse_commerce:latest

# Stop current container
docker stop prepwyse_app

# Start new container
docker run -d \
  --name prepwyse_app \
  --env-file .env \
  -p 3000:3000 \
  ghcr.io/aipankajsinghal/prepwyse_commerce:latest

# Verify
docker ps
docker logs -f prepwyse_app
```

### 3. Deployment Health Checks

Run these checks immediately after deployment:

```bash
# 1. Check container status
docker ps | grep prepwyse

# 2. Check health endpoint
curl http://localhost:3000/api/health

# 3. Check database connectivity
docker-compose exec app npx prisma db pull

# 4. Check logs for errors
docker-compose logs --tail=100 app | grep -i error

# 5. Verify services in docker-compose
docker-compose ps
```

**Expected Results**:
- ✅ All containers running
- ✅ Health endpoint returns status "healthy"
- ✅ Database connection successful
- ✅ No critical errors in logs
- ✅ All services show status "Up"

---

## Post-Deployment Testing

### 1. Smoke Tests

**Purpose**: Quick tests to verify critical functionality works.

#### Test 1: Landing Page
```bash
# Test landing page loads
curl -I https://your-domain.com

# Expected: HTTP 200 OK
```

#### Test 2: Health Endpoint
```bash
# Test health check
curl https://your-domain.com/api/health

# Expected: {"status":"healthy","timestamp":"...","services":{"database":"connected","api":"operational"}}
```

#### Test 3: Authentication Pages
```bash
# Test sign-in page
curl -I https://your-domain.com/sign-in

# Test sign-up page
curl -I https://your-domain.com/sign-up

# Expected: Both return HTTP 200 OK
```

#### Test 4: API Endpoints
```bash
# Test subjects API (public endpoint)
curl https://your-domain.com/api/subjects

# Expected: JSON array of subjects
```

### 2. Functional Tests

**Purpose**: Verify core features work end-to-end.

#### Manual Testing Checklist

- [ ] **Landing Page**
  - [ ] Page loads without errors
  - [ ] Navigation menu works
  - [ ] "Get Started" button works
  - [ ] Theme switcher works
  - [ ] Responsive on mobile

- [ ] **Authentication**
  - [ ] Can access sign-up page
  - [ ] Can create new account
  - [ ] Email verification works
  - [ ] Can sign in with credentials
  - [ ] Can sign out
  - [ ] Redirects work correctly

- [ ] **Dashboard**
  - [ ] Dashboard loads after sign-in
  - [ ] Stats display correctly
  - [ ] Subject cards visible
  - [ ] Recent quizzes section works
  - [ ] Recommendations section loads

- [ ] **Quiz Creation**
  - [ ] Can select subject
  - [ ] Can select chapters
  - [ ] Can set difficulty
  - [ ] Quiz generates successfully
  - [ ] Questions display correctly

- [ ] **Taking Quiz**
  - [ ] Timer works
  - [ ] Can select answers
  - [ ] Can mark for review
  - [ ] Can navigate between questions
  - [ ] Can submit quiz
  - [ ] Results page shows

- [ ] **Mock Tests**
  - [ ] Mock test list loads
  - [ ] Can start mock test
  - [ ] Full test flow works
  - [ ] Results calculate correctly

- [ ] **Results & Analytics**
  - [ ] Results page loads
  - [ ] Charts display correctly
  - [ ] Performance metrics accurate
  - [ ] Can view past attempts

- [ ] **Profile**
  - [ ] Profile page loads
  - [ ] Can view stats
  - [ ] Can update preferences
  - [ ] Avatar displays correctly

- [ ] **Admin Panel** (if admin user)
  - [ ] Admin dashboard accessible
  - [ ] User management works
  - [ ] Content management works
  - [ ] Analytics display correctly

### 3. Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (Chrome, Safari)

### 4. Responsive Design Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Performance Testing

### 1. Load Time Testing

```bash
# Test page load times
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://your-domain.com

# Test API response times
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://your-domain.com/api/health
```

**Acceptable Thresholds**:
- Landing page: < 3 seconds
- Dashboard: < 5 seconds
- API endpoints: < 1 second

### 2. Database Performance

```bash
# Check database query performance
docker-compose exec postgres psql -U prepwyse prepwyse_db -c "
SELECT 
  query, 
  calls, 
  mean_exec_time, 
  max_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
"
```

### 3. Memory and CPU Usage

```bash
# Monitor container resources
docker stats prepwyse_app --no-stream

# Check detailed resource usage
docker-compose exec app top -bn1 | head -20
```

**Acceptable Thresholds**:
- Memory usage: < 1GB under normal load
- CPU usage: < 50% under normal load

---

## Security Testing

### 1. SSL/TLS Verification

```bash
# Check SSL certificate
curl -vI https://your-domain.com 2>&1 | grep -i "ssl\|tls"

# Test SSL Labs rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

**Expected**:
- ✅ Valid SSL certificate
- ✅ HTTPS redirects work
- ✅ SSL Labs rating A or better

### 2. Security Headers

```bash
# Check security headers
curl -I https://your-domain.com | grep -i "x-frame\|x-content\|strict-transport"
```

**Expected Headers**:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`

### 3. Authentication Security

- [ ] Password requirements enforced
- [ ] Failed login attempts limited
- [ ] Session timeout works
- [ ] CSRF protection active
- [ ] XSS protection enabled

### 4. Dependency Vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Check Docker image vulnerabilities
docker scan prepwyse_app
```

**Expected**:
- ✅ No critical vulnerabilities
- ✅ No high-severity vulnerabilities

---

## Rollback Procedures

### Quick Rollback (Docker)

```bash
# List recent images
docker images | grep prepwyse

# Stop current container
docker-compose down

# Start with previous image tag
docker tag ghcr.io/aipankajsinghal/prepwyse_commerce:previous-tag \
  ghcr.io/aipankajsinghal/prepwyse_commerce:latest

# Restart services
docker-compose up -d
```

### Database Rollback

```bash
# Restore from backup
docker-compose exec -T postgres psql -U prepwyse prepwyse_db < backup_YYYYMMDD.sql

# Verify restoration
docker-compose exec postgres psql -U prepwyse prepwyse_db -c "SELECT COUNT(*) FROM \"User\";"
```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# CI/CD will auto-deploy previous version
```

---

## Monitoring Checklist

After deployment, set up continuous monitoring:

- [ ] **Uptime Monitoring**
  - Configure UptimeRobot or similar
  - Monitor /api/health endpoint
  - Alert on downtime

- [ ] **Error Tracking**
  - Review application logs daily
  - Monitor error rates
  - Set up alerts for critical errors

- [ ] **Performance Monitoring**
  - Track page load times
  - Monitor API response times
  - Track database query performance

- [ ] **Resource Monitoring**
  - Monitor CPU usage
  - Monitor memory usage
  - Monitor disk space
  - Monitor database size

- [ ] **Security Monitoring**
  - Monitor failed login attempts
  - Track suspicious activity
  - Review security logs

---

## Troubleshooting Common Issues

### Issue: Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "DATABASE|CLERK|OPENAI"

# Verify database connection
docker-compose exec app npx prisma db pull
```

### Issue: Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection string
docker-compose exec postgres psql -U prepwyse prepwyse_db -c "SELECT 1;"
```

### Issue: Health Check Fails

```bash
# Check container status
docker ps

# Check detailed health status
docker inspect prepwyse_app | grep -A 10 Health

# Test manually
curl http://localhost:3000/api/health
```

### Issue: High Memory Usage

```bash
# Restart container to clear memory
docker-compose restart app

# Check for memory leaks in logs
docker-compose logs app | grep -i "memory\|heap"

# Adjust memory limits in docker-compose.yml if needed
```

---

## Success Criteria

Deployment is considered successful when:

- ✅ All pre-deployment tests pass
- ✅ Application deploys without errors
- ✅ Health check returns "healthy" status
- ✅ All smoke tests pass
- ✅ Critical user journeys work
- ✅ Performance meets thresholds
- ✅ No security vulnerabilities
- ✅ Monitoring is active
- ✅ Team is notified of successful deployment

---

## Next Steps After Successful Deployment

1. **Monitor for 24 hours**: Watch logs and metrics closely
2. **Notify stakeholders**: Send deployment completion notification
3. **Update documentation**: Record any issues and resolutions
4. **Schedule review**: Plan post-deployment review meeting
5. **Backup**: Create fresh backup of production database
6. **Plan next deployment**: Document lessons learned

---

## Support & Resources

- **Documentation**: See DEPLOYMENT.md, DOCKER_DEPLOYMENT.md
- **CI/CD Guide**: See CI_CD_SETUP.md
- **Issue Tracker**: GitHub Issues
- **Logs**: `docker-compose logs -f app`
- **Database**: `npx prisma studio`

---

**Document Version**: 1.0.0  
**Last Reviewed**: November 20, 2024  
**Next Review**: After first production deployment
