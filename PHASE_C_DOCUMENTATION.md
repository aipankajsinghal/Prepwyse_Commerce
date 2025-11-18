# Phase C Implementation Documentation

This document provides comprehensive documentation for Phase C features implemented in PrepWyse Commerce.

## Overview

Phase C introduces monetization and advanced management features including:
- **Subscription System**: Admin-managed subscription plans with Razorpay integration
- **Referral Program**: User referral system with rewards
- **Advanced Admin Dashboard**: Analytics and monitoring (planned)
- **Content Management System**: Bulk upload and versioning (planned)

---

## 1. Subscription System

### Features
- **Admin-Managed Plans**: Admins create and manage subscription plans
- **1-Day Free Trial**: Every new user gets 1-day trial (no free plan)
- **Razorpay Integration**: Indian payment gateway for subscriptions
- **Multiple Plans**: Support for Basic, Premium, Pro tiers
- **Auto-Renewal**: Automatic subscription renewal
- **Subscription Management**: Cancel, extend, view status

### Database Models

#### SubscriptionPlan
```typescript
model SubscriptionPlan {
  id              String         @id @default(cuid())
  name            String         @unique // "basic", "premium", "pro"
  displayName     String         // "Premium Plan"
  description     String
  price           Decimal        @db.Decimal(10, 2) // Monthly price in INR
  durationDays    Int            // 30, 90, 365
  features        Json           // Array of features
  isActive        Boolean        @default(true)
  order           Int            @default(0) // Display order
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  subscriptions   Subscription[]
}
```

#### Subscription
```typescript
model Subscription {
  id                  String           @id @default(cuid())
  userId              String           @unique
  user                User             @relation(fields: [userId], references: [id])
  planId              String
  plan                SubscriptionPlan @relation(fields: [planId], references: [id])
  status              String           @default("trial") // "trial", "active", "cancelled", "expired"
  razorpayOrderId     String?
  razorpayPaymentId   String?
  razorpaySignature   String?
  trialEndsAt         DateTime?
  startDate           DateTime         @default(now())
  endDate             DateTime
  autoRenew           Boolean          @default(true)
  cancelledAt         DateTime?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
}
```

#### Transaction
```typescript
model Transaction {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id])
  type                String   // "subscription", "referral_bonus"
  amount              Decimal  @db.Decimal(10, 2)
  currency            String   @default("INR")
  status              String   // "pending", "completed", "failed", "refunded"
  razorpayOrderId     String?
  razorpayPaymentId   String?
  razorpaySignature   String?
  description         String?
  metadata            Json?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### API Endpoints

#### Admin Endpoints

##### `GET /api/admin/subscription-plans`
List all subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "plan_id",
      "name": "premium",
      "displayName": "Premium Plan",
      "description": "Access to all features",
      "price": "499.00",
      "durationDays": 30,
      "features": ["Unlimited quizzes", "AI recommendations", "Priority support"],
      "isActive": true,
      "order": 1
    }
  ]
}
```

##### `POST /api/admin/subscription-plans`
Create new subscription plan (admin only).

**Request:**
```json
{
  "name": "premium",
  "displayName": "Premium Plan",
  "description": "Access to all premium features",
  "price": 499.00,
  "durationDays": 30,
  "features": ["Unlimited quizzes", "AI recommendations", "Priority support"],
  "isActive": true,
  "order": 1
}
```

##### `GET /api/admin/subscription-plans/[id]`
Get single subscription plan.

##### `PATCH /api/admin/subscription-plans/[id]`
Update subscription plan (admin only).

##### `DELETE /api/admin/subscription-plans/[id]`
Delete subscription plan (admin only). Cannot delete plans with active subscriptions.

#### User Endpoints

##### `GET /api/subscription/status`
Get current user's subscription status.

**Response:**
```json
{
  "status": {
    "hasSubscription": true,
    "isActive": true,
    "isTrial": false,
    "daysRemaining": 15,
    "plan": {
      "id": "plan_id",
      "name": "premium",
      "displayName": "Premium Plan",
      "price": "499.00"
    },
    "endDate": "2025-12-31T23:59:59.000Z"
  }
}
```

##### `POST /api/subscription/trial`
Start 1-day free trial for new users.

**Response:**
```json
{
  "subscription": {
    "id": "sub_id",
    "status": "trial",
    "trialEndsAt": "2025-11-19T08:00:00.000Z",
    "endDate": "2025-11-19T08:00:00.000Z"
  },
  "message": "Trial subscription started successfully"
}
```

##### `POST /api/subscription/create-order`
Create Razorpay order for subscription payment.

**Request:**
```json
{
  "planId": "plan_id"
}
```

**Response:**
```json
{
  "order": {
    "id": "order_MkABCD1234567890",
    "amount": 49900,
    "currency": "INR"
  },
  "plan": {
    "id": "plan_id",
    "name": "Premium Plan",
    "price": "499.00",
    "durationDays": 30
  }
}
```

##### `POST /api/subscription/verify`
Verify Razorpay payment and activate subscription.

**Request:**
```json
{
  "razorpay_order_id": "order_MkABCD1234567890",
  "razorpay_payment_id": "pay_MkABCD1234567890",
  "razorpay_signature": "signature_hash",
  "planId": "plan_id"
}
```

**Response:**
```json
{
  "subscription": {
    "id": "sub_id",
    "status": "active",
    "endDate": "2025-12-18T08:00:00.000Z"
  },
  "message": "Payment verified and subscription activated successfully"
}
```

##### `POST /api/subscription/cancel`
Cancel user's active subscription.

**Response:**
```json
{
  "subscription": {
    "id": "sub_id",
    "status": "cancelled",
    "cancelledAt": "2025-11-18T08:00:00.000Z"
  },
  "message": "Subscription cancelled successfully. Access will continue until the end date."
}
```

### Payment Flow

1. **User selects a plan** → Call `POST /api/subscription/create-order`
2. **Receive Razorpay order ID** → Initialize Razorpay checkout
3. **User completes payment** on Razorpay
4. **Razorpay callback** with payment details
5. **Verify payment** → Call `POST /api/subscription/verify`
6. **Subscription activated** → User gets access to premium features

### Razorpay Integration

#### Client-Side Integration
```javascript
// Load Razorpay script
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Initialize payment
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount, // in paise
  currency: order.currency,
  name: 'PrepWyse Commerce',
  description: 'Subscription Payment',
  order_id: order.id,
  handler: async function (response) {
    // Verify payment
    await fetch('/api/subscription/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        planId: selectedPlanId,
      }),
    });
  },
  prefill: {
    name: user.name,
    email: user.email,
  },
  theme: {
    color: '#3B82F6',
  },
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### Subscription Utilities

The `lib/subscription.ts` file provides helper functions:

- `hasActiveSubscription(userId)` - Check if user has active subscription
- `getUserSubscription(userId)` - Get user's subscription details
- `isInTrial(userId)` - Check if user is in trial period
- `getDaysRemaining(userId)` - Get days until subscription expires
- `createTrialSubscription(userId, planId)` - Start trial
- `activateSubscription(userId, planId, durationDays, ...)` - Activate paid subscription
- `cancelSubscription(userId)` - Cancel subscription
- `extendSubscription(userId, daysToAdd)` - Add days (for rewards)
- `canAccessPremiumFeatures(userId)` - Check premium access
- `getSubscriptionStatus(userId)` - Get complete status

---

## 2. Referral Program

### Features
- **Unique Referral Codes**: Each user gets a unique code
- **Sign-Up Rewards**: 50 points when someone signs up
- **Subscription Rewards**: 7 days premium when referee subscribes
- **Referral Tracking**: Track all referrals and their status
- **Leaderboard**: Top referrers ranking
- **Automatic Reward Application**: Rewards applied automatically

### Database Models

#### Referral
```typescript
model Referral {
  id              String    @id @default(cuid())
  referrerId      String
  referrer        User      @relation(fields: [referrerId], references: [id])
  refereeEmail    String
  refereeUserId   String?   // Set when referee signs up
  status          String    @default("pending") // "pending", "signed_up", "subscribed"
  subscribedAt    DateTime?
  createdAt       DateTime  @default(now())
}
```

#### ReferralReward
```typescript
model ReferralReward {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  referralId      String?
  type            String   // "referral_signup", "referral_subscription"
  rewardType      String   // "premium_days", "points", "discount"
  rewardValue     Int      // Number of days, points, or percentage
  description     String
  applied         Boolean  @default(false)
  appliedAt       DateTime?
  expiresAt       DateTime?
  createdAt       DateTime @default(now())
}
```

### API Endpoints

##### `GET /api/referral/code`
Get or create user's referral code.

**Response:**
```json
{
  "referralCode": "JOHN1A2B",
  "referralUrl": "https://prepwyse.com/sign-up?ref=JOHN1A2B"
}
```

##### `POST /api/referral/apply`
Apply referral code for new user.

**Request:**
```json
{
  "referralCode": "JOHN1A2B"
}
```

**Response:**
```json
{
  "message": "Referral code applied successfully! Your referrer has been rewarded."
}
```

##### `GET /api/referral/stats`
Get user's referral statistics and rewards.

**Response:**
```json
{
  "stats": {
    "totalReferrals": 10,
    "signedUpReferrals": 8,
    "subscribedReferrals": 5,
    "totalRewards": 15,
    "appliedRewards": 12,
    "pendingRewards": 3
  },
  "recentReferrals": [
    {
      "id": "ref_id",
      "refereeEmail": "friend@example.com",
      "status": "subscribed",
      "createdAt": "2025-11-18T08:00:00.000Z"
    }
  ],
  "rewards": [
    {
      "id": "reward_id",
      "type": "referral_subscription",
      "rewardType": "premium_days",
      "rewardValue": 7,
      "description": "Earned 7 days of premium for referring a subscriber",
      "applied": true,
      "appliedAt": "2025-11-18T08:00:00.000Z"
    }
  ]
}
```

##### `GET /api/referral/leaderboard?limit=10`
Get referral leaderboard.

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user_id",
      "userName": "John Doe",
      "referralCount": 15,
      "subscribedCount": 10
    }
  ]
}
```

### Referral Flow

1. **User gets referral code** → Call `GET /api/referral/code`
2. **Share referral link** with friends
3. **Friend signs up** with `?ref=CODE` parameter
4. **Friend applies code** → Call `POST /api/referral/apply`
5. **Referrer gets 50 points** immediately
6. **Friend subscribes** → Referrer gets 7 days premium
7. **Rewards tracked** in ReferralReward model

### Referral Code Generation

Referral codes are generated using:
- User's name (first 6 alphanumeric characters)
- Random 4-character suffix
- Example: `JOHN1A2B`, `ALICE3C4D`

Codes are unique and validated before creation.

### Reward System

#### Sign-Up Reward
- **Type**: Points
- **Value**: 50 points
- **Applied**: Immediately upon referee sign-up

#### Subscription Reward
- **Type**: Premium Days
- **Value**: 7 days
- **Applied**: When referee subscribes OR when referrer subscribes (whichever is later)

If referrer doesn't have a subscription when referee subscribes, the reward is marked as "pending" and automatically applied when referrer subscribes.

---

## 3. Content Management System (Planned)

### Planned Features
- Bulk question upload via CSV/Excel
- Question editor with preview
- Version control for questions
- Content scheduling
- Tagging system
- Difficulty calibration

### Database Models (Already Added)

#### QuestionVersion
```typescript
model QuestionVersion {
  id              String   @id @default(cuid())
  questionId      String
  versionNumber   Int      @default(1)
  questionText    String
  options         Json
  correctAnswer   String
  explanation     String?
  difficulty      String
  tags            Json?
  changedBy       String   // User/admin who made the change
  changeReason    String?
  createdAt       DateTime @default(now())
}
```

#### ContentSchedule
```typescript
model ContentSchedule {
  id              String   @id @default(cuid())
  contentType     String   // "question", "chapter", "quiz", "flashcard"
  contentId       String
  scheduledFor    DateTime
  action          String   // "publish", "unpublish", "update"
  status          String   @default("pending")
  executedAt      DateTime?
  metadata        Json?
  createdBy       String
  createdAt       DateTime @default(now())
}
```

---

## 4. Admin Activity Logging

### AdminActivity Model
```typescript
model AdminActivity {
  id              String   @id @default(cuid())
  adminId         String   // Clerk user ID
  adminName       String
  action          String   // "create", "update", "delete", "bulk_upload"
  resourceType    String   // "question", "user", "subscription_plan"
  resourceId      String?
  description     String
  metadata        Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())
}
```

This model tracks all admin actions for audit and compliance purposes.

---

## Environment Variables

Add to your `.env` file:

```bash
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use Razorpay live credentials instead of test mode.

---

## Security Considerations

### Payment Security
- Razorpay signature verification on server-side
- No sensitive keys exposed to client
- Transaction logging for audit trail
- HTTPS required for production

### Referral Security
- Unique referral codes
- Prevention of self-referrals
- One-time use per user
- Reward validation before application

### Admin Access
- TODO: Implement role-based access control
- Admin endpoints should verify admin role
- Activity logging for all admin actions

---

## Testing Phase C Features

### Subscription Testing

1. **Create Subscription Plans** (Admin)
   ```bash
   POST /api/admin/subscription-plans
   {
     "name": "premium",
     "displayName": "Premium Plan",
     "description": "All features included",
     "price": 499,
     "durationDays": 30,
     "features": ["Unlimited quizzes", "AI recommendations"],
     "isActive": true,
     "order": 1
   }
   ```

2. **Start Trial**
   ```bash
   POST /api/subscription/trial
   ```

3. **Test Payment Flow**
   - Use Razorpay test mode
   - Test card: 4111 1111 1111 1111
   - Any future expiry, any CVV

4. **Verify Subscription Status**
   ```bash
   GET /api/subscription/status
   ```

### Referral Testing

1. **Get Referral Code**
   ```bash
   GET /api/referral/code
   ```

2. **Share and Apply Code**
   - Sign up with `?ref=CODE`
   - Apply code via API

3. **Check Stats**
   ```bash
   GET /api/referral/stats
   ```

4. **View Leaderboard**
   ```bash
   GET /api/referral/leaderboard
   ```

---

## Database Migration

To apply Phase C schema changes:

```bash
# Create migration
npx prisma migrate dev --name add_phase_c_models

# Generate Prisma client
npx prisma generate

# Seed initial subscription plans (optional)
npm run seed
```

---

## Integration with Existing Features

### Quiz Completion
After quiz completion, check subscription status:

```typescript
const hasAccess = await canAccessPremiumFeatures(userId);
if (!hasAccess) {
  // Show upgrade prompt
}
```

### Dashboard
Display subscription status and referral stats on dashboard.

### Profile
Show subscription details and referral link in user profile.

---

## Next Steps

1. **Frontend UI Development**
   - Subscription plans page
   - Payment integration component
   - Subscription management dashboard
   - Referral dashboard

2. **Admin Dashboard**
   - Revenue analytics
   - User growth metrics
   - Subscription analytics
   - Real-time monitoring

3. **Content Management**
   - Bulk upload interface
   - Question editor
   - Version control UI

4. **Testing & Documentation**
   - Integration tests
   - E2E payment flow tests
   - User guide
   - Admin guide

---

## Support

For questions about Phase C:
- Review this documentation
- Check API responses
- Test with Razorpay test mode
- Use Prisma Studio for data inspection

---

**Phase C: START TO FINISH**  
**Implementation Date:** November 2025  
**Status:** IN PROGRESS

**Completed:**
- ✅ Database schema
- ✅ Core utilities
- ✅ API endpoints (15 total)
- ✅ Razorpay integration
- ✅ Documentation

**Remaining:**
- ⏳ Frontend UI components
- ⏳ Admin dashboard
- ⏳ Content management UI
- ⏳ Testing
