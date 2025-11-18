# Phase D Pre-Launch Implementation Plan

**Status:** Ready to Start  
**Priority:** 🔴 CRITICAL - Required before platform launch  
**Created:** November 18, 2025  
**Last Updated:** November 18, 2025

---

## Executive Summary

Phase D contains **3 critical pre-launch features** that must be implemented before the PrepWyse Commerce platform can launch. These features are essential for providing a complete educational experience to commerce students.

**Timeline:** 12-15 days (2-3 weeks)  
**Current Status:** 0% Complete (Not Started)

---

## Feature 1: Practice Papers & Previous Years

**Priority:** 🔴 PRE-LAUNCH CRITICAL  
**Estimated Effort:** 4-5 days  
**Status:** ⬜ Not Started

### Overview
Enable students to practice with previous year exam papers from CUET, Class 11, and Class 12 exams. This feature reuses the existing quiz infrastructure for a familiar user experience.

### Database Models Required

```prisma
model PracticePaper {
  id          String   @id @default(cuid())
  year        Int
  examType    String   // CUET, Class 11, Class 12
  title       String
  description String?
  duration    Int      // in minutes
  totalMarks  Int
  questions   Json     // Array of question objects or IDs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  attempts    PracticePaperAttempt[]
}

model PracticePaperAttempt {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  paperId         String
  paper           PracticePaper @relation(fields: [paperId], references: [id], onDelete: Cascade)
  score           Int
  totalQuestions  Int
  timeSpent       Int           // in seconds
  answers         Json          // Array of answers
  completedAt     DateTime      @default(now())
  
  @@index([userId, paperId])
  @@index([completedAt])
}
```

### API Endpoints (8 endpoints)

#### Student-Facing APIs
1. **GET /api/practice-papers**
   - List all available practice papers
   - Query params: `examType`, `year`, `page`, `limit`
   - Returns: Paginated list of papers with metadata

2. **GET /api/practice-papers/[id]**
   - Get detailed information about a specific paper
   - Returns: Paper details with questions

3. **POST /api/practice-papers/attempt**
   - Start a new practice paper attempt
   - Body: `{ paperId }`
   - Returns: Attempt ID and paper details

4. **POST /api/practice-papers/submit**
   - Submit completed practice paper
   - Body: `{ attemptId, answers }`
   - Returns: Score and detailed results

5. **GET /api/practice-papers/attempts**
   - Get user's practice paper attempt history
   - Query params: `page`, `limit`
   - Returns: List of attempts with scores

#### Admin APIs
6. **POST /api/admin/practice-papers**
   - Create new practice paper (admin only)
   - Body: Paper details including questions
   - Returns: Created paper object

7. **PATCH /api/admin/practice-papers/[id]**
   - Update existing practice paper (admin only)
   - Body: Fields to update
   - Returns: Updated paper object

8. **DELETE /api/admin/practice-papers/[id]**
   - Delete practice paper (admin only)
   - Returns: Success confirmation

### Frontend Pages (4 pages)

1. **`/practice-papers` - List Page**
   - Grid/list view of all available papers
   - Filters: exam type, year, difficulty
   - Search functionality
   - Paper cards showing: year, exam type, questions count, duration

2. **`/practice-papers/[id]` - Details Page**
   - Paper information and instructions
   - Start attempt button
   - Previous attempt history for this paper
   - Sample questions preview

3. **`/practice-papers/[id]/attempt` - Attempt Page**
   - Reuse quiz interface components
   - Timer countdown
   - Question navigation
   - Mark for review
   - Submit confirmation

4. **`/practice-papers/results/[attemptId]` - Results Page**
   - Score display
   - Section-wise analysis
   - Correct answers with explanations
   - Time spent per question
   - Performance comparison with previous attempts

5. **`/admin/practice-papers` - Admin Management**
   - Create new practice papers
   - Upload questions in bulk
   - Edit existing papers
   - View paper statistics

### Implementation Checklist

- [ ] Add database models to `prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name add_practice_papers`
- [ ] Create API route: `/api/practice-papers/route.ts` (GET)
- [ ] Create API route: `/api/practice-papers/[id]/route.ts` (GET)
- [ ] Create API route: `/api/practice-papers/attempt/route.ts` (POST)
- [ ] Create API route: `/api/practice-papers/submit/route.ts` (POST)
- [ ] Create API route: `/api/practice-papers/attempts/route.ts` (GET)
- [ ] Create API route: `/api/admin/practice-papers/route.ts` (POST)
- [ ] Create API route: `/api/admin/practice-papers/[id]/route.ts` (PATCH, DELETE)
- [ ] Create page: `app/practice-papers/page.tsx`
- [ ] Create page: `app/practice-papers/[id]/page.tsx`
- [ ] Create page: `app/practice-papers/[id]/attempt/page.tsx`
- [ ] Create page: `app/practice-papers/results/[attemptId]/page.tsx`
- [ ] Create page: `app/admin/practice-papers/page.tsx`
- [ ] Create reusable components for paper display
- [ ] Add navigation links to main menu
- [ ] Test all user flows
- [ ] Add sample practice papers via seed data

### Dependencies
- Reuses: Quiz interface components, timer, navigation
- Integrates with: User authentication, analytics, gamification
- Data source: Previous year question papers (to be collected/digitized)

---

## Feature 2: Study Notes & Summaries

**Priority:** 🔴 PRE-LAUNCH CRITICAL  
**Estimated Effort:** 4-5 days  
**Status:** ⬜ Not Started

### Overview
Provide comprehensive study notes for each chapter with AI-generated summaries, PDF downloads, and bookmarking capabilities.

### Database Models Required

```prisma
model StudyNote {
  id          String          @id @default(cuid())
  chapterId   String
  chapter     Chapter         @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  title       String
  content     String          @db.Text
  summary     String?         @db.Text  // AI-generated summary
  type        String          // "official", "student", "ai_generated"
  authorId    String?
  author      User?           @relation(fields: [authorId], references: [id])
  views       Int             @default(0)
  likes       Int             @default(0)
  pdfUrl      String?
  tags        Json?           // Array of tags
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  bookmarks   NoteBookmark[]
  
  @@index([chapterId, createdAt])
}

model NoteBookmark {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  noteId    String
  note      StudyNote @relation(fields: [noteId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  
  @@unique([userId, noteId])
  @@index([userId, createdAt])
}
```

### API Endpoints (9 endpoints)

#### Student-Facing APIs
1. **GET /api/study-notes/chapters/[chapterId]**
   - List all notes for a chapter
   - Query params: `type`, `sort`
   - Returns: Array of notes

2. **GET /api/study-notes/[id]**
   - Get full note content
   - Increments view count
   - Returns: Note with full content

3. **POST /api/study-notes/[id]/like**
   - Like a note
   - Returns: Updated like count

4. **POST /api/study-notes/bookmarks**
   - Bookmark a note
   - Body: `{ noteId }`
   - Returns: Bookmark object

5. **DELETE /api/study-notes/bookmarks/[id]**
   - Remove bookmark
   - Returns: Success confirmation

6. **GET /api/study-notes/bookmarks**
   - Get user's bookmarked notes
   - Returns: List of bookmarked notes

#### Admin APIs
7. **POST /api/admin/study-notes**
   - Create new study note (admin only)
   - Body: Note content and metadata
   - Returns: Created note

8. **POST /api/admin/study-notes/generate**
   - AI-generate notes for a chapter (admin only)
   - Body: `{ chapterId, contentSource? }`
   - Returns: Generated note with AI summary

9. **PATCH /api/admin/study-notes/[id]**
   - Update existing note (admin only)
   - Body: Fields to update
   - Returns: Updated note

10. **DELETE /api/admin/study-notes/[id]**
    - Delete note (admin only)
    - Returns: Success confirmation

### Frontend Pages (5 pages)

1. **`/study-notes` - Home Page**
   - Browse notes by subject
   - Featured notes
   - Recently added notes
   - Popular notes
   - Search functionality

2. **`/study-notes/[chapterId]` - Chapter Notes**
   - All notes for a specific chapter
   - Filter by type (official/student/AI)
   - Sort by views, likes, date
   - Quick preview cards

3. **`/study-notes/view/[id]` - View Note**
   - Full note content with formatting
   - AI-generated summary at top
   - Like button
   - Bookmark button
   - Download PDF button
   - Related notes sidebar
   - Comment/feedback section (optional)

4. **`/study-notes/bookmarks` - User Bookmarks**
   - All bookmarked notes
   - Organized by subject/chapter
   - Quick access
   - Remove bookmark option

5. **`/admin/study-notes` - Admin Management**
   - Create/edit notes
   - Generate AI notes for chapters
   - Bulk upload notes
   - Moderate student-contributed notes
   - View analytics (views, likes, etc.)

### Implementation Checklist

- [ ] Add database models to `prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name add_study_notes`
- [ ] Create API route: `/api/study-notes/chapters/[chapterId]/route.ts` (GET)
- [ ] Create API route: `/api/study-notes/[id]/route.ts` (GET)
- [ ] Create API route: `/api/study-notes/[id]/like/route.ts` (POST)
- [ ] Create API route: `/api/study-notes/bookmarks/route.ts` (GET, POST, DELETE)
- [ ] Create API route: `/api/admin/study-notes/route.ts` (POST)
- [ ] Create API route: `/api/admin/study-notes/generate/route.ts` (POST)
- [ ] Create API route: `/api/admin/study-notes/[id]/route.ts` (PATCH, DELETE)
- [ ] Create page: `app/study-notes/page.tsx`
- [ ] Create page: `app/study-notes/[chapterId]/page.tsx`
- [ ] Create page: `app/study-notes/view/[id]/page.tsx`
- [ ] Create page: `app/study-notes/bookmarks/page.tsx`
- [ ] Create page: `app/admin/study-notes/page.tsx`
- [ ] Implement AI summary generation using OpenAI
- [ ] Implement PDF generation/download
- [ ] Create rich text editor for note creation
- [ ] Add navigation links to main menu
- [ ] Test all user flows
- [ ] Create initial notes for key chapters

### Dependencies
- Reuses: OpenAI integration, Chapter data structure
- New libraries: PDF generation (jsPDF or similar)
- Integrates with: User authentication, analytics
- Content: Study notes need to be created/curated

---

## Feature 3: Advanced Search

**Priority:** 🔴 PRE-LAUNCH CRITICAL  
**Estimated Effort:** 4-5 days  
**Status:** ⬜ Not Started

### Overview
Implement comprehensive search functionality across the entire platform to help users quickly find questions, chapters, notes, papers, and other content.

### Implementation Strategy
**Option 1: PostgreSQL Full-Text Search** (Recommended)
- Built into PostgreSQL
- No additional service dependencies
- Faster to implement
- Sufficient for most use cases
- Lower cost

**Option 2: Algolia** (Alternative)
- Better UX and relevance
- Advanced features (typo tolerance, faceting)
- Third-party dependency
- Additional cost (~$1-50/month)
- Can be implemented later as an upgrade

**Recommended:** Start with PostgreSQL FTS, migrate to Algolia if needed based on user feedback.

### Database Models Required

```prisma
model SearchHistory {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  query       String
  resultCount Int
  filters     Json?    // Applied filters
  clickedItem String?  // What user clicked on
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
}
```

### Search Index Setup (PostgreSQL)

Add full-text search indexes to existing models:

```sql
-- Add tsvector columns for full-text search
ALTER TABLE "Question" ADD COLUMN search_vector tsvector;
ALTER TABLE "Chapter" ADD COLUMN search_vector tsvector;
ALTER TABLE "StudyNote" ADD COLUMN search_vector tsvector;
ALTER TABLE "PracticePaper" ADD COLUMN search_vector tsvector;

-- Create triggers to auto-update search vectors
-- (Implementation in migration file)

-- Create GIN indexes for fast search
CREATE INDEX question_search_idx ON "Question" USING GIN(search_vector);
CREATE INDEX chapter_search_idx ON "Chapter" USING GIN(search_vector);
CREATE INDEX studynote_search_idx ON "StudyNote" USING GIN(search_vector);
CREATE INDEX paper_search_idx ON "PracticePaper" USING GIN(search_vector);
```

### API Endpoints (5 endpoints)

1. **GET /api/search**
   - Unified search across all content types
   - Query params: 
     - `q` (query string)
     - `type` (questions/chapters/notes/papers/all)
     - `subject`, `difficulty`, `examType` (filters)
     - `page`, `limit`
   - Returns: Unified search results with highlights

2. **GET /api/search/suggestions**
   - Auto-complete suggestions
   - Query param: `q` (partial query)
   - Returns: Array of suggested queries

3. **GET /api/search/history**
   - Get user's search history
   - Returns: Recent searches

4. **POST /api/search/history**
   - Save search query and interaction
   - Body: `{ query, resultCount, filters, clickedItem }`
   - Returns: Success confirmation

5. **DELETE /api/search/history/[id]**
   - Delete specific search history item
   - Returns: Success confirmation

### Frontend Components & Pages

#### Components
1. **SearchBar Component** (Add to Navbar)
   - Input with keyboard shortcut (Ctrl+K / Cmd+K)
   - Auto-complete dropdown
   - Recent searches
   - Quick filters

2. **SearchResults Component**
   - Tabbed interface (All/Questions/Notes/Papers/Chapters)
   - Result cards with highlights
   - Pagination
   - Sort options

#### Pages
1. **`/search` - Search Results Page**
   - Main search interface
   - Advanced filters sidebar:
     - Subject
     - Difficulty
     - Exam type
     - Content type
     - Date range
   - Results display
   - Related searches
   - Search tips for no results

2. **Admin Analytics**
   - Add search analytics to admin dashboard
   - Popular queries
   - No-result queries (to improve content)
   - Search trends over time

### Implementation Checklist

- [ ] Add SearchHistory model to `prisma/schema.prisma`
- [ ] Add search_vector columns to relevant tables
- [ ] Create migration with full-text search triggers
- [ ] Run `npx prisma migrate dev --name add_search`
- [ ] Create utility functions in `lib/search.ts`
- [ ] Create API route: `/api/search/route.ts` (GET)
- [ ] Create API route: `/api/search/suggestions/route.ts` (GET)
- [ ] Create API route: `/api/search/history/route.ts` (GET, POST)
- [ ] Create API route: `/api/search/history/[id]/route.ts` (DELETE)
- [ ] Create component: `components/SearchBar.tsx`
- [ ] Add SearchBar to navbar/layout
- [ ] Create component: `components/SearchResults.tsx`
- [ ] Create page: `app/search/page.tsx`
- [ ] Implement search highlighting
- [ ] Implement auto-complete logic
- [ ] Add search analytics to admin dashboard
- [ ] Test search across all content types
- [ ] Optimize search query performance

### Dependencies
- PostgreSQL full-text search capabilities
- Reuses: All existing content models
- Integrates with: Navigation, analytics, user tracking

---

## Implementation Timeline

### Week 1: Practice Papers (Days 1-5)
**Day 1-2:**
- [ ] Add database models and migrations
- [ ] Create basic API endpoints (list, get, attempt, submit)
- [ ] Test API endpoints with Postman/curl

**Day 3-4:**
- [ ] Build practice papers list page
- [ ] Build paper details and attempt page (reuse quiz UI)
- [ ] Build results page

**Day 5:**
- [ ] Create admin management page
- [ ] Add sample practice papers
- [ ] Integration testing
- [ ] Bug fixes

### Week 2: Study Notes (Days 6-10)
**Day 6-7:**
- [ ] Add database models and migrations
- [ ] Create API endpoints for notes
- [ ] Implement AI summary generation
- [ ] Test APIs

**Day 8-9:**
- [ ] Build notes browsing pages
- [ ] Build note viewer with PDF download
- [ ] Build bookmarks page

**Day 10:**
- [ ] Create admin notes management
- [ ] Add initial notes for key chapters
- [ ] Integration testing
- [ ] Bug fixes

### Week 3: Advanced Search (Days 11-15)
**Day 11-12:**
- [ ] Set up full-text search indexes
- [ ] Create search utility functions
- [ ] Create search API endpoints
- [ ] Test search accuracy

**Day 13-14:**
- [ ] Build search bar component
- [ ] Build search results page
- [ ] Implement filters and sorting
- [ ] Add auto-complete

**Day 15:**
- [ ] Add search to navbar
- [ ] Integration testing across platform
- [ ] Performance optimization
- [ ] Final bug fixes

---

## Testing Strategy

### Unit Tests
- [ ] API endpoint tests for each feature
- [ ] Search algorithm tests
- [ ] AI summary generation tests

### Integration Tests
- [ ] End-to-end user flows
- [ ] Cross-feature integration (e.g., search finds papers)
- [ ] Authentication and authorization tests

### Performance Tests
- [ ] Search query performance (< 500ms)
- [ ] Page load times (< 2s)
- [ ] Large dataset handling

### User Acceptance Tests
- [ ] Test with sample commerce students
- [ ] Gather feedback on UX
- [ ] Validate content quality

---

## Success Metrics

### Practice Papers
- [ ] At least 10 previous year papers uploaded
- [ ] Papers from CUET, Class 11, Class 12
- [ ] Average completion rate > 60%
- [ ] User rating > 4.0/5.0

### Study Notes
- [ ] Notes available for all major chapters (61 chapters)
- [ ] AI summaries with > 80% relevance
- [ ] PDF downloads working smoothly
- [ ] Bookmark feature used by > 40% users

### Advanced Search
- [ ] Search results < 500ms response time
- [ ] Relevant results in top 5 for 90% queries
- [ ] Auto-complete suggestions < 200ms
- [ ] Zero-result rate < 10%

---

## Risks & Mitigations

### Risk 1: Content Creation Bottleneck
**Risk:** Creating quality notes and papers takes time  
**Impact:** High  
**Mitigation:**
- Use AI to generate initial drafts
- Parallelize content creation with development
- Start with most important chapters/years
- Use existing textbook content (with proper attribution)

### Risk 2: Search Quality Issues
**Risk:** Poor search relevance hurts UX  
**Impact:** Medium  
**Mitigation:**
- Start with simple keyword matching
- Iteratively improve based on user queries
- Have fallback to browse by category
- Monitor no-result queries

### Risk 3: Timeline Slippage
**Risk:** Features take longer than estimated  
**Impact:** High  
**Mitigation:**
- Build MVPs first, enhance later
- Reuse existing components aggressively
- Daily progress tracking
- Cut non-essential features if needed

### Risk 4: Integration Issues
**Risk:** New features break existing functionality  
**Impact:** Medium  
**Mitigation:**
- Thorough testing at each stage
- Incremental integration
- Feature flags for gradual rollout
- Maintain backward compatibility

---

## Launch Readiness Checklist

### Pre-Launch Requirements
- [ ] All 3 features implemented and tested
- [ ] At least 10 practice papers available
- [ ] Notes for all major chapters (minimum 40/61)
- [ ] Search working across all content types
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Admin trained on new features

### Launch Criteria
- [ ] User acceptance testing completed
- [ ] All API endpoints secured
- [ ] Database properly indexed
- [ ] Error monitoring set up
- [ ] Backup and recovery tested
- [ ] Content moderation rules in place

### Post-Launch Monitoring (First Week)
- [ ] Monitor error rates
- [ ] Track feature usage metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs within 24 hours
- [ ] Daily team sync meetings

---

## Resources Required

### Development Team
- **Backend Developer:** 15 days (API development, database)
- **Frontend Developer:** 15 days (UI/UX implementation)
- **DevOps:** 2 days (deployment, monitoring)

### Content Team
- **Content Creator:** 10 days (notes, papers)
- **Reviewer:** 5 days (quality check)

### Tools & Services
- **OpenAI API:** ~$50-100 for AI summaries
- **PDF Generation Library:** Free (jsPDF)
- **PostgreSQL:** Existing (no additional cost)

### Infrastructure
- **Database Storage:** +2GB (notes, papers)
- **CDN Bandwidth:** +5GB/month (PDF downloads)

---

## Next Steps

### Immediate Actions (Today)
1. [ ] Review and approve this implementation plan
2. [ ] Set up project tracking (GitHub Issues/Projects)
3. [ ] Create feature branches in Git
4. [ ] Begin collecting practice papers content
5. [ ] Schedule daily standup meetings

### Week 1 Kickoff
1. [ ] Start with Practice Papers feature
2. [ ] Database schema changes first
3. [ ] API development in parallel with content collection
4. [ ] Daily progress updates

---

## Questions & Clarifications Needed

1. **Content Sources:**
   - Where to source previous year papers?
   - Any copyright concerns with paper content?
   - Who will create/review study notes?

2. **Feature Scope:**
   - Should we include video solutions for papers?
   - Should notes support collaborative editing?
   - Any specific search features required?

3. **Launch Date:**
   - Is there a hard deadline for launch?
   - Can we do phased rollout?
   - Beta testing period needed?

---

**Document Owner:** Development Team  
**Stakeholders:** Product Manager, Engineering Lead, Content Team  
**Review Cycle:** Daily during implementation  
**Final Approval Required:** Before starting implementation

---

*This plan is a living document and will be updated as implementation progresses.*
