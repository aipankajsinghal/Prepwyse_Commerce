# AI-Generated Mock Tests and Quizzes Guide

## Overview

PrepWyse Commerce now supports AI-powered generation of mock tests and quizzes, eliminating the need for manually seeded content. Users can create custom assessments on-demand with AI-generated questions.

---

## Features

### 1. AI-Generated Mock Tests

Create complete mock tests with custom specifications:

**Customization Options:**
- **Title**: Custom test name
- **Exam Type**: CUET, Class 11, or Class 12
- **Duration**: 30-300 minutes
- **Sections**: Multiple sections with configurable question counts
- **Description**: Optional test description

**AI-Generated Content:**
- Multiple-choice questions with 4 options each
- Correct answers with detailed explanations
- Mixed difficulty levels (40% easy, 40% medium, 20% hard)
- Exam-pattern focused questions
- Comprehensive topic coverage

### 2. AI-Generated Quizzes (Already Implemented)

Create practice quizzes based on specific chapters:

**Customization Options:**
- **Subject Selection**: Business Studies, Accountancy, Economics
- **Chapter Selection**: Single or multiple chapters
- **Question Count**: 5-25 questions
- **Difficulty**: Easy, Medium, Hard, or Adaptive
- **Duration**: 10-45 minutes

**AI Features:**
- Adaptive difficulty based on user performance
- Personalized question selection
- Chapter-specific content
- Performance-based recommendations

---

## How to Use

### Generating AI Mock Tests

1. **Navigate to Mock Tests**
   ```
   Go to: /mock-test
   ```

2. **Click "Generate AI Mock Test"**
   - Button located in top-right corner
   - Opens AI generator modal

3. **Configure Test Parameters**
   ```
   Title: e.g., "CUET Commerce Practice Test 1"
   Exam Type: Select from CUET, Class 11, or Class 12
   Duration: e.g., 120 minutes
   Description: Optional brief description
   ```

4. **Configure Sections**
   ```
   Default sections:
   - Business Studies: 40 questions
   - Accountancy: 30 questions
   - Economics: 30 questions
   
   You can:
   - Add new sections (+ Add Section)
   - Remove sections (X button)
   - Adjust question counts
   - Rename sections
   ```

5. **Generate**
   - Click "Generate Mock Test"
   - Wait for AI to generate (10-30 seconds)
   - Test appears in your mock test list
   - Ready to start immediately

### Generating AI Quizzes

1. **Navigate to Quiz Creation**
   ```
   Go to: /quiz
   ```

2. **Select Subject and Chapters**
   - Choose one subject
   - Select one or more chapters
   - Or use "Select All" for comprehensive quiz

3. **Configure Quiz Settings**
   ```
   Enable AI-Powered Quiz: ✓ ON
   Difficulty: Adaptive (recommended)
   Question Count: 10 (or choose 5-25)
   ```

4. **Generate and Start**
   - Click "Generate AI Quiz"
   - Questions are created instantly
   - Redirected to quiz attempt page

---

## API Endpoints

### POST `/api/ai/generate-mock-test`

Generate a complete AI-powered mock test.

**Request Body:**
```json
{
  "title": "CUET Commerce Full Mock Test",
  "examType": "CUET",
  "description": "Complete test based on CUET pattern",
  "duration": 120,
  "totalQuestions": 100,
  "sections": [
    { "name": "Business Studies", "questions": 40 },
    { "name": "Accountancy", "questions": 30 },
    { "name": "Economics", "questions": 30 }
  ]
}
```

**Response:**
```json
{
  "mockTestId": "clm123...",
  "mockTest": {
    "id": "clm123...",
    "title": "CUET Commerce Full Mock Test",
    "examType": "CUET",
    "description": "Complete test based on CUET pattern",
    "duration": 120,
    "totalQuestions": 100
  },
  "questions": [
    {
      "questionNumber": 1,
      "section": "Business Studies",
      "questionText": "What is management?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation...",
      "difficulty": "easy"
    }
    // ... 99 more questions
  ],
  "message": "AI mock test generated successfully",
  "questionsGenerated": 100
}
```

**Error Responses:**
- `400` - Invalid input (validation errors)
- `401` - Unauthorized (not logged in)
- `503` - AI service unavailable
- `500` - Server error

### POST `/api/ai/generate-quiz`

Generate AI-powered quiz questions for selected chapters.

**Request Body:**
```json
{
  "subjectId": "clm456...",
  "chapterIds": ["clm789...", "clm012..."],
  "questionCount": 10,
  "difficulty": null
}
```

**Response:**
```json
{
  "quizId": "clm345...",
  "message": "AI quiz generated successfully",
  "adaptiveDifficulty": "medium"
}
```

---

## AI Configuration

### Required Environment Variables

Choose ONE of the following AI providers:

**Option 1: OpenAI (Recommended)**
```bash
OPENAI_API_KEY=sk-...
```

**Option 2: Google Gemini**
```bash
GEMINI_API_KEY=...
```

### Provider Selection

The system automatically selects the available provider:
1. **Priority 1**: OpenAI (if configured)
2. **Priority 2**: Google Gemini (fallback)

If both are configured, OpenAI is used by default.

### Cost Considerations

**OpenAI Pricing (GPT-4o-mini):**
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens

**Average Costs:**
- Quiz (10 questions): ~$0.01
- Mock Test (100 questions): ~$0.10

**Token Limits:**
- Quiz: 4,000 tokens (default)
- Mock Test: 8,000 tokens (can generate ~100 questions)

---

## Technical Implementation

### AI Services (`lib/ai-services.ts`)

**Core Functions:**

1. **`generateAIQuestions()`**
   ```typescript
   // Generates quiz questions for specific chapters
   const questions = await generateAIQuestions({
     subjectName: "Business Studies",
     chapterNames: ["Chapter 1", "Chapter 2"],
     questionCount: 10,
     difficulty: "medium",
     userId: "user123"
   });
   ```

2. **`generateAIMockTest()`**
   ```typescript
   // Generates complete mock test with sections
   const mockTest = await generateAIMockTest({
     title: "CUET Mock Test",
     examType: "CUET",
     duration: 120,
     totalQuestions: 100,
     sections: [...]
   });
   ```

3. **`determineAdaptiveDifficulty()`**
   ```typescript
   // Analyzes last 10 quiz attempts to determine difficulty
   const difficulty = await determineAdaptiveDifficulty(userId);
   // Returns: "easy" | "medium" | "hard"
   ```

### AI Provider (`lib/ai-provider.ts`)

**Provider Management:**
- Automatic provider selection
- Fallback mechanism
- Error handling and retry logic
- JSON mode support
- Temperature and token control

**Usage Example:**
```typescript
const response = await generateChatCompletion({
  prompt: "Your prompt here",
  systemPrompt: "You are an expert...",
  temperature: 0.7,
  maxTokens: 4000,
  jsonMode: true
});
```

---

## Question Quality

### AI Prompt Engineering

The system uses carefully crafted prompts to ensure high-quality questions:

**Mock Test Prompt Includes:**
- Exam type and duration context
- Section-wise question distribution
- Difficulty level requirements
- Multiple-choice format specifications
- Explanation requirements
- Exam-pattern focus
- Conceptual understanding emphasis

**Quiz Prompt Includes:**
- Subject and chapter context
- User performance history
- Difficulty level matching
- Indian commerce curriculum alignment
- Practical, exam-focused questions

### Validation

All AI-generated content is validated:
- JSON format verification
- Required fields check
- Option count validation (must be 4)
- Correctness verification
- Explanation presence check

---

## Advantages Over Seed Files

### ✅ Benefits of AI Generation

1. **Unlimited Content**
   - Generate as many tests as needed
   - No storage limitations
   - Fresh questions every time

2. **Customization**
   - Tailor tests to specific needs
   - Adjust difficulty on-demand
   - Custom section configurations

3. **Scalability**
   - No manual content creation
   - Instant availability
   - Supports all exam types

4. **Personalization**
   - Adaptive to user performance
   - Performance-based difficulty
   - Targeted weak areas

5. **Maintenance**
   - No seed file updates needed
   - Automatic curriculum alignment
   - Always up-to-date content

### ⚠️ Considerations

1. **API Costs**
   - Requires AI API key
   - Usage-based pricing
   - Monitor token consumption

2. **Generation Time**
   - 10-30 seconds per test
   - Network dependent
   - Requires internet connection

3. **Quality Variance**
   - AI-generated content may vary
   - Review mechanism recommended
   - User feedback important

---

## Fallback Strategy

If AI is not configured or fails:

1. **Seed File Data**
   - Original seed file remains
   - Contains sample mock tests
   - Use `npm run seed` to populate

2. **Manual Creation**
   - Admin can create tests manually
   - Use admin panel (future feature)
   - Direct database insertion

3. **Error Handling**
   - Clear error messages
   - Fallback to seed data prompt
   - Retry mechanism

---

## Best Practices

### For Users

1. **Mock Test Generation**
   - Use realistic exam patterns
   - Set appropriate durations
   - Balance section question counts
   - Review generated tests before using

2. **Quiz Generation**
   - Select relevant chapters
   - Use adaptive difficulty initially
   - Adjust based on performance
   - Take advantage of explanations

### For Developers

1. **API Key Management**
   - Store in environment variables
   - Never commit to repository
   - Rotate keys periodically
   - Monitor usage and costs

2. **Error Handling**
   - Implement retry logic
   - Provide clear error messages
   - Log failures for debugging
   - Fallback to seed data when needed

3. **Performance Optimization**
   - Cache generated content
   - Implement rate limiting
   - Monitor token usage
   - Optimize prompts for efficiency

---

## Troubleshooting

### AI Generation Fails

**Problem**: "AI generation failed" error

**Solutions**:
1. Check API key is configured correctly
2. Verify API key has sufficient credits
3. Check network connectivity
4. Try with smaller question count
5. Switch to alternative AI provider

### Invalid Response Format

**Problem**: "Invalid AI response format" error

**Solutions**:
1. Review prompt engineering
2. Enable JSON mode in AI settings
3. Increase max tokens limit
4. Retry generation
5. Check AI provider status

### Slow Generation

**Problem**: Generation takes too long

**Solutions**:
1. Reduce total question count
2. Simplify section structure
3. Check network speed
4. Use fewer sections
5. Consider caching strategy

---

## Future Enhancements

1. **Question Bank**
   - Store generated questions
   - Reuse high-quality questions
   - Build comprehensive database

2. **Admin Review**
   - Review and approve questions
   - Edit AI-generated content
   - Flag inappropriate content

3. **Analytics**
   - Track question difficulty accuracy
   - Monitor student performance
   - Identify weak question areas

4. **Advanced Customization**
   - Topic-specific generation
   - Skill-based targeting
   - Multi-language support

5. **Batch Generation**
   - Generate multiple tests at once
   - Scheduled generation
   - Bulk export options

---

## Resources

### Documentation
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Support
- Check `ISSUES_FIXED.md` for resolved issues
- Review `TECHNICAL_DOCUMENTATION.md` for architecture
- Consult `README.md` for setup instructions

---

## Summary

AI-generated mock tests and quizzes provide:
- **Unlimited** fresh content
- **Customizable** to any specification
- **Adaptive** to user performance
- **Scalable** without manual effort
- **Cost-effective** with proper configuration

The system is production-ready and can generate high-quality assessments on-demand, making PrepWyse Commerce a truly AI-powered educational platform.
