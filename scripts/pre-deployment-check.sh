#!/bin/bash

# PrepWyse Commerce - Pre-Deployment Checklist Script
# Validates environment and codebase before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_check() {
    echo -e "${YELLOW}▶${NC} Checking: $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

print_failure() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((CHECKS_WARNING++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check function
run_check() {
    ((CHECKS_TOTAL++))
}

# Start checks
clear
print_header "PrepWyse Commerce - Pre-Deployment Checklist"
print_info "Started at: $(date '+%Y-%m-%d %H:%M:%S')"

# 1. Environment Checks
print_header "1. Environment Prerequisites"

# Node.js version
print_check "Node.js version (>= 18.0.0)"
run_check
node_version=$(node -v | sed 's/v//')
required_version="18.0.0"
if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
    print_success "Node.js $node_version installed"
else
    print_failure "Node.js $node_version is below required version $required_version"
fi

# npm version
print_check "npm version (>= 8.0.0)"
run_check
npm_version=$(npm -v)
required_npm="8.0.0"
if [ "$(printf '%s\n' "$required_npm" "$npm_version" | sort -V | head -n1)" = "$required_npm" ]; then
    print_success "npm $npm_version installed"
else
    print_warning "npm $npm_version may be outdated (recommended >= $required_npm)"
fi

# Docker (if using containerized deployment)
print_check "Docker installation"
run_check
if command -v docker &> /dev/null; then
    docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    print_success "Docker $docker_version installed"
else
    print_warning "Docker not found (required for containerized deployment)"
fi

# Docker Compose
print_check "Docker Compose installation"
run_check
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    compose_version=$(docker compose version 2>/dev/null | awk '{print $4}' || docker-compose --version | awk '{print $4}')
    print_success "Docker Compose $compose_version installed"
else
    print_warning "Docker Compose not found (required for containerized deployment)"
fi

# 2. Code Quality Checks
print_header "2. Code Quality Checks"

# Dependencies installed
print_check "Dependencies installation"
run_check
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
    print_success "Dependencies installed"
else
    print_failure "Dependencies not installed - run 'npm ci'"
fi

# Lint check
print_check "ESLint validation"
run_check
if npm run lint &> /tmp/lint-output.log; then
    print_success "ESLint passed (or warnings only)"
else
    errors=$(grep -c "error" /tmp/lint-output.log || echo "0")
    if [ "$errors" -gt 0 ]; then
        print_failure "ESLint found $errors error(s) - check /tmp/lint-output.log"
    else
        print_success "ESLint passed with warnings"
    fi
fi

# TypeScript type check
print_check "TypeScript type validation"
run_check
if npx tsc --noEmit &> /tmp/tsc-output.log; then
    print_success "TypeScript types valid"
else
    print_failure "TypeScript type errors found - check /tmp/tsc-output.log"
fi

# Prisma schema validation
print_check "Prisma schema validation"
run_check
if npx prisma validate &> /dev/null; then
    print_success "Prisma schema valid"
else
    print_failure "Prisma schema has errors"
fi

# Prisma Client generation
print_check "Prisma Client generation"
run_check
if [ -d "node_modules/@prisma/client" ]; then
    print_success "Prisma Client generated"
else
    print_warning "Prisma Client not generated - run 'npx prisma generate'"
fi

# 3. Environment Variables
print_header "3. Environment Variables"

# .env file exists
print_check ".env file existence"
run_check
if [ -f ".env" ]; then
    print_success ".env file found"
else
    print_failure ".env file not found"
fi

# Required variables
print_check "Required environment variables"
run_check

if [ -f ".env" ]; then
    source .env
    
    required_vars=(
        "DATABASE_URL"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
        "OPENAI_API_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_success "All required environment variables set"
    else
        print_failure "Missing environment variables: ${missing_vars[*]}"
    fi
    
    # Validate DATABASE_URL format
    if [ -n "$DATABASE_URL" ]; then
        if [[ $DATABASE_URL == postgresql://* ]] || [[ $DATABASE_URL == postgres://* ]]; then
            print_success "DATABASE_URL format valid"
        else
            print_failure "DATABASE_URL format invalid (should start with postgresql://)"
        fi
    fi
    
    # Validate Clerk keys format
    if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
        if [[ $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY == pk_* ]]; then
            print_success "Clerk publishable key format valid"
        else
            print_warning "Clerk publishable key format unexpected"
        fi
    fi
    
    if [ -n "$CLERK_SECRET_KEY" ]; then
        if [[ $CLERK_SECRET_KEY == sk_* ]]; then
            print_success "Clerk secret key format valid"
        else
            print_warning "Clerk secret key format unexpected"
        fi
    fi
    
    # Validate OpenAI key format
    if [ -n "$OPENAI_API_KEY" ]; then
        if [[ $OPENAI_API_KEY == sk-* ]]; then
            print_success "OpenAI API key format valid"
        else
            print_warning "OpenAI API key format unexpected"
        fi
    fi
else
    print_failure "Cannot check environment variables - .env file not found"
fi

# 4. Build Test
print_header "4. Build Test"

print_check "Next.js build"
run_check
print_info "Building application (this may take a few minutes)..."

# Set dummy values for build if real ones not available
export SKIP_ENV_VALIDATION=true
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_dummy}"
export CLERK_SECRET_KEY="${CLERK_SECRET_KEY:-sk_test_dummy}"
export DATABASE_URL="${DATABASE_URL:-postgresql://dummy:dummy@localhost:5432/dummy}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-sk-dummy}"

if npm run build &> /tmp/build-output.log; then
    print_success "Build completed successfully"
    
    # Check build output size
    if [ -d ".next" ]; then
        build_size=$(du -sh .next | awk '{print $1}')
        print_info "Build size: $build_size"
    fi
else
    print_failure "Build failed - check /tmp/build-output.log"
    tail -20 /tmp/build-output.log
fi

# 5. Database Checks
print_header "5. Database Checks"

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://dummy:dummy@localhost:5432/dummy" ]; then
    # Database connection
    print_check "Database connectivity"
    run_check
    if npx prisma db pull --force &> /tmp/db-check.log 2>&1; then
        print_success "Database connection successful"
    else
        print_failure "Cannot connect to database - check DATABASE_URL"
    fi
    
    # Migration status
    print_check "Database migration status"
    run_check
    if npx prisma migrate status &> /tmp/migrate-status.log 2>&1; then
        if grep -q "No pending migrations" /tmp/migrate-status.log; then
            print_success "No pending migrations"
        else
            print_warning "Pending migrations found - run before deployment"
        fi
    else
        print_warning "Cannot check migration status"
    fi
else
    print_warning "Skipping database checks (no valid DATABASE_URL)"
    run_check
    run_check
fi

# 6. Security Checks
print_header "6. Security Checks"

# npm audit
print_check "Dependency vulnerabilities"
run_check
audit_output=$(npm audit --audit-level=high 2>&1 || true)
if echo "$audit_output" | grep -q "found 0 vulnerabilities"; then
    print_success "No high/critical vulnerabilities found"
else
    critical=$(echo "$audit_output" | grep -o "[0-9]* critical" | awk '{print $1}')
    high=$(echo "$audit_output" | grep -o "[0-9]* high" | awk '{print $1}')
    if [ -n "$critical" ] && [ "$critical" -gt 0 ]; then
        print_failure "$critical critical vulnerabilities found - run 'npm audit fix'"
    elif [ -n "$high" ] && [ "$high" -gt 0 ]; then
        print_warning "$high high vulnerabilities found - review with 'npm audit'"
    else
        print_success "No critical vulnerabilities found"
    fi
fi

# Check for secrets in code
print_check "Secrets in codebase"
run_check
if grep -r "sk-[A-Za-z0-9]\{32,\}" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" . > /dev/null 2>&1; then
    print_failure "Potential API keys found in code - review immediately"
else
    print_success "No obvious secrets found in code"
fi

# .env in .gitignore
print_check ".env in .gitignore"
run_check
if grep -q "^\.env$" .gitignore; then
    print_success ".env is properly gitignored"
else
    print_warning ".env may not be in .gitignore"
fi

# 7. Docker Checks (if applicable)
print_header "7. Docker Configuration"

# Dockerfile exists
print_check "Dockerfile exists"
run_check
if [ -f "Dockerfile" ]; then
    print_success "Dockerfile found"
else
    print_warning "Dockerfile not found (not needed for serverless deployment)"
fi

# docker-compose.yml exists
print_check "docker-compose.yml exists"
run_check
if [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml found"
else
    print_warning "docker-compose.yml not found (not needed for all deployments)"
fi

# .dockerignore exists
print_check ".dockerignore exists"
run_check
if [ -f ".dockerignore" ]; then
    print_success ".dockerignore found"
else
    print_warning ".dockerignore not found (recommended for smaller images)"
fi

# 8. Git Status
print_header "8. Git Repository Status"

# Check for uncommitted changes
print_check "Uncommitted changes"
run_check
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected:"
    git status --short | head -10
else
    print_success "No uncommitted changes"
fi

# Check current branch
print_check "Current branch"
run_check
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    print_success "On production branch: $current_branch"
else
    print_warning "On branch: $current_branch (not main/master)"
fi

# Summary
print_header "Pre-Deployment Summary"
echo ""
echo -e "${BLUE}Total Checks:${NC}       $CHECKS_TOTAL"
echo -e "${GREEN}Passed:${NC}             $CHECKS_PASSED"
echo -e "${RED}Failed:${NC}             $CHECKS_FAILED"
echo -e "${YELLOW}Warnings:${NC}           $CHECKS_WARNING"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ✓ ALL CHECKS PASSED - Ready for Deployment!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}  ⚠ CHECKS PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}  Review warnings before deployment${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        exit 0
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ DEPLOYMENT BLOCKED - Fix errors above${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi
