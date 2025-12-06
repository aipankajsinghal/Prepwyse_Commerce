# AI API Usage Monitoring and Cost Tracking

This document describes the AI API usage monitoring system that tracks OpenAI and Google Gemini API usage and generates alerts when costs exceed configured thresholds.

## Overview

The monitoring system automatically:
- Tracks every AI API call (tokens used, cost, duration)
- Calculates costs in real-time based on current API pricing
- Triggers alerts when usage exceeds daily, hourly, or monthly limits
- Logs failed API calls for debugging
- Provides detailed reporting and analytics

## Architecture

### Components

1. **`lib/ai-usage-monitor.ts`** - Core monitoring utility
   - `recordAPIUsage()` - Records API call to database
   - `calculateCost()` - Calculates cost based on tokens
   - `checkUsageAlerts()` - Checks if alerts should be triggered
   - `getUsageStats()` - Fetches aggregated usage statistics
   - `getDailyCostBreakdown()` - Daily cost analytics
   - `getEndpointUsageBreakdown()` - Cost breakdown by endpoint
   - `getRemainingBudget()` - Checks remaining monthly budget
   - `isWithinBudget()` - Boolean budget check

2. **Database Models**
   - `APIUsage` - Stores individual API calls (40+ million+ rows possible)
   - `APIUsageAlert` - Stores triggered alerts and thresholds

3. **`lib/ai-provider.ts`** - Integration point
   - Tracks usage automatically on all `generateChatCompletion()` calls
   - Records both successful and failed API calls
   - Captures token counts, duration, and metadata

4. **`app/api/admin/ai-usage/route.ts`** - Admin dashboard API
   - GET: View usage statistics, alerts, and budget
   - POST: Update alert thresholds

## Configuration

### Environment Variables

Set these in your `.env` file to customize alert thresholds:

```env
# Daily cost limit (default: $10)
API_USAGE_DAILY_LIMIT=10

# Hourly cost limit (default: $2)
API_USAGE_HOURLY_LIMIT=2

# Monthly budget (default: $300)
API_USAGE_MONTHLY_BUDGET=300

# Maximum API calls per day (default: 1000)
API_USAGE_CALLS_PER_DAY=1000
```

All values are optional and have sensible defaults.

## Token Pricing

The system uses current token pricing (as of 2024). Update prices in `lib/ai-usage-monitor.ts` if OpenAI or Google changes pricing:

### OpenAI
- **gpt-4**: $0.03/1K prompt tokens, $0.06/1K completion tokens
- **gpt-4-turbo**: $0.01/1K prompt tokens, $0.03/1K completion tokens
- **gpt-3.5-turbo**: $0.0005/1K prompt tokens, $0.0015/1K completion tokens

### Google Gemini
- **gemini-pro**: $0.0005/1K prompt tokens, $0.0015/1K completion tokens

## Alert System

### Alert Types

1. **Hourly Cost Alert** - Triggered when hourly cost exceeds `API_USAGE_HOURLY_LIMIT`
2. **Daily Cost Alert** - Triggered when daily cost exceeds `API_USAGE_DAILY_LIMIT`
3. **Daily Calls Alert** - Triggered when daily calls exceed `API_USAGE_CALLS_PER_DAY`
4. **Monthly Budget Alert** - Triggered when monthly cost exceeds `API_USAGE_MONTHLY_BUDGET`

### Alert Behavior

When an alert is triggered:
- Alert is recorded in `APIUsageAlert` table
- Warning is sent to Sentry for visibility
- Console warning is logged
- Admin can view all active alerts via `/api/admin/ai-usage` endpoint

### Alert Thresholds

Current default thresholds:
- Daily limit: **$10**
- Hourly limit: **$2**
- Monthly budget: **$300**
- Daily call limit: **1,000 calls**

## Usage Examples

### Recording API Usage

The system automatically records usage when `generateChatCompletion()` is called:

```typescript
import { generateChatCompletion } from '@/lib/ai-provider';

const result = await generateChatCompletion({
  prompt: 'User question',
  systemPrompt: 'You are helpful',
  userId: 'user-123',           // Optional - track which user called
  endpoint: 'generateAIQuestions', // Optional - endpoint name for analytics
  trackUsage: true,              // Default: true, set to false to disable tracking
});
```

### Checking Budget Status

```typescript
import {
  isWithinBudget,
  getRemainingBudget,
  getUsageStats,
} from '@/lib/ai-usage-monitor';

// Check if within budget
const within = await isWithinBudget('openai');

// Get remaining budget
const remaining = await getRemainingBudget('openai');
console.log(`$${remaining} remaining this month`);

// Get detailed statistics
const stats = await getUsageStats({
  provider: 'openai',
  endpoint: 'generateAIQuestions',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});

console.log(`Total cost: $${stats.totalCost}`);
console.log(`Total tokens: ${stats.totalTokens}`);
console.log(`Successful calls: ${stats.successfulCalls}`);
```

### Getting Usage Reports

```typescript
import {
  getDailyCostBreakdown,
  getEndpointUsageBreakdown,
} from '@/lib/ai-usage-monitor';

// Daily breakdown
const daily = await getDailyCostBreakdown('openai');
// Returns: [{ date: '2024-01-15', cost: '1.23', calls: 45 }, ...]

// Endpoint breakdown
const endpoints = await getEndpointUsageBreakdown('openai');
// Returns: [{ endpoint: 'generateAIQuestions', calls: 100, totalCost: '5.67', ... }, ...]
```

## Admin Dashboard API

### GET /api/admin/ai-usage

Fetch usage statistics and alerts.

**Query Parameters:**
- `provider` - AI provider: 'openai' or 'gemini' (default: 'openai')
- `timeRange` - Time range: 'all', 'today', 'week', or 'month' (default: 'all')

**Response:**
```json
{
  "statistics": {
    "totalCalls": 150,
    "successfulCalls": 148,
    "failedCalls": 2,
    "totalTokens": 45000,
    "promptTokens": 25000,
    "completionTokens": 20000,
    "totalCost": "1.234567",
    "averageDuration": 2500,
    "totalDuration": 375000
  },
  "dailyBreakdown": [
    { "date": "2024-01-15", "cost": "1.23", "calls": 45 },
    { "date": "2024-01-16", "cost": "0.89", "calls": 42 }
  ],
  "endpointBreakdown": [
    {
      "endpoint": "generateAIQuestions",
      "calls": 100,
      "totalTokens": 30000,
      "totalCost": "0.75",
      "averageCostPerCall": "0.0075"
    }
  ],
  "alerts": [
    {
      "id": "alert-123",
      "provider": "openai",
      "alertType": "daily_cost",
      "threshold": "10.00",
      "currentValue": "12.45",
      "isTriggered": true,
      "message": "Daily API cost exceeded limit..."
    }
  ],
  "budget": {
    "monthlyLimit": 300,
    "remaining": 287.65,
    "withinBudget": true
  },
  "thresholds": {
    "dailyCostLimit": 10,
    "hourlyCostLimit": 2,
    "monthlyBudget": 300,
    "callsPerDay": 1000
  }
}
```

### POST /api/admin/ai-usage

Update alert thresholds.

**Request Body:**
```json
{
  "provider": "openai",
  "alertType": "daily_cost",
  "threshold": 15
}
```

## Database Schema

### APIUsage Table

Stores individual API calls:

```sql
CREATE TABLE "APIUsage" (
  id TEXT PRIMARY KEY,
  provider TEXT,              -- 'openai' or 'gemini'
  model TEXT,                 -- 'gpt-4', 'gpt-3.5-turbo', etc.
  userId TEXT,                -- User who triggered call (nullable)
  endpoint TEXT,              -- Function that called (e.g., 'generateAIQuestions')
  promptTokens INTEGER,       -- Input tokens
  completionTokens INTEGER,   -- Output tokens
  totalTokens INTEGER,        -- Sum of prompt + completion
  estimatedCost DECIMAL,      -- Cost in USD
  responseLength INTEGER,     -- Character length of response
  duration INTEGER,           -- Milliseconds taken
  success BOOLEAN,            -- Whether call succeeded
  errorMessage TEXT,          -- Error if failed
  metadata JSONB,             -- Additional data
  createdAt TIMESTAMP
);

-- Indexes for fast querying
CREATE INDEX idx_provider_createdAt ON "APIUsage"(provider, createdAt);
CREATE INDEX idx_userId_createdAt ON "APIUsage"(userId, createdAt);
CREATE INDEX idx_endpoint_createdAt ON "APIUsage"(endpoint, createdAt);
CREATE INDEX idx_createdAt ON "APIUsage"(createdAt);
```

### APIUsageAlert Table

Stores alert states:

```sql
CREATE TABLE "APIUsageAlert" (
  id TEXT PRIMARY KEY,
  provider TEXT,              -- 'openai' or 'gemini'
  alertType TEXT,             -- 'daily_cost', 'hourly_cost', 'monthly_budget', 'daily_calls'
  threshold DECIMAL,          -- Alert threshold value
  currentValue DECIMAL,       -- Current usage value
  isTriggered BOOLEAN,        -- Whether alert is active
  notificationSent BOOLEAN,   -- Whether notification was sent
  sentAt TIMESTAMP,           -- When notification was sent
  message TEXT,               -- Alert message
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Indexes
CREATE INDEX idx_provider_alertType ON "APIUsageAlert"(provider, alertType);
CREATE INDEX idx_isTriggered ON "APIUsageAlert"(isTriggered);
```

## Performance Considerations

### Database Optimization

1. **Indexing** - Heavy usage can generate millions of rows
   - All indexes are created for optimal query performance
   - Daily aggregations should complete within seconds

2. **Data Retention**
   - Keep raw API usage logs for 3-6 months
   - Consider archiving older data to cold storage
   - Set up Prisma soft deletes if needed

3. **Query Optimization**
   - Aggregate queries use `_sum` and `_count` to avoid large result sets
   - Time-range queries are indexed for fast lookups
   - Consider denormalizing daily/monthly summaries if queries become slow

### Query Examples for DBA

```sql
-- Daily cost breakdown
SELECT
  DATE(created_at) as day,
  SUM(estimated_cost) as daily_cost,
  COUNT(*) as call_count
FROM "APIUsage"
WHERE provider = 'openai' AND success = true
GROUP BY DATE(created_at)
ORDER BY day DESC
LIMIT 30;

-- Cost by endpoint
SELECT
  endpoint,
  SUM(estimated_cost) as total_cost,
  COUNT(*) as call_count,
  AVG(total_tokens) as avg_tokens
FROM "APIUsage"
WHERE provider = 'openai' AND success = true
GROUP BY endpoint
ORDER BY total_cost DESC;

-- Hourly cost (current)
SELECT
  SUM(estimated_cost) as hourly_cost,
  COUNT(*) as call_count
FROM "APIUsage"
WHERE provider = 'openai'
  AND success = true
  AND created_at >= NOW() - INTERVAL '1 hour';
```

## Monitoring and Alerting

### Sentry Integration

Failed API calls and alerts are automatically sent to Sentry:

```
Sentry Tag: component=api-usage-monitor
Sentry Tags: alertType=daily_cost, provider=openai
```

### Recommended Monitoring

1. **Cost Alerts** - Set up Sentry alerts when daily cost exceeds $10
2. **Call Rate Alerts** - Set up alerts when daily calls exceed 1000
3. **Failed Call Monitoring** - Track failed API calls separately
4. **Budget Tracking** - Monthly dashboard to review actual vs. budgeted costs

## Troubleshooting

### Usage Not Being Recorded

1. Check if `trackUsage` is set to `false` in `generateChatCompletion()` call
2. Check database connection and migrations are applied
3. Check Sentry logs for recording errors
4. Verify database has `APIUsage` and `APIUsageAlert` tables

### Alerts Not Triggering

1. Check alert thresholds in environment variables
2. Verify usage queries are correct (`getUsageStats()`)
3. Check that usage records are being saved to database
4. Check Sentry for `checkUsageAlerts` errors

### Incorrect Cost Calculations

1. Verify token pricing in `PRICING` object matches current API prices
2. Ensure `completion.usage` is included in OpenAI responses
3. For Gemini, note that tokens are estimated (1 token ≈ 4 characters)

## Migration from Old System

If you had a previous usage tracking system:

1. Run Prisma migration: `npx prisma migrate deploy`
2. Ensure `APIUsage` and `APIUsageAlert` tables are created
3. Update any custom monitoring code to use new utility functions
4. Test with a small AI API call to verify tracking works

## Future Enhancements

Potential improvements:

1. **Multi-provider budgeting** - Set separate budgets for OpenAI vs. Gemini
2. **Per-user cost limits** - Prevent single users from excessive usage
3. **Predictive alerts** - Alert before reaching monthly budget
4. **Cost optimization suggestions** - Recommend cheaper models based on usage patterns
5. **Webhook notifications** - Send alerts to Slack, Discord, etc.
6. **Usage forecasting** - Predict end-of-month costs based on current trend
7. **A/B testing costs** - Compare cost of different model configurations

## Support

For questions or issues:
1. Check Sentry for detailed error logs
2. Review database queries in CloudWatch/DataDog
3. Check environment variable configuration
4. Verify token pricing is up-to-date
