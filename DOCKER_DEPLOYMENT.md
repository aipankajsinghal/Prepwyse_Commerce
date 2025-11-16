# Docker Deployment Guide

Complete guide for deploying PrepWyse Commerce using Docker on a VPS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [VPS Setup](#vps-setup)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### On Your VPS
- Ubuntu 20.04+ or Debian 11+ (recommended)
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ disk space
- Docker 24.0+ and Docker Compose 2.0+
- Domain name pointing to your VPS (for SSL)
- Open ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)

### Required Credentials
- Clerk API keys (sign up at https://clerk.com)
- OpenAI API key (get from https://platform.openai.com)
- PostgreSQL database credentials
- SSH access to your VPS

## Quick Start

### 1. Clone Repository on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create application directory
sudo mkdir -p /opt/prepwyse
sudo chown $USER:$USER /opt/prepwyse
cd /opt/prepwyse

# Clone repository
git clone https://github.com/yourusername/Prepwyse_Commerce.git .
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Add your credentials:

```env
# Database
POSTGRES_USER=prepwyse
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=prepwyse_db
DATABASE_URL=postgresql://prepwyse:your_strong_password_here@postgres:5432/prepwyse_db?schema=public

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App Configuration
NODE_ENV=production
```

### 3. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Verify services are running
docker-compose ps
```

## VPS Setup

### Install Docker

```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Docker Deployment

### Architecture

```
┌─────────────┐
│   Nginx     │  Port 80/443 (Reverse Proxy + SSL)
└──────┬──────┘
       │
┌──────▼──────┐
│  Next.js    │  Port 3000 (Application)
│     App     │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │  Port 5432 (Database)
└─────────────┘
```

### Docker Compose Services

#### 1. PostgreSQL Database
- Image: `postgres:16-alpine`
- Persistent volume for data
- Automatic health checks
- Isolated network

#### 2. Next.js Application
- Built from Dockerfile
- Multi-stage build for optimization
- Automatic database migrations on start
- Health check endpoint
- Restart policy: unless-stopped

#### 3. Nginx (Optional)
- Reverse proxy with SSL termination
- HTTP to HTTPS redirect
- Rate limiting
- Static file caching
- Security headers

### Deploy Without Nginx

If you already have a reverse proxy or want to expose the app directly:

```bash
# Start only app and database
docker-compose up -d postgres app
```

### Deploy With Nginx

```bash
# Start all services including Nginx
docker-compose --profile with-nginx up -d
```

## Configuration

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_live_xxxxx` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_xxxxx` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxxxx` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |
| `POSTGRES_USER` | Database username | `prepwyse` |
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_DB` | Database name | `prepwyse_db` |

### Docker Compose Configuration

Edit `docker-compose.yml` to customize:

```yaml
services:
  app:
    # Use pre-built image instead of building
    image: ghcr.io/username/prepwyse_commerce:latest
    
    # Custom port mapping
    ports:
      - "8080:3000"
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## SSL/TLS Setup

### Option 1: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install -y certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Set permissions
sudo chown $USER:$USER nginx/ssl/*

# Restart nginx
docker-compose restart nginx
```

### Option 2: Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

### Auto-Renewal Setup

```bash
# Add cron job for certificate renewal
echo "0 0 * * * certbot renew --quiet && docker-compose restart nginx" | sudo crontab -
```

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U prepwyse prepwyse_db > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Restore from backup
gunzip backup_20241116.sql.gz
docker-compose exec -T postgres psql -U prepwyse prepwyse_db < backup_20241116.sql
```

### Database Migrations

```bash
# Run migrations manually
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Check Service Health

```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats

# Application health check
curl http://localhost:3000/api/health
```

### Monitor Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U prepwyse prepwyse_db

# Check database size
docker-compose exec postgres psql -U prepwyse -c "SELECT pg_size_pretty(pg_database_size('prepwyse_db'));"

# Check active connections
docker-compose exec postgres psql -U prepwyse -c "SELECT count(*) FROM pg_stat_activity;"
```

## Updating the Application

### Pull Latest Changes

```bash
cd /opt/prepwyse

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Using Pre-built Images

```bash
# Pull latest image
docker-compose pull app

# Restart with new image
docker-compose up -d app
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep -E "DATABASE_URL|CLERK|OPENAI"

# Test database connection
docker-compose exec app npx prisma db push
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec app node -e "console.log(process.env.DATABASE_URL)"
```

### Nginx Not Working

```bash
# Check Nginx logs
docker-compose logs nginx

# Test Nginx configuration
docker-compose exec nginx nginx -t

# Verify SSL certificates
ls -la nginx/ssl/
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of Memory

```bash
# Check memory usage
free -h

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Maintenance

### Cleanup Old Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

### Backup Everything

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U prepwyse prepwyse_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup environment
cp .env $BACKUP_DIR/env_$DATE

# Keep only last 7 backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/prepwyse/backup.sh" | crontab -
```

## Performance Optimization

### Enable BuildKit

```bash
# Add to ~/.bashrc or ~/.zshrc
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### Use Multi-Stage Builds

Already implemented in Dockerfile for optimal image size.

### Resource Limits

```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Security Best Practices

1. **Use Strong Passwords**: Generate with `openssl rand -base64 32`
2. **Keep Images Updated**: Regular `docker-compose pull`
3. **Enable Firewall**: Use `ufw` to restrict access
4. **Use SSL/TLS**: Always enable HTTPS in production
5. **Regular Backups**: Automate database backups
6. **Monitor Logs**: Check for suspicious activity
7. **Limit User Permissions**: Don't run as root
8. **Secrets Management**: Use Docker secrets in production

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/Prepwyse_Commerce/issues
- Documentation: See README.md and other docs
- Email: support@prepwyse.com

## License

See LICENSE file in repository.
