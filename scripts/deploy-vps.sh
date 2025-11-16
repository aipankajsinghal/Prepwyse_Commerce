#!/bin/bash

# PrepWyse Commerce VPS Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on error

echo "🚀 PrepWyse Commerce VPS Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_success "Docker Compose is installed"

if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git is installed"

# Set deployment directory
DEPLOY_DIR="/opt/prepwyse"
print_info "Deployment directory: $DEPLOY_DIR"

# Check if directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    print_info "Creating deployment directory..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown $USER:$USER "$DEPLOY_DIR"
    print_success "Directory created"
fi

# Change to deployment directory
cd "$DEPLOY_DIR"
print_success "Changed to deployment directory"

# Clone or pull repository
if [ ! -d ".git" ]; then
    print_info "Cloning repository..."
    read -p "Enter repository URL: " REPO_URL
    git clone "$REPO_URL" .
    print_success "Repository cloned"
else
    print_info "Pulling latest changes..."
    git pull origin main
    print_success "Repository updated"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_info "Please edit .env file with your credentials:"
    print_info "  nano .env"
    print_info "Then run this script again."
    exit 0
fi

# Verify environment variables
print_info "Verifying environment variables..."
required_vars=("DATABASE_URL" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "CLERK_SECRET_KEY" "OPENAI_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "^${var}=your_" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or incomplete environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_info "Please update .env file and run this script again."
    exit 1
fi
print_success "Environment variables verified"

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down || true
print_success "Containers stopped"

# Pull latest images (if using pre-built images)
print_info "Pulling latest images..."
docker-compose pull || true
print_success "Images pulled"

# Build and start containers
print_info "Building and starting containers..."
docker-compose up -d --build
print_success "Containers started"

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is healthy!"
else
    print_error "Application health check failed"
    print_info "Check logs with: docker-compose logs -f app"
    exit 1
fi

# Display service status
print_info "Service status:"
docker-compose ps

# Display URLs
echo ""
print_success "Deployment complete!"
echo ""
echo "📱 Application URLs:"
echo "  - Local: http://localhost:3000"
echo "  - Health: http://localhost:3000/api/health"
echo ""
echo "📊 Management Commands:"
echo "  - View logs: docker-compose logs -f app"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart app"
echo "  - Database backup: docker-compose exec postgres pg_dump -U prepwyse prepwyse_db > backup.sql"
echo ""
echo "📚 Documentation:"
echo "  - README.md"
echo "  - DOCKER_DEPLOYMENT.md"
echo "  - TECHNICAL_DOCUMENTATION.md"
echo ""
print_info "Remember to configure your firewall and set up SSL/TLS for production!"
