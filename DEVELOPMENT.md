# Technical Documentation

Comprehensive technical documentation for PrepWyse Commerce platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication Flow](#authentication-flow)
7. [AI Integration](#ai-integration)
8. [Frontend Architecture](#frontend-architecture)
9. [Deployment](#deployment)
10. [Development Guidelines](#development-guidelines)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Web Browser - React/Next.js with Framer Motion)          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js   │  │    Clerk     │  │    OpenAI    │      │
│  │  App Router │  │     Auth     │  │   AI Service │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Prisma ORM
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      Database Layer                          │
│                 PostgreSQL Database                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
app/
├── (landing)/
│   └── page.tsx          # Landing page
├── dashboard/
│   └── page.tsx          # Student dashboard
├── quiz/
│   └── page.tsx          # Quiz creation
├── mock-test/
│   └── page.tsx          # Mock tests
├── results/
│   └── page.tsx          # Results & analytics
├── recommendations/
│   └── page.tsx          # AI recommendations
├── profile/
│   └── page.tsx          # User profile
├── admin/
│   └── page.tsx          # Admin panel
└── api/
    ├── quiz/
    ├── subjects/
    ├── user/sync/
    └── ai/
        ├── generate-quiz/
        ├── recommendations/
        ├── explain/
        └── content-suggestions/
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.x
- **State Management**: React Hooks
- **UI Components**: Custom components with Lucide React icons
- **Theme Management**: next-themes 0.3.x

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **ORM**: Prisma 6.19
- **Database**: PostgreSQL 16+
- **Authentication**: Clerk 6.35+
- **AI Integration**: OpenAI SDK 4.x

### DevOps

- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt
- **Monitoring**: Docker logs, Prisma logging

## Project Structure

```
prepwyse-commerce/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard page
│   ├── quiz/                 # Quiz pages
│   ├── mock-test/            # Mock test pages
│   ├── results/              # Results pages
│   ├── recommendations/      # AI recommendations
│   ├── profile/              # User profile
│   ├── admin/                # Admin panel
│   ├── sign-in/              # Authentication pages
│   ├── sign-up/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/               # Reusable React components
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeSelector.tsx
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client
│   ├── openai.ts             # OpenAI client
│   └── ai-services.ts        # AI service functions
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma         # Prisma schema
│   └── seed.ts               # Database seeding
├── nginx/                    # Nginx configuration
│   └── nginx.conf
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml
│       └── docker-build.yml
├── middleware.ts             # Next.js middleware (Clerk auth)
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Docker Compose configuration
└── package.json              # Project dependencies
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │
│ clerkId     │◄────────────┐
│ email       │             │
│ name        │             │
│ grade       │             │
│ bio         │             │
│ weakAreas   │             │
│ strongAreas │             │
└─────────────┘             │
      │                     │
      │ 1:N                 │
      │                     │
┌─────▼─────────┐     ┌─────┴──────────┐
│  QuizAttempt  │     │ MockTestAttempt│
├───────────────┤     ├────────────────┤
│ id            │     │ id             │
│ userId        │     │ userId         │
│ quizId        │     │ mockTestId     │
│ score         │     │ score          │
│ answers       │     │ answers        │
│ completedAt   │     │ completedAt    │
└───────────────┘     └────────────────┘
      │                     │
      │ N:1                 │ N:1
      │                     │
┌─────▼─────────┐     ┌─────▼──────────┐
│     Quiz      │     │   MockTest     │
├───────────────┤     ├────────────────┤
│ id            │     │ id             │
│ title         │     │ name           │
│ chapters[]    │     │ pattern        │
│ questionCount │     │ sections       │
│ duration      │     │ totalQuestions │
│ difficulty    │     │ duration       │
└───────────────┘     └────────────────┘

┌─────────────┐
│   Subject   │
├─────────────┤
│ id          │
│ name        │
│ description │
└─────────────┘
      │
      │ 1:N
      │
┌─────▼─────────┐
│   Chapter     │
├───────────────┤
│ id          │
│ subjectId     │
│ name          │
│ description   │
└───────────────┘
      │
      │ 1:N
      │
┌─────▼─────────┐
│   Question    │
├───────────────┤
│ id            │
│ chapterId     │
│ questionText  │
│ options       │
│ correctAnswer │
│ explanation   │
│ difficulty    │
└───────────────┘

┌──────────────────┐
│  Recommendation  │
├──────────────────┤
│ id               │
│ userId           │
│ recommendations  │
│ priority         │
│ createdAt        │
└──────────────────┘
```

### Prisma Schema Models

#### User Model

```prisma
model User {
  id                  String   @id @default(cuid())
  clerkId             String   @unique
  email               String   @unique
  name                String?
  grade               String?
  bio                 String?
  preferredDifficulty String?  @default("Medium")
  weakAreas           Json?
  strongAreas         Json?
  learningStyle       String?
  lastRecommendation  DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  quizAttempts        QuizAttempt[]
  mockTestAttempts    MockTestAttempt[]
  recommendations     Recommendation[]
}
```

#### Subject, Chapter, Question Models

```prisma
model Subject {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  chapters    Chapter[]
}

model Chapter {
  id          String     @id @default(cuid())
  subjectId   String
  name        String
  description String?
  subject     Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  questions   Question[]
  createdAt   DateTime   @default(now())
  
  @@unique([subjectId, name])
}

model Question {
  id            String   @id @default(cuid())
  chapterId     String
  questionText  String
  options       Json
  correctAnswer String
  explanation   String?
  difficulty    String   @default("Medium")
  chapter       Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
}
```

#### Quiz and Attempt Models

```prisma
model Quiz {
  id            String        @id @default(cuid())
  title         String
  chapters      Json
  questionCount Int
  duration      Int
  difficulty    String        @default("Medium")
  isAIGenerated Boolean       @default(false)
  createdAt     DateTime      @default(now())
  attempts      QuizAttempt[]
}

model QuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  quizId      String
  score       Float
  totalQuestions Int
  answers     Json
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}
```

## API Documentation

### REST API Endpoints

#### Quiz Management

**POST /api/quiz**

- Creates a new quiz and returns questions
- Body: `{ chapterIds: string[], questionCount: number, duration: number, difficulty: string }`
- Returns: `{ quiz: Quiz, questions: Question[] }`
- Authentication: Required (Clerk)

**GET /api/subjects**

- Lists all subjects with their chapters
- Returns: `{ subjects: Subject[] }`
- Authentication: Required (Clerk)

#### AI Features

**POST /api/ai/generate-quiz**

- Generates AI-powered quiz questions
- Body: `{ subjectName: string, chapterNames: string[], questionCount: number, difficulty: string }`
- Returns: `{ quiz: Quiz, questions: Question[] }`
- Authentication: Required (Clerk)

**GET /api/ai/recommendations**

- Gets personalized study recommendations
- Query: `userId` (from auth)
- Returns: `{ recommendations: Recommendation[], weakAreas: string[], strongAreas: string[] }`
- Authentication: Required (Clerk)

**POST /api/ai/explain**

- Generates explanation for a question
- Body: `{ questionText: string, options: string[], correctAnswer: string, userAnswer: string, subject: string, chapter: string }`
- Returns: `{ explanation: string }`
- Authentication: Required (Clerk)

**GET /api/ai/content-suggestions**

- Suggests content to study next
- Query: `userId, subjectId` (optional)
- Returns: `{ suggestions: ContentSuggestion[] }`
- Authentication: Required (Clerk)

#### User Management

**POST /api/user/sync**

- Syncs Clerk user with database
- Body: Auto-populated from Clerk
- Returns: `{ user: User }`
- Authentication: Required (Clerk)

### API Response Format

#### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Rate Limiting

- General endpoints: 10 req/s per IP
- API endpoints: 30 req/s per IP
- AI endpoints: 5 req/s per user (cost control)

## Authentication Flow

### Clerk Integration

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. Visit protected route
      │
┌─────▼──────────┐
│  Middleware    │  Check auth status
└─────┬──────────┘
      │
      │ 2a. Not authenticated
      │
┌─────▼──────────┐
│  Clerk Signin  │  Redirect to login
└─────┬──────────┘
      │
      │ 2b. Authenticated
      │
┌─────▼──────────┐
│   API Route    │  Verify JWT token
└─────┬──────────┘
      │
      │ 3. Sync with DB
      │
┌─────▼──────────┐
│   /api/user/   │  Create/update user
│      sync      │
└─────┬──────────┘
      │
      │ 4. Access granted
      │
┌─────▼──────────┐
│  Protected     │  Render page
│    Route       │
└────────────────┘
```

### Middleware Configuration

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhooks"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Protected Route Example

```typescript
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Fetch user-specific data
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  
  return Response.json({ user });
}
```

## AI Integration

### OpenAI Service Architecture

```typescript
// lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### AI Service Functions

#### 1. Generate Quiz Questions

```typescript
async function generateAIQuestions({
  subjectName,
  chapterNames,
  questionCount,
  difficulty,
  userId
}: GenerateQuizParams): Promise<Question[]> {
  const prompt = `Generate ${questionCount} ${difficulty} multiple-choice questions for ${subjectName}, covering chapters: ${chapterNames.join(", ")}.
  
  Format each question as JSON:
  {
    "questionText": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "..."
  }`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert commerce educator." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });
  
  // Parse and store questions
  const questions = JSON.parse(response.choices[0].message.content);
  return await prisma.question.createMany({ data: questions });
}
```

#### 2. Adaptive Difficulty

```typescript
async function determineAdaptiveDifficulty(
  userId: string
): Promise<string> {
  // Fetch last 10 quiz attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 10,
  });
  
  if (attempts.length === 0) return "Medium";
  
  const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
  
  if (avgScore >= 80) return "Hard";
  if (avgScore >= 60) return "Medium";
  return "Easy";
}
```

#### 3. Personalized Recommendations

```typescript
async function generatePersonalizedRecommendations(
  userId: string
): Promise<Recommendation> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: { quiz: true },
  });
  
  const performanceAnalysis = analyzePerformance(attempts);
  
  const prompt = `Based on student performance:
  - Weak areas: ${performanceAnalysis.weakAreas.join(", ")}
  - Strong areas: ${performanceAnalysis.strongAreas.join(", ")}
  - Average score: ${performanceAnalysis.avgScore}%
  
  Provide 5 personalized study recommendations.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a study advisor." },
      { role: "user", content: prompt }
    ],
  });
  
  return await prisma.recommendation.create({
    data: {
      userId,
      recommendations: response.choices[0].message.content,
    },
  });
}
```

### AI Cost Optimization

- **Caching**: Store generated questions in database
- **Model Selection**: Use GPT-4o-mini for cost-effective responses
- **Rate Limiting**: Limit AI calls per user
- **Batch Processing**: Generate multiple questions in one API call
- **Fallback**: Use database questions if AI fails

## Frontend Architecture

### Component Hierarchy

```
App (RootLayout)
├── ThemeProvider
├── ClerkProvider
│   ├── Navbar
│   │   ├── ThemeSelector
│   │   └── UserButton
│   └── Page Components
│       ├── LandingPage (animated)
│       ├── Dashboard
│       ├── QuizPage
│       ├── MockTestPage
│       ├── ResultsPage
│       ├── RecommendationsPage
│       ├── ProfilePage
│       └── AdminPanel
```

### State Management

Using React Hooks for local state:

```typescript
// Example: Quiz state
const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
const [questionCount, setQuestionCount] = useState(10);
const [duration, setDuration] = useState(15);
const [difficulty, setDifficulty] = useState("Medium");
const [useAI, setUseAI] = useState(false);
```

### Animation System

Using Framer Motion for smooth animations:

```typescript
// Fade-in animation
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Stagger children animation
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Usage
<motion.div
  initial="initial"
  animate="animate"
  variants={fadeInUp}
>
  Content
</motion.div>
```

### Theme System

```typescript
// Theme configuration
const themes = ["light", "dark", "ocean", "forest", "sunset"];

// CSS variables per theme
:root {
  --foreground-rgb: 15, 23, 42;
  --background: 255, 255, 255;
}

.dark {
  --foreground-rgb: 241, 245, 249;
  --background: 15, 23, 42;
}

.ocean {
  --foreground-rgb: 224, 242, 254;
  --background: 12, 74, 110;
}
```

## Deployment

### Docker Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### Environment Configuration

```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...

# Development
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/prepwyse_dev
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: 2-space indentation
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Bug fixes
git checkout -b fix/bug-description
git commit -m "fix: resolve bug"

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: add tests
# chore: maintenance
```

### Testing Guidelines

```typescript
// Unit test example
describe('determineAdaptiveDifficulty', () => {
  it('returns Hard for avg score >= 80%', async () => {
    const difficulty = await determineAdaptiveDifficulty(mockUserId);
    expect(difficulty).toBe('Hard');
  });
});
```

### Performance Best Practices

1. **Use Server Components**: Default in Next.js 14
2. **Image Optimization**: Use `next/image`
3. **Code Splitting**: Dynamic imports for large components
4. **API Caching**: Use `cache` from React
5. **Database Indexes**: Index frequently queried fields

### Security Checklist

- ✅ Environment variables not committed
- ✅ API routes protected with authentication
- ✅ SQL injection prevented (Prisma parameterized queries)
- ✅ XSS prevented (React escaping)
- ✅ CSRF tokens (Clerk handles this)
- ✅ Rate limiting on API routes
- ✅ HTTPS enforced in production
- ✅ Security headers configured (Nginx)

## Monitoring & Debugging

### Logging

```typescript
// Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Application logging
console.log('[INFO]', 'User logged in:', userId);
console.error('[ERROR]', 'Failed to generate quiz:', error);
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

### Performance Monitoring

- **Next.js Analytics**: Enable in `next.config.js`
- **Prisma Metrics**: Monitor query performance
- **Docker Stats**: `docker stats` for resource usage
- **Nginx Logs**: Access and error logs

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node version (20+)
2. **Database Connection**: Verify DATABASE_URL format
3. **Clerk Auth Issues**: Check API keys and domains
4. **OpenAI Errors**: Verify API key and quota
5. **Docker Issues**: Check Docker daemon status

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Prisma debug
DEBUG="prisma:*" npm run dev
```

## Contributing

See CONTRIBUTING.md for detailed guidelines on:

- Code standards
- Pull request process
- Testing requirements
- Documentation updates

## License

See LICENSE file in repository.

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Maintained By**: PrepWyse Team

---

# Design System

## Overview

A distinctive, context-aware design system tailored for educational platforms serving commerce students in India. The design avoids generic "AI slop" aesthetics by prioritizing memorable typography, cohesive warm color systems, purposeful motion, and layered backgrounds while maintaining accessibility and performance.

## 1. Typography

### Philosophy

Combines modern geometric display fonts with warm, readable serif body text to create a friendly yet academic feel.

### Font Families

#### Display/Headings: Space Grotesk

- **Purpose**: Headlines, UI elements, buttons
- **Characteristics**: Modern, geometric, friendly, slightly technical
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage**: All `h1-h6` tags, navigation, buttons, labels

#### Body/Content: Crimson Pro

- **Purpose**: Body text, descriptions, articles
- **Characteristics**: Warm, readable, academic, slightly classical
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage**: Paragraphs, descriptions, explanations

### Type Scale

```css
h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.02em; }      /* 48px */
h2 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.015em; }  /* 36px */
h3 { font-size: 1.875rem; font-weight: 600; }                           /* 30px */
h4 { font-size: 1.5rem; font-weight: 600; }                             /* 24px */
h5 { font-size: 1.25rem; font-weight: 600; }                            /* 20px */
h6 { font-size: 1.125rem; font-weight: 600; }                           /* 18px */
body { font-size: 1rem; line-height: 1.7; }                             /* 16px */
```

## 2. Color System

### Philosophy

Warm, supportive colors inspired by Indian education, paper textures, and terra cotta elements. Avoids cold blues and harsh contrasts in favor of warmth and approachability.

### Core Brand Colors

#### Primary: Deep Navy

```css
--primary: 28 41 73;           /* rgb(28, 41, 73) */
```

**Usage**: Authority, trust, headers

#### Accent 1: Warm Terracotta

```css
--accent-1: 183 73 50;         /* rgb(183, 73, 50) - Main terracotta */
```

**Usage**: CTAs, highlights, primary actions

#### Accent 2: Deep Teal

```css
--accent-2: 36 119 123;        /* rgb(36, 119, 123) */
```

**Usage**: Secondary actions, info badges, complementary highlights

### Surface Colors

- **Backgrounds**: Warm off-white (`#FCFAF7`)
- **Surface**: Lighter surface for cards (`#FFFDFA`)
- **Elevated**: Pure white for elevated cards

### Dark Theme

Automatically adjusts colors for dark mode with warmer, softer tones.

## 3. Motion Design

### Philosophy

One signature motion sequence per screen with purposeful, delightful animations. CSS-first approach for performance.

### Signature Animation: Staggered Reveal

Primary page entrance animation.

### Bloom Effect (Signature CTA)

Button interaction with radial gradient bloom.

## 4. Components

### Educational Card (.edu-card)

Primary container for content blocks with shadow and hover effects.

### Buttons

- **Primary**: Terracotta background, white text, bloom effect.
- **Secondary**: Transparent background, terracotta border/text.

## 5. Accessibility

- ✅ All text meets WCAG AA (minimum 4.5:1)
- ✅ Large text meets WCAG AAA (7:1)
- ✅ Interactive elements have clear focus states
- ✅ Keyboard navigation support
- ✅ Screen reader support

---

# Contributing Guidelines

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Prepwyse_Commerce.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing

### API Routes

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement error handling
- Add authentication checks
- Validate input data

### Database

- Always use Prisma for database operations
- Create migrations for schema changes
- Add proper indexes for performance
- Use transactions for multi-step operations

## Pull Request Guidelines

### PR Title Format

- `Add: New feature description`
- `Fix: Bug description`
- `Update: Change description`
- `Refactor: Refactoring description`
- `Docs: Documentation changes`

### PR Description

Include:

- What changes were made
- Why the changes were necessary
- Any breaking changes
- Screenshots (for UI changes)
- Testing performed

---

# Local Testing Guide

## 1. Environment Setup

Ensure your local environment is correctly configured to mirror production as closely as possible.

### 1.1. Environment Variables

Check if you have a `.env` file in the root directory. If not, copy `.env.example`:

```bash
cp .env.example .env
```

**Critical Variables to Verify:**

- `DATABASE_URL`: Should point to your local PostgreSQL instance.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Use your **development** keys from Clerk.
- `OPENAI_API_KEY`: Required for AI features (Quiz generation, recommendations).

### 1.2. Install Dependencies

Ensure all dependencies are up to date:

```bash
npm install
```

## 2. Database Preparation

Start with a fresh or consistent database state.

### 2.1. Run Migrations

Apply the latest schema changes to your local database:

```bash
npx prisma migrate dev
```

### 2.2. Seed Data (Optional but Recommended)

Populate the database with initial data (Subjects, Chapters, etc.) to make testing easier:

```bash
npm run seed
```

## 3. Automated Testing

Run the existing unit and integration tests to catch regressions in core logic.

```bash
npm test
```

*Note: These tests cover API error handling, middleware, services, and validations.*

## 4. Build Verification

Simulate the production build process to ensure there are no type errors or build-time issues.

```bash
npm run build
```

If the build fails, fix the reported errors before proceeding.

## 5. Manual End-to-End (E2E) Testing

Run the application in production mode locally to test the exact artifact that will be deployed.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) and perform the following checks:

### 5.1. Authentication Flow

- [ ] **Sign Up**: Create a new account using email/password or social login.
- [ ] **Onboarding**: Complete any onboarding steps (e.g., selecting class/stream).
- [ ] **Sign Out**: Log out successfully.
- [ ] **Sign In**: Log back in with the created credentials.
- [ ] **Protected Routes**: Try accessing `/dashboard` while logged out (should redirect to sign-in).

### 5.2. Dashboard & Navigation

- [ ] **Dashboard Load**: Verify the dashboard loads without errors.
- [ ] **Theme Switching**: Toggle between Light, Dark, Ocean, Forest, and Sunset themes.
- [ ] **Responsiveness**: Resize browser to mobile view and check navigation menu.

### 5.3. Quiz Feature (AI Powered)

- [ ] **Generate Quiz**: Go to "Practice" -> "Create Quiz". Select subjects/chapters and generate.
- [ ] **Attempt Quiz**: Answer questions. Check if UI updates correctly.
- [ ] **Submit Quiz**: Submit the quiz and verify the results page loads.
- [ ] **Review**: Check if the "Review Answers" feature works.

### 5.4. Mock Tests

- [ ] **List View**: Verify available mock tests are listed.
- [ ] **Start Test**: Begin a mock test.
- [ ] **Timer**: Verify the timer is working.
- [ ] **Submission**: Submit the test and check the analysis report.

### 5.5. User Profile

- [ ] **View Profile**: Check if user details are displayed correctly.
- [ ] **Edit Profile**: Update some fields (e.g., name, bio) and save. Verify changes persist.

### 5.6. Admin Panel (If you have Admin Access)

- [ ] **Access**: Navigate to `/admin`.
- [ ] **User Management**: View list of users.
- [ ] **Content**: Check if you can view Subjects/Chapters.

---

# Project Status

## 📊 Quick Status

```
✅ Phase A: 100% Complete (Foundation: PWA, Analytics, Error Handling, Onboarding, GDPR)
✅ Phase B: 100% Complete (Engagement: Gamification, Study Planner, Flashcards, i18n)
⏳ Phase C: 60% Complete (Monetization: Backend ✅, UI ⬜)
⬜ Phase D: 0% Complete (Advanced Features: Video Lessons, Forums, Practice Papers)
✅ Phase E: 100% Complete (AI Learning: Adaptive Learning, AI Question Generation)
⬜ Phase F: 0% Complete (Coupons, Referral & Affiliate Marketing)

Overall: 72% Complete (16 of 23 major features)
```

## 🚀 Current Priority

**Focus:** Phase C UI Development

**Critical Items:**

1. Access control
2. Subscription UI
3. Admin dashboard

## 📚 Phase Documentation

- **Phase A (Foundation)**: Complete.
- **Phase B (Engagement)**: Complete.
- **Phase C (Monetization)**: Backend complete, UI pending.
- **Phase D (Advanced Features)**: Planned.
- **Phase E (AI Learning)**: Complete.
- **Phase F (Coupons & Affiliates)**: Planned.

For detailed pending items, please refer to the project management board or issue tracker.

---

# Phase F: Coupons, Referral & Affiliate Marketing System

This section outlines the implementation plan for a robust Coupon and Affiliate Marketing system, extending the existing Referral functionality.

## F.1: Database Schema Updates

**Goal:** Add support for Coupons and Affiliate tracking in the database.

### Prisma Schema Changes

1. **Create `Coupon` Model:**
   - Fields: `id` (CUID), `code` (String, Unique), `description` (String?), `discountType` (Enum: PERCENTAGE, FIXED), `discountValue` (Decimal), `maxUses` (Int?), `usedCount` (Int, default 0), `validFrom` (DateTime), `validUntil` (DateTime?), `isActive` (Boolean, default true), `createdAt`, `updatedAt`.
   - Add relation to `Transaction` (optional, to track which coupon was used).

2. **Create `Affiliate` Model:**
   - Fields: `id` (CUID), `userId` (String, Unique, relation to User), `commissionRate` (Decimal, default 10.0), `totalEarnings` (Decimal, default 0), `status` (Enum: PENDING, ACTIVE, SUSPENDED), `payoutDetails` (Json?), `createdAt`, `updatedAt`.
   - Add relation to `User`.

3. **Update `User` Model:**
   - Add `affiliateProfile` (Relation to Affiliate).

4. **Update `Transaction` Model:**
   - Add `couponId` (String?, relation to Coupon).
   - Add `affiliateId` (String?, relation to Affiliate).
   - Add `commissionAmount` (Decimal?).

5. **Run Migration:**
   ```bash
   npx prisma migrate dev --name add_coupons_and_affiliates
   ```

## F.2: Coupon System Implementation

**Goal:** Allow admins to create coupons and users to redeem them during checkout.

### Service Layer

Create `lib/services/couponService.ts`:

- `createCoupon(data)`: Admin function to generate new coupons.
- `validateCoupon(code, cartAmount)`:
  - Check if coupon exists and `isActive` is true.
  - Check `validFrom` and `validUntil`.
  - Check `maxUses` vs `usedCount`.
  - Return discount amount and final price.
- `incrementCouponUsage(id)`: Atomic increment of `usedCount`.

### API Updates

Update Subscription API (`app/api/subscription/create-order/route.ts`):
- Accept an optional `couponCode` in the request body.
- If provided, call `validateCoupon`.
- Calculate the discounted amount *before* creating the Razorpay order.
- Store the `couponId` in the transaction metadata/record.

### Admin Dashboard

- `app/admin/coupons/page.tsx`: List all coupons with stats (usage, expiry).
- `app/admin/coupons/create/page.tsx`: Form to create new coupons.

## F.3: Affiliate System Implementation

**Goal:** Allow users to become affiliates and earn commissions.

### Service Layer

Create `lib/services/affiliateService.ts`:

- `registerAffiliate(userId)`: Create an Affiliate profile for a user.
- `trackAffiliateClick(affiliateId)`: (Optional) Track link clicks.
- `processAffiliateCommission(transactionId)`:
  - Called after successful payment.
  - Check if transaction has an `affiliateId`.
  - Calculate commission based on `Affiliate.commissionRate`.
  - Update `Affiliate.totalEarnings` and create a `Payout` record.

### Referral Integration

Update `lib/referral.ts`:
- Integrate with Affiliate system: If a referrer is also an `ACTIVE` affiliate, they earn cash commission instead of just points/days.
- Update `generateReferralCode` to potentially use the Affiliate's custom slug if available.

### Affiliate Dashboard

Create `app/affiliate/page.tsx`:
- Show total earnings, commission rate, and payout history.
- Display unique affiliate link (e.g., `?ref=AFFILIATE_CODE`).
- Show list of referred users who subscribed.

## F.4: Integration & Testing

### Middleware/Tracking

- Capture `ref` query parameter from URL when a user first visits.
- Store in a cookie (`affiliate_ref`) with a 30-day expiry.
- When `create-order` is called, check for this cookie if no explicit code is provided.

### Webhooks (Razorpay)

- Ensure the payment success webhook triggers `processAffiliateCommission` and `incrementCouponUsage`.

### Testing Checklist

- [ ] Test coupon expiry and usage limits.
- [ ] Test affiliate commission calculation for different plan prices.
- [ ] Verify that a user cannot refer themselves.
- [ ] Test cookie-based affiliate tracking across sessions.
