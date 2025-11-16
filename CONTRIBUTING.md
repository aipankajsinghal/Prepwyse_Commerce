# Contributing to PrepWyse Commerce

Thank you for your interest in contributing to PrepWyse Commerce! This document provides guidelines and instructions for adding new features and improvements.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Prepwyse_Commerce.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

Refer to the README.md file for detailed setup instructions.

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React

### Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard pages
│   ├── quiz/            # Quiz-related pages
│   ├── mock-test/       # Mock test pages
│   └── results/         # Results pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and helpers
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Adding New Features

### 1. Adding a New Subject

To add a new subject:

1. Update the database through Prisma:
   ```typescript
   await prisma.subject.create({
     data: {
       name: "Mathematics",
       description: "Applied Mathematics for Commerce",
       icon: "calculator",
     },
   });
   ```

2. Add chapters for the subject
3. Add questions for the chapters
4. Update the UI components to display the new subject

### 2. Adding New Question Types

Current question type: Multiple Choice (4 options)

To add new question types:

1. Update the Prisma schema to support new question types
2. Create new question components in `components/`
3. Update the quiz/test taking interface
4. Update the results calculation logic

### 3. Adding AI Features

Ideas for AI-powered features:

- **Adaptive Difficulty**: Adjust question difficulty based on performance
- **Personalized Recommendations**: Suggest topics to study
- **Answer Explanations**: Generate detailed explanations
- **Study Plan Generator**: Create personalized study schedules

Implementation:
1. Choose an AI provider (OpenAI, Anthropic, etc.)
2. Create API routes for AI operations
3. Add AI service utilities in `lib/`
4. Update UI to display AI-generated content

### 4. Adding Analytics Dashboard

To add detailed analytics:

1. Extend the database schema with analytics tables
2. Create API routes for analytics data
3. Add charting library (e.g., recharts, chart.js)
4. Create analytics components
5. Add analytics page to the dashboard

### 5. Adding Video Lessons

To add video content:

1. Choose a video hosting solution (YouTube, Vimeo, custom)
2. Update database schema to include video links
3. Create video player component
4. Add video management interface
5. Link videos to chapters/topics

### 6. Adding Social Features

Ideas:
- Leaderboards
- Study groups
- Discussion forums
- Peer-to-peer learning

Implementation steps:
1. Design the feature database schema
2. Create API routes
3. Build UI components
4. Add real-time updates (consider WebSockets)

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

Example:
```typescript
interface QuizCardProps {
  title: string;
  questions: number;
  duration: number;
  onStart: () => void;
}

export function QuizCard({ title, questions, duration, onStart }: QuizCardProps) {
  // Component implementation
}
```

### API Routes

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement error handling
- Add authentication checks
- Validate input data

Example:
```typescript
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    // Validate data
    
    // Process request
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database

- Always use Prisma for database operations
- Create migrations for schema changes
- Add proper indexes for performance
- Use transactions for multi-step operations

## Testing

### Running Tests

Currently, the project doesn't have automated tests. To add testing:

1. Choose a testing framework (Jest, Vitest)
2. Add test configuration
3. Write unit tests for utilities
4. Write integration tests for API routes
5. Write E2E tests for critical user flows

### Manual Testing Checklist

Before submitting a PR, test:
- [ ] Authentication flow (sign up, sign in, sign out)
- [ ] Navigation between pages
- [ ] Quiz creation and taking
- [ ] Mock test functionality
- [ ] Results display
- [ ] Responsive design on mobile and desktop
- [ ] Error handling

## Database Migrations

When changing the database schema:

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name your_migration_name`
3. Test the migration
4. Commit both the schema and migration files

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

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Responsive design works
- [ ] Changes are tested locally

## Feature Ideas

Here are some ideas for future contributions:

### High Priority
- Video lessons integration
- AI-powered study recommendations
- Detailed performance analytics
- Mobile app (React Native)
- Previous year papers
- Timed practice mode

### Medium Priority
- Gamification (badges, achievements)
- Social learning features
- Discussion forums
- Study planners
- Flashcards
- Note-taking system

### Low Priority
- Dark mode
- Multiple languages
- Print-friendly results
- Export results as PDF
- Email notifications
- Push notifications

## Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Provide constructive feedback
- Celebrate achievements

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Open a new issue with your question
- Reach out to maintainers

Thank you for contributing to PrepWyse Commerce! 🎓
