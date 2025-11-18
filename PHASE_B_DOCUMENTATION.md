# Phase B Implementation Documentation

This document provides comprehensive documentation for Phase B features implemented in PrepWyse Commerce.

## Overview

Phase B introduces advanced engagement and learning features including:
- **Gamification System**: Points, levels, achievements, leaderboards, and streaks
- **Smart Study Planner**: AI-powered study scheduling with session tracking
- **Smart Flashcards**: Spaced repetition learning with SM-2 algorithm
- **Multi-language Support**: English and Hindi internationalization
- **Personalization**: User preferences for language, favorites, and dashboard layout

---

## 1. Gamification System

### Features
- **Points & Levels**: Earn points for activities, level up automatically
- **Achievements**: Unlock badges for milestones and accomplishments
- **Leaderboard**: Compete with others (daily, weekly, monthly, all-time)
- **Streaks**: Track daily activity streaks with rewards

### Database Models

#### User Extensions
```typescript
points: Int @default(0)
level: Int @default(1)
currentStreak: Int @default(0)
longestStreak: Int @default(0)
lastActivityDate: DateTime?
```

#### Achievement
```typescript
model Achievement {
  id: String @id @default(cuid())
  userId: String
  type: String // badge, milestone, streak, etc.
  name: String
  description: String
  icon: String (emoji)
  category: String
  points: Int
  unlockedAt: DateTime
}
```

#### Leaderboard
```typescript
model Leaderboard {
  id: String @id @default(cuid())
  userId: String
  points: Int
  rank: Int
  period: String // daily, weekly, monthly, all_time
  periodKey: String // e.g., "2025-W47"
}
```

### API Endpoints

#### GET `/api/gamification/points`
Get user's current points, level, and progress.

**Response:**
```json
{
  "points": 1500,
  "level": 5,
  "currentStreak": 7,
  "longestStreak": 14,
  "nextLevelPoints": 2500,
  "progressToNextLevel": 60
}
```

#### POST `/api/gamification/points`
Award points to user (internal use).

**Request:**
```json
{
  "points": 50,
  "reason": "Quiz completed"
}
```

#### GET `/api/gamification/achievements`
Get all user achievements.

**Response:**
```json
{
  "achievements": [...],
  "grouped": {
    "quiz": [...],
    "streak": [...],
    "study": [...]
  },
  "total": 15,
  "totalPoints": 750
}
```

#### GET `/api/gamification/leaderboard?period=weekly&limit=10`
Get leaderboard rankings.

**Response:**
```json
{
  "period": "weekly",
  "periodKey": "2025-W47",
  "entries": [
    {
      "rank": 1,
      "points": 5000,
      "name": "John Doe",
      "level": 10,
      "isCurrentUser": false
    }
  ],
  "userRank": 15
}
```

#### GET `/api/gamification/streaks`
Get user's streak information.

#### POST `/api/gamification/streaks`
Update streak (called on activity completion).

### Points System

| Activity | Points |
|----------|--------|
| Quiz completion | 50 |
| Perfect score | 100 |
| Study session completion | 30 |
| Flashcard review | 5 |
| 3-day streak | 20 |
| 7-day streak | 50 |
| Level up | 50 |

### Level Calculation
```typescript
level = floor(sqrt(points / 100)) + 1
```

Example:
- 0-99 points: Level 1
- 100-399 points: Level 2
- 400-899 points: Level 3
- 900-1599 points: Level 4

---

## 2. Smart Study Planner

### Features
- **Study Plans**: Create personalized study plans with exam dates
- **AI Sessions**: Automatically generate study sessions based on weak areas
- **Calendar View**: Visual calendar with upcoming and completed sessions
- **Session Types**: Video, Quiz, Flashcard, Revision
- **Progress Tracking**: Mark sessions complete and earn points

### Database Models

#### StudyPlan
```typescript
model StudyPlan {
  id: String @id
  userId: String
  title: String
  description: String?
  examDate: DateTime?
  targetScore: Int?
  weeklyHours: Int
  preferredTime: Json?
  isActive: Boolean @default(true)
  sessions: StudySession[]
}
```

#### StudySession
```typescript
model StudySession {
  id: String @id
  planId: String
  chapterId: String
  title: String
  description: String?
  type: String // video, quiz, flashcard, revision
  scheduledDate: DateTime
  duration: Int // minutes
  completed: Boolean @default(false)
  completedAt: DateTime?
  notes: String?
}
```

### API Endpoints

#### GET `/api/study-planner/plans`
Get all study plans for the user.

#### POST `/api/study-planner/plans`
Create a new study plan.

**Request:**
```json
{
  "title": "CUET Commerce Preparation",
  "examDate": "2026-05-15",
  "targetScore": 95,
  "weeklyHours": 20,
  "subjectIds": ["sub1", "sub2"]
}
```

**Response:**
```json
{
  "plan": {...},
  "sessions": [...],
  "message": "Study plan created successfully"
}
```

#### GET `/api/study-planner/sessions?planId=xyz`
Get study sessions (filtered by plan, date range, completion status).

#### PATCH `/api/study-planner/sessions`
Update session (mark complete, add notes).

**Request:**
```json
{
  "sessionId": "session123",
  "completed": true,
  "notes": "Completed chapter review"
}
```

### Session Generation Algorithm

1. Analyze user's weak areas from quiz performance
2. Calculate available study time until exam
3. Distribute sessions across weekdays (skip weekends)
4. Prioritize weak areas and important chapters
5. Include revision sessions for spaced repetition
6. Ensure variety in session types (video, quiz, flashcard, revision)

---

## 3. Smart Flashcards

### Features
- **Spaced Repetition**: SM-2 algorithm for optimal review timing
- **Interactive Review**: Flip animation with quality ratings
- **Progress Tracking**: Track reviews, ease factor, intervals
- **Due Cards**: View cards due for review today
- **New Cards**: Introduce new cards gradually

### Database Models

#### Flashcard
```typescript
model Flashcard {
  id: String @id
  chapterId: String
  front: String // Question
  back: String // Answer
  difficulty: String
  tags: Json?
  progress: FlashcardProgress[]
}
```

#### FlashcardProgress
```typescript
model FlashcardProgress {
  id: String @id
  userId: String
  flashcardId: String
  easeFactor: Float @default(2.5) // SM-2
  interval: Int @default(0) // days
  repetitions: Int @default(0)
  nextReviewDate: DateTime
  lastReviewedAt: DateTime?
  quality: Int? // 0-5
  reviewCount: Int @default(0)
}
```

### API Endpoints

#### GET `/api/flashcards/cards?chapterId=xyz`
Get flashcards by chapter or subject.

#### POST `/api/flashcards/cards`
Create a new flashcard.

**Request:**
```json
{
  "chapterId": "chapter123",
  "front": "What is the accounting equation?",
  "back": "Assets = Liabilities + Equity",
  "difficulty": "easy"
}
```

#### GET `/api/flashcards/review?chapterId=xyz&limit=20`
Get flashcards due for review.

**Response:**
```json
{
  "dueForReview": [...],
  "newCards": [...],
  "total": 15
}
```

#### POST `/api/flashcards/review`
Submit flashcard review with quality rating.

**Request:**
```json
{
  "flashcardId": "card123",
  "quality": 4 // 0-5
}
```

### SM-2 Algorithm

The SM-2 (SuperMemo 2) algorithm calculates optimal review intervals:

**Quality Ratings:**
- 0 (Again): Complete blackout, wrong response
- 1 (Hard): Incorrect but remembered
- 2 (Hard): Correct but difficult
- 3 (Good): Correct with hesitation
- 4 (Good): Correct answer
- 5 (Easy): Perfect response

**Algorithm:**
1. Update ease factor: `EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))`
2. Minimum EF is 1.3
3. If quality < 3: Reset (interval = 0, repetitions = 0)
4. Else: 
   - First repetition: interval = 1 day
   - Second repetition: interval = 6 days
   - Subsequent: interval = previous_interval * EF

**Review Schedule Examples:**
- Quality 5 (Easy): Next review in 4 days
- Quality 4 (Good): Next review in 1 day (first), 6 days (second), increasing
- Quality 2 (Hard): Next review in 6 minutes
- Quality 0 (Again): Next review in 1 minute

---

## 4. Multi-language Support (i18n)

### Features
- **Languages**: English (en) and Hindi (hi)
- **Translation Files**: JSON-based translations
- **Dynamic Switching**: Change language without reload
- **Persistent Preference**: Saved to user profile

### Setup

#### Installation
```bash
npm install next-intl
```

#### Configuration

**i18n.ts:**
```typescript
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'hi'] as const;

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

**next.config.js:**
```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);
```

### Translation Files

Located in `/messages/`:
- `en.json` - English translations
- `hi.json` - Hindi translations

**Structure:**
```json
{
  "common": {
    "appName": "PrepWyse Commerce",
    "welcome": "Welcome",
    ...
  },
  "nav": {...},
  "gamification": {...},
  "studyPlanner": {...},
  "flashcards": {...}
}
```

### Usage in Components

```typescript
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Language Switcher

Component: `/components/personalization/LanguageSwitcher.tsx`

Updates user preference via `/api/personalization` endpoint.

---

## 5. Personalization

### Features
- **Language Preference**: English or Hindi
- **Favorite Subjects**: Quick access to preferred subjects
- **Favorite Chapters**: Bookmark important chapters
- **Dashboard Layout**: Customize widget arrangement (future)
- **Notification Preferences**: Control email/push notifications

### Database Model

#### User Extensions
```typescript
preferredLanguage: String @default("en")
favoriteSubjects: Json? // Array of subject IDs
favoriteChapters: Json? // Array of chapter IDs
dashboardLayout: Json? // Widget preferences
notificationPrefs: Json? // Notification settings
```

### API Endpoints

#### GET `/api/personalization`
Get user's personalization preferences.

**Response:**
```json
{
  "preferredLanguage": "en",
  "favoriteSubjects": ["sub1", "sub2"],
  "favoriteChapters": ["ch1", "ch2"],
  "dashboardLayout": {
    "widgets": ["points", "leaderboard", "upcoming"]
  },
  "notificationPrefs": {
    "email": true,
    "push": true,
    "studyReminders": true,
    "achievements": true,
    "weeklyReport": true
  }
}
```

#### PATCH `/api/personalization`
Update user preferences.

**Request:**
```json
{
  "preferredLanguage": "hi",
  "favoriteSubjects": ["sub1", "sub2", "sub3"],
  "notificationPrefs": {
    "email": true,
    "push": false,
    "studyReminders": true
  }
}
```

---

## Frontend Components

### Gamification Components

#### PointsDisplay
**Location:** `/components/gamification/PointsDisplay.tsx`

Displays user's points, level, streaks with animated progress bar.

**Features:**
- Real-time points display
- Level progress visualization
- Current and longest streak
- Framer Motion animations

#### LeaderboardWidget
**Location:** `/components/gamification/LeaderboardWidget.tsx`

Shows top 10 rankings with period filters.

**Features:**
- Period selection (daily, weekly, monthly, all-time)
- Rank emoji indicators (🥇🥈🥉)
- Current user highlighting
- Rank outside top 10 display

### Study Planner Components

#### StudyCalendar
**Location:** `/components/study-planner/StudyCalendar.tsx`

Calendar view of study sessions with completion tracking.

**Features:**
- Upcoming sessions list
- Expandable date sections
- Session type icons and colors
- Mark complete functionality
- Progress statistics

### Flashcard Components

#### FlashcardReview
**Location:** `/components/flashcards/FlashcardReview.tsx`

Interactive flashcard review with flip animation.

**Features:**
- Card flip animation
- Progress tracking
- Quality rating buttons (Again, Hard, Good, Easy)
- Review interval display
- Automatic next card

### Personalization Components

#### LanguageSwitcher
**Location:** `/components/personalization/LanguageSwitcher.tsx`

Toggle between English and Hindi.

**Features:**
- Flag icons
- Active state highlighting
- Instant language update
- Persistent preference

---

## Pages

### Gamification Page
**URL:** `/gamification`

Dashboard for points, achievements, and leaderboard.

### Study Planner Page
**URL:** `/study-planner`

View and manage study plans and sessions.

### Flashcards Page
**URL:** `/flashcards`

Review flashcards with spaced repetition.

---

## Integration with Existing Features

### Points Integration

Points are automatically awarded for:
- **Quiz Completion**: 50 points
- **Perfect Score**: Additional 100 points
- **Study Session**: 30 points
- **Flashcard Review**: 5 points per card
- **Streak Milestones**: 20-1000 points

### Update Quiz APIs
Add point awarding in quiz completion:
```typescript
await fetch('/api/gamification/points', {
  method: 'POST',
  body: JSON.stringify({ points: 50, reason: 'Quiz completed' })
});

await fetch('/api/gamification/streaks', { method: 'POST' });
```

### Navigation Updates
Add new menu items:
- Gamification
- Study Planner
- Flashcards

---

## Testing Phase B Features

### Manual Testing Checklist

#### Gamification
- [ ] View points and level on dashboard
- [ ] Complete quiz and verify points awarded
- [ ] Check leaderboard updates
- [ ] Verify streak increments daily
- [ ] View achievements
- [ ] Test period filters on leaderboard

#### Study Planner
- [ ] Create a study plan
- [ ] View generated sessions
- [ ] Mark session as complete
- [ ] Verify points awarded for completion
- [ ] Check calendar view

#### Flashcards
- [ ] View due flashcards
- [ ] Flip card to see answer
- [ ] Rate card quality
- [ ] Verify next review date calculation
- [ ] Check progress tracking

#### i18n
- [ ] Switch to Hindi
- [ ] Verify translations display correctly
- [ ] Switch back to English
- [ ] Check preference persistence

#### Personalization
- [ ] Update language preference
- [ ] Add favorite subjects
- [ ] Update notification settings
- [ ] Verify preferences saved

---

## Performance Considerations

### Database Indexing
```prisma
@@index([userId, period, periodKey]) // Leaderboard
@@index([userId, nextReviewDate]) // FlashcardProgress
@@index([planId, scheduledDate]) // StudySession
```

### Caching Strategy
- Cache leaderboard for 5 minutes
- Cache user points for 1 minute
- Cache flashcard due dates until review

### Optimization
- Batch leaderboard rank updates
- Lazy load achievement icons
- Paginate study sessions
- Limit flashcards per session (20)

---

## Future Enhancements

### Gamification
- Custom challenges with time limits
- Team competitions
- Achievement categories
- Badge showcase
- Points shop for rewards

### Study Planner
- AI chat for plan adjustments
- Integration with calendar apps
- Study group sessions
- Pomodoro timer
- Progress reports

### Flashcards
- AI-generated flashcards from chapters
- Image support for cards
- Audio pronunciation
- Shared flashcard decks
- Import/export functionality

### i18n
- Add more languages (Marathi, Tamil, Telugu)
- Auto-detect browser language
- RTL support
- Regional date/time formats

---

## Troubleshooting

### Common Issues

**Issue:** Points not updating
- **Solution:** Check API authentication, verify user sync

**Issue:** Leaderboard ranks incorrect
- **Solution:** Run rank recalculation script

**Issue:** Flashcard intervals too short
- **Solution:** Verify SM-2 algorithm implementation, check quality ratings

**Issue:** Translations missing
- **Solution:** Ensure translation keys exist in both en.json and hi.json

**Issue:** Study sessions not generating
- **Solution:** Check user has weak areas data, verify chapter availability

---

## API Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/gamification/points` | 60/min |
| `/api/gamification/leaderboard` | 30/min |
| `/api/flashcards/review` | 120/min |
| `/api/study-planner/sessions` | 60/min |
| `/api/personalization` | 30/min |

---

## Security Considerations

- All APIs protected with Clerk authentication
- User data isolation (can only access own data)
- Input validation on all POST/PATCH requests
- SQL injection prevention via Prisma
- XSS prevention via React auto-escaping
- Rate limiting on sensitive endpoints

---

## Deployment Notes

1. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Build application:
   ```bash
   npm run build
   ```

4. Set environment variables:
   - All existing variables required
   - No new environment variables for Phase B

---

## Support

For issues or questions about Phase B features:
- Check this documentation
- Review API endpoint responses
- Inspect browser console for errors
- Check Prisma Studio for data verification

---

**Phase B Implementation Complete** ✅

All five Phase B features have been successfully implemented with:
- 8 new API routes
- 5 new frontend components
- 3 new pages
- 7 new database models
- Multi-language support
- Comprehensive documentation

Next Phase: **Phase C** - Subscription plans, referral program, advanced admin dashboard
