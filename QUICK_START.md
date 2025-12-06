# Quick Start Guide

Get PrepWyse Commerce running in minutes.

## 🐳 Option 1: Docker (Easiest - 2 minutes)

Recommended for testing. Requires Docker and Docker Compose.

```bash
# 1. Create environment file
cat > .env << 'EOF'
POSTGRES_USER=prepwyse
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=prepwyse_db

# Add your API keys here (see STEP 2 below)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
CLERK_WEBHOOK_SECRET=your_webhook_secret

OPENAI_API_KEY=your_openai_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
EOF

# 2. Start everything
docker-compose up -d

# 3. Check status
docker-compose logs -f app

# 4. Open http://localhost:3000
```

**What gets started:**
- PostgreSQL database
- Next.js application
- Automatic database migrations

**Stop everything:**
```bash
docker-compose down
```

---

## 💻 Option 2: Local Development (10 minutes)

For active development. Requires Node.js 18+, PostgreSQL, and npm.

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Edit .env.local with your keys (see STEP 2 below)

# 4. Setup database
npx prisma migrate deploy

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## 🔑 STEP 2: Getting API Keys

Before you can use the app, you need credentials from these services:

### Clerk (Authentication) - REQUIRED

1. Visit https://dashboard.clerk.com
2. Create an account or sign in
3. Create new application
4. Go to **API Keys** section
5. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
6. Go to **Webhooks** and create endpoint pointing to: `http://localhost:3000/api/webhooks/clerk`
7. Copy `CLERK_WEBHOOK_SECRET`

### OpenAI (AI Services) - REQUIRED

1. Visit https://platform.openai.com/account/api-keys
2. Create new secret key
3. Copy as `OPENAI_API_KEY`

### Razorpay (Payments) - OPTIONAL

For testing payment features:

1. Visit https://dashboard.razorpay.com
2. Login or create account
3. Go to **API Keys** in settings
4. Copy:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same as KEY_ID)

### Redis (Rate Limiting) - OPTIONAL

For production rate limiting (development works without):

1. Get free Redis at https://upstash.com
2. Create database
3. Copy URL as `REDIS_URL`

---

## ✅ Verify Setup

### Check Database Connection

```bash
# Docker
docker-compose exec postgres psql -U prepwyse -d prepwyse_db -c "SELECT 1;"

# Local PostgreSQL
psql $DATABASE_URL -c "SELECT 1;"
```

### Check API

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Check Authentication

1. Navigate to http://localhost:3000/sign-in
2. Try signing up with an email
3. Verify Clerk redirect works

---

## 🧪 Run Tests

```bash
# All tests
npm test

# Watch mode (re-run on file changes)
npm test:watch

# Coverage report
npm test:coverage
```

---

## 📊 View Database

### Docker

```bash
docker-compose exec postgres psql -U prepwyse -d prepwyse_db

# In psql shell:
\dt                  # List tables
\d "User"            # Describe User table
SELECT * FROM "User" LIMIT 5;  # View users
```

### Local PostgreSQL

```bash
psql $DATABASE_URL

# Same commands as above
```

### GUI Tools

Use any PostgreSQL GUI:
- **pgAdmin** (web)
- **DBeaver** (desktop)
- **DataGrip** (IDE)
- **VS Code Extension** (install "PostgreSQL")

**Connection details for Docker:**
- Host: `localhost`
- Port: `5435`
- User: `prepwyse`
- Password: `secure_password_here` (from .env)
- Database: `prepwyse_db`

---

## 🚀 Next Steps

### Development
1. Start with `npm run dev` or `docker-compose up`
2. Explore codebase in `/app` (Next.js pages), `/lib` (utilities)
3. Make changes and auto-reload works instantly
4. Run `npm test` to verify nothing breaks

### Testing Payment Flow
1. Use Razorpay test keys from https://razorpay.com/docs/payments/payments-guide/
2. Test card: 4111 1111 1111 1111
3. Any expiry date and CVV

### Testing AI Services
1. Quiz/Mock Test generation uses OpenAI
2. Check Sentry.io (if configured) for API usage
3. View cost tracking at `/api/admin/ai-usage` (admin only)

### Deployment
See `docs/DEPLOYMENT.md` for:
- Production deployment to Vercel
- AWS/Railway/Render deployment
- Database setup
- Monitoring setup

---

## 🆘 Troubleshooting

### "Database connection failed"

**Docker:**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Local:**
```bash
# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Verify DATABASE_URL in .env.local
```

### "API key missing"

Check `OPENAI_API_KEY` and Clerk keys are in `.env.local` (or `.env` for Docker).

```bash
# Check keys are loaded
echo $OPENAI_API_KEY
echo $CLERK_SECRET_KEY
```

### "Port 3000 already in use"

```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### "Migrations failed"

```bash
# Check migration status
npx prisma migrate status

# Resolve stuck migration
npx prisma migrate resolve --rolled-back migration_name

# Reset all (⚠️ deletes data!)
npx prisma migrate reset
```

---

## 📚 Documentation

- **Deployment**: `docs/DEPLOYMENT.md`
- **AI Usage Monitoring**: `docs/AI_USAGE_MONITORING.md`
- **Database Optimization**: `lib/db-optimizations.ts` (includes patterns)

---

## 🎯 Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production build

# Database
npx prisma migrate dev --name feature_name  # Create migration
npx prisma studio            # Open Prisma Studio GUI
npm run seed                  # Seed test data

# Testing
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report

# Code Quality
npm run lint                  # Check for errors
npm run lint --fix           # Auto-fix errors

# Docker
docker-compose up            # Start services
docker-compose down          # Stop services
docker-compose logs -f       # View logs
docker-compose restart app   # Restart app
```

---

## 🤝 Need Help?

1. Check `docs/DEPLOYMENT.md` for detailed setup
2. Check logs: `npm run dev` or `docker-compose logs -f`
3. Check Sentry for error tracking
4. Review `.env.example` for all available options

Good luck! 🚀
