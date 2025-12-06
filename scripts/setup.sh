#!/bin/bash

# PrepWyse Commerce Setup Script
# Helps configure environment and start development

set -e  # Exit on error

echo "🚀 PrepWyse Commerce Setup"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Docker (optional but recommended)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠ Docker not found (optional, but recommended for testing)${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment..."

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠ .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env.local creation"
    else
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local${NC}"
    fi
else
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

echo ""
echo "📝 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Edit .env.local with your credentials:"
echo "   - Clerk: https://dashboard.clerk.com"
echo "   - OpenAI: https://platform.openai.com"
echo "   - Razorpay: https://dashboard.razorpay.com (optional for testing)"
echo ""
echo "2. Start PostgreSQL (choose one):"
echo ""
echo "   Option A: Docker Compose (Recommended)"
echo "   ─────────────────────────────────────"
echo "   docker-compose up -d"
echo "   npm run dev"
echo ""
echo "   Option B: Local PostgreSQL"
echo "   ──────────────────────────"
echo "   # Start your PostgreSQL server"
echo "   # Update DATABASE_URL in .env.local"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "4. Run tests:"
echo "   npm test"
echo ""
echo "5. Check linting:"
echo "   npm run lint"
echo ""
echo "For more details, see docs/DEPLOYMENT.md"
echo ""
