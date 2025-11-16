# PrepWyse Commerce - AI-Powered EdTech Platform

An AI-powered EdTech application designed for commerce students in Class 11, Class 12, and students preparing for CUET Commerce exams in India. The platform provides adaptive quizzes, full-length mock tests, and comprehensive learning tools.

## Features

### 🎓 For Students
- **Multi-Chapter Quiz Selection**: Create custom quizzes by selecting multiple chapters from any subject
- **Full-Length Mock Tests**: Practice with mock tests designed as per actual exam patterns (CUET, Class 11, Class 12)
- **Performance Analytics**: Track your progress with detailed results and subject-wise performance metrics
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Secure Authentication**: User authentication powered by Clerk

### 📚 Subjects Covered
- Business Studies
- Accountancy
- Economics

### ⚡ Technical Features
- Server-side rendering with Next.js 14+ (App Router)
- TypeScript for type safety
- PostgreSQL database with Prisma ORM
- Clerk authentication
- Responsive UI with Tailwind CSS
- RESTful API architecture

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Clerk account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git
cd Prepwyse_Commerce
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prepwyse_commerce?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. (Optional) Seed the database with sample data:
```bash
npm run seed
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── quiz/         # Quiz endpoints
│   │   ├── mock-test/    # Mock test endpoints
│   │   ├── subjects/     # Subject and chapter endpoints
│   │   └── user/         # User management
│   ├── dashboard/        # Main dashboard
│   ├── quiz/             # Quiz creation and taking
│   ├── mock-test/        # Mock test interface
│   ├── results/          # Results and analytics
│   ├── sign-in/          # Sign in page
│   ├── sign-up/          # Sign up page
│   ├── layout.tsx        # Root layout with Clerk provider
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   └── Navbar.tsx        # Navigation component
├── lib/                  # Utility functions
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── middleware.ts         # Clerk authentication middleware
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

The application uses the following main entities:

- **User**: Student information and authentication
- **Subject**: Commerce subjects (Business Studies, Accountancy, Economics)
- **Chapter**: Individual chapters within subjects
- **Question**: Quiz and test questions
- **Quiz**: Custom quiz configurations
- **QuizAttempt**: Student quiz attempts and results
- **MockTest**: Full-length mock test definitions
- **MockTestAttempt**: Student mock test attempts and results

## API Endpoints

### Subjects
- `GET /api/subjects` - Get all subjects with chapters
- `POST /api/subjects` - Create a new subject

### Quiz
- `POST /api/quiz` - Create and start a new quiz

### User
- `POST /api/user/sync` - Sync Clerk user with database

## Future Enhancements

The application is designed to be flexible for future additions:

- **AI-Powered Features**
  - Adaptive difficulty based on student performance
  - Personalized study recommendations
  - AI-generated explanations for answers
  
- **Social Features**
  - Leaderboards and competitions
  - Study groups and peer discussions
  - Share progress with friends

- **Advanced Analytics**
  - Time spent per chapter
  - Difficulty-wise performance
  - Predicted exam scores
  - Strength and weakness identification

- **Content Expansion**
  - Video lessons
  - Practice sets
  - Previous year papers
  - Detailed solutions and explanations

- **Gamification**
  - Badges and achievements
  - Streak tracking
  - Points and rewards system

## Development

### Running Lints
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or open an issue in the GitHub repository.
