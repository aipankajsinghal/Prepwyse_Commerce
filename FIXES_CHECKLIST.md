# ✅ Code Quality Fixes - Implementation Checklist

**Project:** PrepWyse Commerce  
**Review Date:** November 18, 2025  
**Status:** Ready for Implementation

This checklist tracks the implementation of all fixes identified in the code quality review.

---

## 🚨 Phase 1: Critical Fixes (Week 1)

### Must Fix Before Any Deployment

- [ ] **1. Fix Rules of Hooks Violation** ⚠️ CRITICAL
  - **File:** `app/quiz/[quizId]/attempt/page.tsx:52-60`
  - **Issue:** Conditional hook usage
  - **Estimated Time:** 30 minutes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Run app, take quiz, verify no crashes
  
- [ ] **2. Implement Admin Authorization Middleware** 🔐 CRITICAL SECURITY
  - **Files:** 
    - Create: `lib/auth/requireAdmin.ts`
    - Update: 8+ admin API routes
  - **Issue:** Missing admin role checks (severe security risk)
  - **Estimated Time:** 2 hours
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Test with non-admin user, should get 403
  - **Affected Routes:**
    - [ ] `app/api/admin/subscription-plans/route.ts`
    - [ ] `app/api/admin/subscription-plans/[id]/route.ts`
    - [ ] `app/api/question-generation/generate/route.ts`
    - [ ] `app/api/question-generation/questions/route.ts`
    - [ ] `app/api/question-generation/jobs/route.ts`
    - [ ] `app/api/question-generation/review/route.ts`
    - [ ] `app/api/admin/practice-papers/route.ts`
    - [ ] `app/api/admin/study-notes/route.ts`

- [ ] **3. Fix NPM Security Vulnerabilities** 🔒
  - **Command:** `npm install eslint-config-next@latest && npm audit fix`
  - **Issue:** 3 high severity vulnerabilities (glob)
  - **Estimated Time:** 10 minutes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Run `npm audit`, should show 0 vulnerabilities

- [ ] **4. Fix Deprecated Next.js Middleware** ⚠️
  - **File:** `middleware.ts` → `proxy.ts` (or update to new convention)
  - **Issue:** Deprecated middleware convention
  - **Estimated Time:** 15 minutes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Build succeeds without deprecation warning

**Phase 1 Sign-off:** _______________ Date: ___________

---

## ⚠️ Phase 2: High Priority Fixes (Week 2)

### Fix These Before Production Launch

- [ ] **5. Fix Unescaped Entities in JSX** (22 instances)
  - **Estimated Time:** 15 minutes (mostly automated)
  - **Command:** `npm run lint -- --fix`
  - **Manual Fixes Required:**
    - [ ] `app/admin/page.tsx:48`
    - [ ] `app/analytics/page.tsx:274`
    - [ ] `app/gamification/page.tsx:113`
    - [ ] `app/offline/page.tsx:15, 19`
    - [ ] `app/privacy/page.tsx:231`
    - [ ] `app/recommendations/page.tsx:230`
    - [ ] `app/study-planner/page.tsx:137`
    - [ ] `app/terms/page.tsx:43, 198, 200`
    - [ ] `components/ErrorBoundary.tsx:57`
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** `npm run lint` shows 0 errors

- [ ] **6. Fix Missing React Hook Dependencies** (14 warnings)
  - **Estimated Time:** 1 hour
  - **Files to Update:**
    - [ ] `app/adaptive-learning/page.tsx:69`
    - [ ] `app/admin/question-generation/page.tsx:60`
    - [ ] `app/practice-papers/[id]/page.tsx:46`
    - [ ] `app/practice-papers/page.tsx:40`
    - [ ] `app/quiz/[quizId]/attempt/page.tsx:103, 110`
    - [ ] `app/search/page.tsx:44`
    - [ ] `app/study-notes/[chapterId]/page.tsx:44`
    - [ ] `app/study-notes/view/[id]/page.tsx:47`
    - [ ] `components/OnboardingProvider.tsx:46`
    - [ ] `components/flashcards/FlashcardReview.tsx:32`
    - [ ] `components/gamification/LeaderboardWidget.tsx:27`
    - [ ] `components/study-planner/StudyCalendar.tsx:25`
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** `npm run lint` shows 0 warnings

- [ ] **7. Replace Console.log with Proper Logging** (154+ instances)
  - **Estimated Time:** 2 hours
  - **Steps:**
    1. [ ] Create `lib/logger.ts` utility
    2. [ ] Replace production console.log calls
    3. [ ] Keep intentional logs (e.g., GDPR events)
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Search codebase, only logger.* or intentional logs remain

- [ ] **8. Fix Type-Unsafe Error Handling** (17 instances)
  - **Estimated Time:** 1 hour
  - **Pattern:** Change `catch (error: any)` to proper typing
  - **Files:** Multiple API routes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** No `error: any` in catch blocks

- [ ] **9. Update Outdated Dependencies**
  - **Estimated Time:** 10 minutes
  - **Commands:**
    ```bash
    npm install eslint@latest
    npm install eslint-config-next@latest
    npm install rimraf@latest
    ```
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** No deprecation warnings in npm install

- [ ] **10. Fix Missing Image Optimization**
  - **File:** `app/profile/page.tsx:96`
  - **Change:** `<img>` → `<Image>` from next/image
  - **Estimated Time:** 5 minutes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Build succeeds, no img warnings

- [ ] **11. Standardize Async Patterns**
  - **File:** `app/api/search/suggestions/route.ts:47-63` (and others)
  - **Change:** Replace `.then()` with `async/await`
  - **Estimated Time:** 1 hour
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** Code review confirms consistency

- [ ] **12. Standardize API Route Imports**
  - **Pattern:** Use `NextRequest` consistently instead of mixing with `Request`
  - **Estimated Time:** 30 minutes
  - **Assignee:** _____________
  - **PR:** #_____
  - **Verification:** All API routes use consistent import pattern

**Phase 2 Sign-off:** _______________ Date: ___________

---

## 📋 Phase 3: Code Quality Improvements (Week 3)

### Clean Up Technical Debt

- [ ] **13. Address TODO Comments** (9 instances)
  - **Estimated Time:** 2 hours
  - **Items:**
    - [ ] Get actual admin name from Clerk (8 files)
    - [ ] Complete all admin role checks (verification)
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **14. Remove Unused Dependencies**
  - **Command:** `npm uninstall recharts papaparse`
  - **Verify:** Search codebase first to confirm unused
  - **Estimated Time:** 10 minutes
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **15. Update Deprecated Prisma Configuration**
  - **Create:** `prisma/prisma.config.ts`
  - **Remove:** `prisma` field from package.json
  - **Estimated Time:** 15 minutes
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **16. Add ESLint Rule for Console**
  - **File:** `.eslintrc.json`
  - **Add:** Rule to warn/error on console.log
  - **Estimated Time:** 5 minutes
  - **Assignee:** _____________
  - **PR:** #_____

**Phase 3 Sign-off:** _______________ Date: ___________

---

## 🏗️ Phase 4: Refactoring & Architecture (Week 4)

### Improve Code Structure

- [ ] **17. Extract Common Error Handling**
  - **Create:** `lib/api/errorHandler.ts`
  - **Create:** `APIError` class
  - **Update:** All API routes to use new handler
  - **Estimated Time:** 3 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **18. Create Admin Authorization Utility**
  - **File:** `lib/auth/requireAdmin.ts` (already done in Phase 1)
  - **Verify:** All admin routes use it
  - **Status:** ✅ Covered in Phase 1, Item 2

- [ ] **19. Centralize Database Queries**
  - **Create:** Service layer
    - [ ] `lib/services/quizService.ts`
    - [ ] `lib/services/userService.ts`
    - [ ] `lib/services/subscriptionService.ts`
  - **Refactor:** API routes to use services
  - **Estimated Time:** 6 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **20. Improve Type Definitions**
  - **Create:** `types/api.ts` for shared API types
  - **Create:** `types/models.ts` for domain models
  - **Estimated Time:** 2 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **21. Add API Rate Limiting**
  - **Create:** `lib/middleware/rateLimit.ts`
  - **Update:** Critical API routes
  - **Consider:** Using Upstash Rate Limit for production
  - **Estimated Time:** 3 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **22. Add Input Validation**
  - **Install:** `zod` for schema validation
  - **Create:** Validation schemas for API inputs
  - **Update:** API routes to validate inputs
  - **Estimated Time:** 4 hours
  - **Assignee:** _____________
  - **PR:** #_____

**Phase 4 Sign-off:** _______________ Date: ___________

---

## 🧪 Phase 5: Testing & Documentation (Week 5)

### Establish Quality Assurance

- [ ] **23. Setup Testing Infrastructure**
  - **Install:** jest, @testing-library/react, @testing-library/jest-dom
  - **Create:** jest.config.js
  - **Create:** `__tests__/` directory structure
  - **Estimated Time:** 1 hour
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **24. Add Unit Tests for Critical Functions**
  - **Priority Tests:**
    - [ ] AI Provider selection logic
    - [ ] Quiz attempt service
    - [ ] Admin authorization
    - [ ] Error handling utilities
  - **Target:** 40% coverage
  - **Estimated Time:** 6 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **25. Add Integration Tests for API Routes**
  - **Priority Routes:**
    - [ ] Quiz creation and attempts
    - [ ] Admin subscription management
    - [ ] Question generation
    - [ ] User authentication flows
  - **Target:** 30% coverage
  - **Estimated Time:** 6 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **26. Add Request Logging**
  - **Create:** `lib/middleware/logger.ts`
  - **Update:** API routes to log requests
  - **Estimated Time:** 2 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **27. Update Documentation**
  - **Update:** TECHNICAL_DOCUMENTATION.md
  - **Update:** README.md with testing instructions
  - **Update:** CONTRIBUTING.md with code standards
  - **Estimated Time:** 2 hours
  - **Assignee:** _____________
  - **PR:** #_____

- [ ] **28. Add Performance Monitoring**
  - **Consider:** Add response time tracking
  - **Consider:** Database query performance monitoring
  - **Estimated Time:** 3 hours
  - **Assignee:** _____________
  - **PR:** #_____

**Phase 5 Sign-off:** _______________ Date: ___________

---

## 📊 Progress Tracking

### Overall Progress

```
Phase 1 (Critical):     [ ] 0/4   (0%)
Phase 2 (High):         [ ] 0/8   (0%)
Phase 3 (Quality):      [ ] 0/4   (0%)
Phase 4 (Refactor):     [ ] 0/6   (0%)
Phase 5 (Testing):      [ ] 0/6   (0%)
──────────────────────────────────────
Total:                  [ ] 0/28  (0%)
```

### Metrics Progress

| Metric | Before | Target | Current | Status |
|--------|--------|--------|---------|--------|
| ESLint Errors | 22 | 0 | 22 | 🔴 |
| ESLint Warnings | 14 | 0 | 14 | 🔴 |
| Security Vulnerabilities | 3 | 0 | 3 | 🔴 |
| Test Coverage | 0% | 60% | 0% | 🔴 |
| Type Safety | 83% | 100% | 83% | 🟡 |
| Console.log Count | 154+ | 0 | 154+ | 🔴 |

---

## 🎯 Definition of Done

### For Each Item
- [ ] Code changes completed
- [ ] Code reviewed by team member
- [ ] Tests added (if applicable)
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Verified in staging environment
- [ ] PR approved and merged

### For Each Phase
- [ ] All items in phase completed
- [ ] Regression testing passed
- [ ] Metrics improved as expected
- [ ] Team sign-off obtained
- [ ] Changes documented

### For Overall Project
- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Test coverage > 60%
- [ ] Zero security vulnerabilities
- [ ] Build succeeds without warnings
- [ ] Performance benchmarks met
- [ ] Production deployment approved

---

## 📝 Notes & Decisions

### Phase 1 Notes
- Date: ___________
- Notes: ___________________________________________________________
- Blockers: ________________________________________________________
- Decisions: _______________________________________________________

### Phase 2 Notes
- Date: ___________
- Notes: ___________________________________________________________
- Blockers: ________________________________________________________
- Decisions: _______________________________________________________

### Phase 3 Notes
- Date: ___________
- Notes: ___________________________________________________________
- Blockers: ________________________________________________________
- Decisions: _______________________________________________________

### Phase 4 Notes
- Date: ___________
- Notes: ___________________________________________________________
- Blockers: ________________________________________________________
- Decisions: _______________________________________________________

### Phase 5 Notes
- Date: ___________
- Notes: ___________________________________________________________
- Blockers: ________________________________________________________
- Decisions: _______________________________________________________

---

## 🚀 Quick Reference Commands

### Before Starting Work
```bash
git pull origin main
git checkout -b fix/issue-name
npm install
```

### During Development
```bash
# Check what you're fixing
npm run lint
npx tsc --noEmit
npm audit

# Run tests (once setup)
npm test
npm test -- --coverage
```

### Before Committing
```bash
# Verify your changes
npm run lint
npm run build
npm test

# Commit with conventional commits
git commit -m "fix: description of fix"
```

### After Completion
```bash
git push origin fix/issue-name
# Create PR on GitHub
# Request review
# Address feedback
# Merge when approved
```

---

## 📞 Support

- **Questions?** See [CODE_REVIEW_FINDINGS.md](./CODE_REVIEW_FINDINGS.md)
- **Technical Details?** See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- **Quick Reference?** See [REVIEW_SUMMARY.md](./REVIEW_SUMMARY.md)

---

**Checklist Version:** 1.0  
**Last Updated:** November 18, 2025  
**Review Status:** Complete ✅  
**Implementation Status:** Not Started ⏳
