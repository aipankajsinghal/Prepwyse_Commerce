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
│ id            │
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
