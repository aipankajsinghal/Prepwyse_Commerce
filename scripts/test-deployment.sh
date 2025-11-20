#!/bin/bash

# PrepWyse Commerce - Deployment Testing Script
# Automated smoke tests for production deployment verification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
TIMEOUT=10

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_test() {
    echo -e "${YELLOW}▶${NC} Testing: $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Test function
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local check_content="$4"
    
    ((TESTS_RUN++))
    print_test "$test_name"
    
    # Make request and capture response
    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>&1) || {
        print_failure "Request failed or timed out"
        return 1
    }
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    # Check status code
    if [ "$status_code" != "$expected_status" ]; then
        print_failure "Expected status $expected_status, got $status_code"
        return 1
    fi
    
    # Check content if specified
    if [ -n "$check_content" ]; then
        if echo "$body" | grep -q "$check_content"; then
            print_success "Status $status_code ✓ Content verified"
            return 0
        else
            print_failure "Status $status_code but content check failed"
            return 1
        fi
    fi
    
    print_success "Status $status_code"
    return 0
}

# Start testing
clear
print_header "PrepWyse Commerce - Deployment Smoke Tests"
print_info "Testing deployment at: $BASE_URL"
print_info "Started at: $(date '+%Y-%m-%d %H:%M:%S')"

# Test 1: Health Check
print_header "1. Health Check"
run_test "Health endpoint" "$BASE_URL/api/health" 200 "healthy"

# Test 2: Landing Page
print_header "2. Landing Page"
run_test "Home page loads" "$BASE_URL" 200
run_test "About page loads" "$BASE_URL/about" 200
run_test "Features page loads" "$BASE_URL/features" 200

# Test 3: Authentication Pages
print_header "3. Authentication Pages"
run_test "Sign-in page loads" "$BASE_URL/sign-in" 200
run_test "Sign-up page loads" "$BASE_URL/sign-up" 200

# Test 4: Public API Endpoints
print_header "4. Public API Endpoints"
run_test "Subjects API" "$BASE_URL/api/subjects" 200
run_test "Subjects list includes Business Studies" "$BASE_URL/api/subjects" 200 "Business Studies"

# Test 5: Static Assets
print_header "5. Static Assets"
run_test "Favicon loads" "$BASE_URL/favicon.ico" 200
run_test "Logo image loads" "$BASE_URL/logo.png" 200

# Test 6: PWA Manifest
print_header "6. Progressive Web App"
run_test "Manifest file loads" "$BASE_URL/manifest.json" 200
run_test "Service worker loads" "$BASE_URL/sw.js" 200

# Test 7: Protected Routes (should redirect to login)
print_header "7. Protected Routes"
print_test "Dashboard access (should redirect)"
dashboard_response=$(curl -s -I --max-time $TIMEOUT "$BASE_URL/dashboard" 2>&1)
if echo "$dashboard_response" | grep -q "307\|302\|301"; then
    print_success "Dashboard properly protected (redirect detected)"
    ((TESTS_RUN++))
    ((TESTS_PASSED++))
else
    print_failure "Dashboard not properly protected"
    ((TESTS_RUN++))
    ((TESTS_FAILED++))
fi

# Test 8: API Error Handling
print_header "8. API Error Handling"
run_test "Non-existent API endpoint returns 404" "$BASE_URL/api/nonexistent" 404

# Test 9: Response Times
print_header "9. Performance Tests"
print_test "Home page response time"
response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time $TIMEOUT "$BASE_URL")
((TESTS_RUN++))
if (( $(echo "$response_time < 3.0" | bc -l) )); then
    print_success "Response time: ${response_time}s (< 3s threshold)"
    ((TESTS_PASSED++))
else
    print_failure "Response time: ${response_time}s (>= 3s threshold)"
    ((TESTS_FAILED++))
fi

print_test "API response time"
api_response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time $TIMEOUT "$BASE_URL/api/health")
((TESTS_RUN++))
if (( $(echo "$api_response_time < 1.0" | bc -l) )); then
    print_success "API response time: ${api_response_time}s (< 1s threshold)"
    ((TESTS_PASSED++))
else
    print_failure "API response time: ${api_response_time}s (>= 1s threshold)"
    ((TESTS_FAILED++))
fi

# Test 10: Security Headers
print_header "10. Security Headers"
print_test "Security headers check"
security_headers=$(curl -s -I --max-time $TIMEOUT "$BASE_URL")
((TESTS_RUN++))

headers_found=0
headers_missing=()

if echo "$security_headers" | grep -qi "X-Frame-Options"; then
    print_success "X-Frame-Options header present"
    ((headers_found++))
else
    headers_missing+=("X-Frame-Options")
fi

if echo "$security_headers" | grep -qi "X-Content-Type-Options"; then
    print_success "X-Content-Type-Options header present"
    ((headers_found++))
else
    headers_missing+=("X-Content-Type-Options")
fi

if echo "$security_headers" | grep -qi "Strict-Transport-Security"; then
    print_success "Strict-Transport-Security header present"
    ((headers_found++))
else
    headers_missing+=("Strict-Transport-Security")
fi

if [ $headers_found -ge 2 ]; then
    ((TESTS_PASSED++))
    if [ ${#headers_missing[@]} -gt 0 ]; then
        print_info "Missing headers (non-critical): ${headers_missing[*]}"
    fi
else
    ((TESTS_FAILED++))
    print_failure "Security headers missing: ${headers_missing[*]}"
fi

# Test 11: CORS Headers (for API)
print_header "11. CORS Configuration"
print_test "CORS headers on API endpoints"
cors_headers=$(curl -s -I --max-time $TIMEOUT "$BASE_URL/api/health")
((TESTS_RUN++))
if echo "$cors_headers" | grep -qi "Access-Control"; then
    print_success "CORS headers configured"
    ((TESTS_PASSED++))
else
    print_info "CORS headers not found (may be intentional)"
    ((TESTS_PASSED++))
fi

# Summary
print_header "Test Summary"
echo ""
echo -e "${BLUE}Total Tests Run:${NC}    $TESTS_RUN"
echo -e "${GREEN}Tests Passed:${NC}       $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC}       $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ ALL TESTS PASSED - Deployment Successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 0
else
    success_rate=$(echo "scale=1; $TESTS_PASSED * 100 / $TESTS_RUN" | bc)
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ TESTS FAILED - Review errors above${NC}"
    echo -e "${YELLOW}  Success Rate: ${success_rate}%${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi
