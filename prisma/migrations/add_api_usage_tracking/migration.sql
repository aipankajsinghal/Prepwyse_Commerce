-- CreateTable APIUsage
CREATE TABLE "APIUsage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCost" NUMERIC(10,6) NOT NULL,
    "responseLength" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable APIUsageAlert
CREATE TABLE "APIUsageAlert" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "threshold" NUMERIC(10,2) NOT NULL,
    "currentValue" NUMERIC(10,2) NOT NULL,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIUsageAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex APIUsage_provider_createdAt_idx
CREATE INDEX "APIUsage_provider_createdAt_idx" ON "APIUsage"("provider", "createdAt");

-- CreateIndex APIUsage_userId_createdAt_idx
CREATE INDEX "APIUsage_userId_createdAt_idx" ON "APIUsage"("userId", "createdAt");

-- CreateIndex APIUsage_endpoint_createdAt_idx
CREATE INDEX "APIUsage_endpoint_createdAt_idx" ON "APIUsage"("endpoint", "createdAt");

-- CreateIndex APIUsage_createdAt_idx
CREATE INDEX "APIUsage_createdAt_idx" ON "APIUsage"("createdAt");

-- CreateIndex APIUsageAlert_provider_alertType_idx
CREATE INDEX "APIUsageAlert_provider_alertType_idx" ON "APIUsageAlert"("provider", "alertType");

-- CreateIndex APIUsageAlert_isTriggered_idx
CREATE INDEX "APIUsageAlert_isTriggered_idx" ON "APIUsageAlert"("isTriggered");
