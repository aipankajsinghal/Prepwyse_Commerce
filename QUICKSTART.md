# Quick Start Guide

Get PrepWyse Commerce running on your local machine in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- PostgreSQL database (local or cloud)
- Clerk account ([Sign up free](https://clerk.com))

## Step 1: Clone and Install (1 minute)

```bash
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git
cd Prepwyse_Commerce
npm install
```

## Step 2: Set Up Clerk (2 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys from the API Keys page
4. Note: Use test keys for development

## Step 3: Set Up Database (1 minute)

### Option A: Local PostgreSQL
```bash
# Create database
createdb prepwyse_commerce
```

### Option B: Free Cloud Database
- [Supabase](https://supabase.com) - Free tier includes PostgreSQL
- [Railway](https://railway.app) - Free tier available
- [Vercel Postgres](https://vercel.com/storage/postgres) - Free tier available

## Step 4: Configure Environment (30 seconds)

Create `.env` file in the root directory:

```env
# Database (replace with your actual connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/prepwyse_commerce"

# Clerk Keys (replace with your actual keys from dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs (these can stay as-is for local development)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Step 5: Initialize Database (30 seconds)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run seed
```

## Step 6: Start Development Server (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎉 You're All Set!

### What to Try First

1. **Create Account**: Click "Get Started" and sign up
2. **Explore Dashboard**: View the student dashboard
3. **Create Quiz**: Go to Quizzes and select chapters
4. **Try Mock Test**: Browse available mock tests
5. **View Results**: Check the results page

### Test Credentials

If you seeded the database, you can explore:
- 3 Subjects (Business Studies, Accountancy, Economics)
- 20+ Chapters across subjects
- Sample questions in Business Studies Chapter 1
- Pre-configured mock tests for CUET and Classes 11-12

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Test connection: `npx prisma db pull`

### "Clerk keys invalid"
- Verify you copied the complete keys
- Make sure you're using the correct publishable/secret key pair
- Check for extra spaces in .env file

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Build errors
- Run `npx prisma generate` to regenerate Prisma client
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

## Next Steps

1. **Add Content**: Use Prisma Studio to add more questions
   ```bash
   npx prisma studio
   ```

2. **Customize**: Edit components in `components/` and pages in `app/`

3. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

4. **Contribute**: Check [CONTRIBUTING.md](./CONTRIBUTING.md) to add features

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma db push       # Push schema without migration
npm run seed             # Seed sample data

# Code Quality
npm run lint             # Run ESLint
```

## Getting Help

- Check [README.md](./README.md) for detailed documentation
- Review [FEATURES.md](./FEATURES.md) for feature overview
- Open an issue on GitHub for bugs
- Check Next.js docs: https://nextjs.org/docs
- Check Clerk docs: https://clerk.com/docs
- Check Prisma docs: https://www.prisma.io/docs

## Pro Tips

1. **Use Prisma Studio**: Visual interface for your database
   ```bash
   npx prisma studio
   ```

2. **Hot Reload**: Code changes reflect instantly in dev mode

3. **TypeScript**: Hover over variables in VS Code for type info

4. **Tailwind**: Use Tailwind CSS IntelliSense extension in VS Code

5. **Git**: Commit often with meaningful messages

Happy coding! 🚀
