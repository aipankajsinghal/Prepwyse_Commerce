# Copilot Instructions for PrepWyse Commerce

## Project Overview

PrepWyse Commerce is an enterprise-grade, AI-powered EdTech platform designed for commerce students preparing for Class 11, Class 12, and CUET Commerce exams in India. The platform features intelligent adaptive learning, comprehensive mock tests, AI-generated quizzes, and personalized recommendations.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.9+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.x
- **Icons**: Lucide React
- **Themes**: next-themes 0.3.x (5 theme options: Light, Dark, Ocean, Forest, Sunset)

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (RESTful)
- **ORM**: Prisma 6.19
- **Database**: PostgreSQL 16+
- **Authentication**: Clerk 6.35+
- **AI Services**: OpenAI SDK 4.x (GPT-4o-mini model)

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx with SSL/TLS
- **Security Scanning**: Trivy

## Project Structure

```
prepwyse-commerce/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── ai/              # AI endpoints (quiz generation, recommendations, explanations)
│   │   ├── quiz/            # Quiz management
│   │   ├── mock-test/       # Mock test management
│   │   ├── subjects/        # Subject and chapter data
│   │   └── user/            # User management
│   ├── dashboard/           # Student dashboard
│   ├── quiz/                # Quiz interface
│   ├── mock-test/           # Mock test interface
│   ├── results/             # Analytics and results
│   ├── recommendations/     # AI recommendations
│   ├── profile/             # User profile
│   ├── admin/               # Admin panel
│   └── layout.tsx           # Root layout with providers
├── components/              # Reusable React components
├── lib/                     # Utilities and services
│   ├── prisma.ts           # Database client singleton
│   ├── openai.ts           # OpenAI client configuration
│   └── ai-services.ts      # AI utility functions
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Prisma schema definition
│   └── seed.ts             # Database seed data
├── proxy.ts                 # Clerk authentication middleware (Next.js 15+)
├── .github/workflows/       # CI/CD pipelines
└── Documentation files      # Extensive documentation
```

## Development Guidelines

### Code Style and Conventions

1. **TypeScript**:
   - Use strict mode (enabled in tsconfig.json)
   - Prefer explicit type annotations for function parameters and return types
   - Use interfaces for object shapes, types for unions/intersections
   - Avoid `any` type; use `unknown` if type is truly unknown

2. **React Components**:
   - Use functional components with hooks
   - Prefer named exports over default exports for components
   - Use proper TypeScript types (React.FC is deprecated, use explicit return types)
   - Keep components focused and single-responsibility

3. **File Naming**:
   - Components: PascalCase (e.g., `UserProfile.tsx`)
   - Utilities: camelCase (e.g., `formatDate.ts`)
   - API routes: kebab-case folders (e.g., `api/user-profile/route.ts`)
   - Next.js special files: lowercase (e.g., `page.tsx`, `layout.tsx`, `route.ts`)

4. **Imports**:
   - Group imports: React, Next.js, third-party, local components, utilities
   - Use absolute imports from root when available
   - Avoid circular dependencies

### Database and Prisma

1. **Schema Changes**:
   - Always run `npx prisma migrate dev --name descriptive_name` after schema changes
   - Run `npx prisma generate` to update Prisma Client
   - Never edit migrations manually

2. **Queries**:
   - Use Prisma Client for all database operations (no raw SQL unless absolutely necessary)
   - Always handle errors and edge cases
   - Use transactions for operations affecting multiple tables
   - Prefer `findUniqueOrThrow` and `findFirstOrThrow` for critical lookups

3. **Data Models**:
   - Key models: User, Subject, Chapter, Question, Quiz, QuizAttempt, MockTest, MockTestAttempt
   - AI-tracked fields: preferredDifficulty, weakAreas, strongAreas, learningStyle
   - Always include proper relations and cascade rules

### API Routes

1. **Structure**:
   - Use Next.js App Router API routes (route.ts files)
   - Export named functions: GET, POST, PUT, DELETE, PATCH
   - Return NextResponse with proper status codes

2. **Authentication**:
   - All API routes except public endpoints must check authentication
   - Use Clerk's `auth()` helper to get current user
   - Admin routes must verify admin role using `withAdminAuth` wrapper

3. **Admin Route Pattern** (PREFERRED):
   - Use `withAdminAuth` or `withAdminAuthParams` from `lib/auth/withAdminAuth.ts`
   - Eliminates repetitive auth checking and error handling boilerplate
   - Focuses code on business logic only
   
   ```typescript
   // Simple route
   import { withAdminAuth } from '@/lib/auth/withAdminAuth';
   
   export const GET = withAdminAuth(async (req, { user }) => {
     const data = await prisma.model.findMany();
     return NextResponse.json({ data }, { status: 200 });
   });
   
   // Route with dynamic parameters
   import { withAdminAuthParams } from '@/lib/auth/withAdminAuth';
   
   export const GET = withAdminAuthParams(async (req, { user, params }) => {
     const { id } = params;
     const data = await prisma.model.findUnique({ where: { id } });
     return NextResponse.json({ data }, { status: 200 });
   });
   ```

4. **Error Handling**:
   - Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
   - Include descriptive error messages
   - Log errors for debugging
   - For admin routes using `withAdminAuth`, error handling is automatic

5. **Response Format**:
   ```typescript
   // Success
   return NextResponse.json({ data: result }, { status: 200 });
   
   // Error
   return NextResponse.json({ error: "Error message" }, { status: 400 });
   ```

### Code Refactoring Guidelines

1. **Identify Repetitive Patterns**:
   - Look for code blocks repeated across multiple files (3+ occurrences)
   - Common patterns: authentication checks, error handling, validation
   - Calculate code reduction potential before refactoring

2. **Higher-Order Functions for Route Handlers**:
   - Create wrapper functions for cross-cutting concerns (auth, logging, error handling)
   - Example: `withAdminAuth` wraps route handlers with authentication and error handling
   - Benefits: 60-70% code reduction, consistent behavior, single source of truth
   
   ```typescript
   // lib/auth/withAdminAuth.ts pattern
   export function withAdminAuth(
     handler: (req: NextRequest, context: { user: any; params?: any }) => Promise<NextResponse>
   ): (req: NextRequest, context?: any) => Promise<NextResponse> {
     return async (req: NextRequest, context?: any) => {
       try {
         // Cross-cutting concerns (auth, validation, etc.)
         const authResult = await checkAdminAuth();
         if (authResult instanceof NextResponse) return authResult;
         
         // Call actual handler with enriched context
         return await handler(req, { user: authResult.user, ...context });
       } catch (error) {
         // Centralized error handling
         return NextResponse.json({ error: message }, { status: 500 });
       }
     };
   }
   ```

3. **When to Refactor**:
   - ✅ Code is repeated 3+ times across files
   - ✅ Pattern is stable and unlikely to change frequently
   - ✅ Refactoring reduces lines by >40%
   - ✅ Improves maintainability without sacrificing readability
   - ❌ Pattern occurs only 1-2 times
   - ❌ Code is too specialized or unique
   - ❌ Abstraction makes code harder to understand

4. **Refactoring Process**:
   - Document the pattern in a markdown file (e.g., `REFACTORING_OPTIONS.md`)
   - Create the abstraction/wrapper function
   - Refactor 2-3 example files to demonstrate
   - Test thoroughly (lint, build, type-check)
   - Leave migration path for remaining files
   - Don't refactor everything at once - provide examples and let others adopt

5. **Best Practices**:
   - Keep abstractions simple and focused
   - Maintain full TypeScript type safety
   - Provide clear examples in documentation
   - Consider backward compatibility
   - Test edge cases thoroughly

### AI Integration

1. **OpenAI Usage**:
   - Use the centralized OpenAI client from `lib/openai.ts`
   - Model: GPT-4o-mini (cost-effective for educational content)
   - Always set reasonable token limits and temperature
   - Handle rate limits and API errors gracefully

2. **AI Features**:
   - Quiz generation: Based on selected chapters and difficulty
   - Adaptive difficulty: Analyzes last 10 quiz performances
   - Recommendations: Personalized study plans based on performance patterns
   - Explanations: Context-aware explanations for questions
   - Content suggestions: Optimal chapter sequence recommendations

3. **Best Practices**:
   - Always validate AI-generated content before storing
   - Implement fallbacks for API failures
   - Cache AI responses when appropriate
   - Monitor token usage and costs

### Security

1. **Environment Variables**:
   - Never commit `.env` file or expose API keys
   - Use environment variables for all secrets
   - Required: DATABASE_URL, CLERK keys, OPENAI_API_KEY

2. **Authentication**:
   - All protected routes must use Clerk middleware
   - Verify user identity in API routes
   - Implement proper role-based access control for admin features

3. **Data Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use Prisma's parameterized queries (built-in SQL injection prevention)

4. **Security Best Practices**:
   - Keep dependencies updated
   - Run security scans (npm audit, Trivy)
   - Use HTTPS in production
   - Implement rate limiting on sensitive endpoints
   - Follow OWASP security guidelines

### Testing

1. **Current State**:
   - No automated tests currently in the repository
   - Manual testing is performed for features

2. **When Adding Tests** (future):
   - Use Jest and React Testing Library
   - Test API routes independently
   - Test React components with user interactions
   - Mock external services (OpenAI, Clerk)

### Build and Deployment

1. **Local Development**:
   ```bash
   npm install           # Install dependencies
   npx prisma generate   # Generate Prisma Client
   npx prisma migrate dev # Run migrations
   npm run dev          # Start dev server at http://localhost:3000
   ```

2. **Linting and Type Checking**:
   ```bash
   npm run lint         # ESLint
   npx tsc --noEmit    # TypeScript type check
   ```

3. **Building**:
   ```bash
   npm run build       # Production build
   npm start           # Start production server
   ```

4. **Database Commands**:
   ```bash
   npx prisma studio           # Database GUI
   npx prisma migrate dev      # Create and apply migration
   npx prisma db push          # Push schema without migration (dev only)
   npm run seed                # Seed database with sample data
   ```

5. **Docker Deployment**:
   ```bash
   docker-compose up -d        # Start all services
   docker-compose down         # Stop all services
   docker-compose logs -f app  # View app logs
   ```

### Documentation

1. **Existing Documentation**:
   - README.md: Project overview and quick start
   - TECHNICAL_DOCUMENTATION.md: Complete technical reference
   - DOCKER_DEPLOYMENT.md: Production deployment guide
   - QUICKSTART.md: 5-minute setup guide
   - SECURITY.md: Security practices
   - CONTRIBUTING.md: Contribution guidelines

2. **When Making Changes**:
   - Update relevant documentation if changing core features
   - Document new environment variables in .env.example
   - Update API documentation for new endpoints
   - Add inline code comments for complex logic

### Common Tasks

1. **Adding a New Feature**:
   - Create feature branch: `git checkout -b feature/feature-name`
   - Update database schema if needed (Prisma)
   - Create/update API routes
   - Build UI components
   - Test thoroughly
   - Update documentation
   - Commit with conventional commit message: `feat: description`

2. **Fixing a Bug**:
   - Create bug fix branch: `git checkout -b fix/bug-description`
   - Identify root cause
   - Implement fix with minimal changes
   - Test fix thoroughly
   - Commit: `fix: description`

3. **Adding a New Subject/Chapter**:
   - Use database seeding or admin panel
   - Ensure proper relations in Prisma schema
   - Validate data before insertion

4. **Updating Dependencies**:
   - Check for breaking changes
   - Update package.json
   - Run `npm install`
   - Test thoroughly
   - Update documentation if APIs changed

5. **Refactoring Existing Code**:
   - Identify repetitive patterns (3+ occurrences)
   - Calculate potential code reduction (aim for >40%)
   - Create abstraction/wrapper (e.g., higher-order function)
   - Document approach in markdown file (e.g., `REFACTORING_OPTIONS.md`)
   - Refactor 2-3 example files to demonstrate pattern
   - Test thoroughly: `npm run lint`, `npx tsc --noEmit`, `npm run build`
   - Leave migration path for others to adopt
   - Commit: `refactor: description`

### AI-Specific Guidelines

1. **Prompt Engineering**:
   - Be specific and clear in prompts
   - Provide context about commerce education in India
   - Include examples for better results
   - Set appropriate parameters (temperature, max_tokens)

2. **Performance Optimization**:
   - Cache frequently generated content
   - Use streaming for long responses
   - Implement retry logic with exponential backoff
   - Monitor API usage and costs

3. **Content Quality**:
   - Validate generated questions for correctness
   - Ensure explanations are clear and educational
   - Check for bias and inappropriate content
   - Maintain consistency with curriculum standards

### Git Workflow

1. **Commit Message Conventions**:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code formatting
   - `refactor:` Code restructuring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

2. **Branch Naming**:
   - Features: `feature/feature-name`
   - Fixes: `fix/issue-description`
   - Hotfixes: `hotfix/critical-issue`

3. **Pull Requests**:
   - Provide clear description
   - Link related issues
   - Ensure CI passes
   - Request review from maintainers

## Key Subjects and Domain Knowledge

### Commerce Education Context
- **Class 11 & 12**: CBSE curriculum for commerce students
- **CUET Commerce**: Common University Entrance Test
- **Subjects**: Business Studies (23 chapters), Accountancy (20 chapters), Economics (18 chapters)

### User Roles
- **Students**: Take quizzes, mock tests, view results, get AI recommendations
- **Admins**: Manage users, content, view analytics

### Core Features
- AI-generated adaptive quizzes
- Full-length mock tests
- Performance analytics with AI insights
- Personalized study recommendations
- Multi-theme support
- Responsive design

## Important Considerations

1. **Performance**: 
   - Optimize database queries
   - Use proper indexing
   - Implement caching where appropriate
   - Lazy load heavy components

2. **User Experience**:
   - Maintain smooth animations (Framer Motion)
   - Ensure responsive design works on all devices
   - Provide clear feedback for user actions
   - Handle loading and error states properly

3. **Scalability**:
   - Design for future feature additions
   - Keep code modular and maintainable
   - Use proper database relations
   - Consider performance with growing data

4. **Cost Management**:
   - Monitor OpenAI API usage
   - Implement caching for AI responses
   - Use efficient database queries
   - Optimize Docker images

## Questions to Ask Before Making Changes

1. Does this change align with the platform's educational goals?
2. Are there security implications?
3. Does it require database schema changes?
4. Will it affect existing user data?
5. Does it need to be reflected in documentation?
6. Are there API rate limits or cost implications (especially AI features)?
7. Is the change backward compatible?

## Getting Help

- Check existing documentation in the repository
- Review similar implementations in the codebase
- Consult official documentation: Next.js, Prisma, Clerk, OpenAI
- Open an issue for clarification on unclear requirements

## Summary

When working on this project:
- Always prioritize security and data privacy
- Write clean, type-safe TypeScript code
- Follow established patterns in the codebase
- Test changes thoroughly before committing
- Keep documentation up to date
- Be mindful of AI API costs
- Focus on educational value and user experience
- **Look for refactoring opportunities** - eliminate code duplication with abstractions
- **Use `withAdminAuth` for admin routes** - follow the established pattern for consistency

## Reference Documentation

For detailed examples and patterns:
- **REFACTORING_OPTIONS.md**: Complete guide to the `withAdminAuth` refactoring pattern
- **FIXES_CHECKLIST.md**: Code quality improvements checklist
- **CONTRIBUTING.md**: Contribution workflow and standards
