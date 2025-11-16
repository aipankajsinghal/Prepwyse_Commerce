# CI/CD Pipeline Setup Guide

This guide explains how to set up and use the automated CI/CD pipeline for PrepWyse Commerce.

## Overview

The project includes two GitHub Actions workflows:
1. **CI Pipeline** - Continuous Integration (linting, testing, building)
2. **Docker Build & Deploy** - Container builds and automatic deployment

## Prerequisites

- GitHub repository with Actions enabled
- VPS with Docker installed
- SSH access to VPS
- GitHub secrets configured

## CI Pipeline

### What It Does

Located in `.github/workflows/ci.yml`, this workflow:

1. **Linting & Type Checking**
   - Runs ESLint on all TypeScript/JavaScript files
   - Performs TypeScript type checking
   - Generates Prisma Client

2. **Security Scanning**
   - Runs `npm audit` for dependency vulnerabilities
   - Uses Trivy to scan for security issues
   - Uploads results to GitHub Security tab

3. **Build Testing**
   - Builds the Next.js application
   - Verifies build succeeds
   - Uploads build artifacts

### Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Configuration

No additional setup required. The workflow uses dummy credentials for build testing.

## Docker Build & Deploy Pipeline

### What It Does

Located in `.github/workflows/docker-build.yml`, this workflow:

1. **Build Docker Image**
   - Multi-stage build for optimized image size
   - Multi-platform support (amd64, arm64)
   - Pushes to GitHub Container Registry (ghcr.io)
   - Caches layers for faster builds

2. **Deploy to VPS**
   - SSH into your VPS
   - Pull latest Docker image
   - Restart containers with new image
   - Clean up old images

### Triggers

- Push to `main` or `develop` branches
- Manual workflow dispatch
- Pull requests (build only, no deploy)

### Required GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### VPS Access Secrets

```
VPS_HOST              # Your VPS IP address or domain (e.g., 192.168.1.100)
VPS_USERNAME          # SSH username (e.g., ubuntu, root)
VPS_SSH_KEY           # Private SSH key for authentication
VPS_PORT              # SSH port (default: 22)
```

#### Application Secrets (Optional for Build)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk public key
CLERK_SECRET_KEY                      # Clerk secret key
OPENAI_API_KEY                        # OpenAI API key
```

**Note**: Application secrets are not required for build as the workflow uses dummy values. Your VPS will use the actual keys from `.env` file.

## Setting Up GitHub Secrets

### 1. Generate SSH Key (if you don't have one)

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_actions_key.pub user@your-vps-ip
```

### 2. Add Secrets to GitHub

**VPS_SSH_KEY**:
```bash
# Display private key
cat ~/.ssh/github_actions_key

# Copy entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...key content...
# -----END OPENSSH PRIVATE KEY-----
```

Paste into GitHub Secret named `VPS_SSH_KEY`

**VPS_HOST**:
```
192.168.1.100
# or
prepwyse.com
```

**VPS_USERNAME**:
```
ubuntu
# or your SSH username
```

**VPS_PORT**:
```
22
# or your custom SSH port
```

## VPS Deployment Setup

### 1. Prepare VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create deployment directory
sudo mkdir -p /opt/prepwyse
sudo chown $USER:$USER /opt/prepwyse
cd /opt/prepwyse

# Clone repository
git clone https://github.com/yourusername/Prepwyse_Commerce.git .

# Create .env file
cp .env.example .env
nano .env  # Add your credentials
```

### 2. Configure Docker Compose

The GitHub Actions workflow expects these commands to work on your VPS:

```bash
cd /opt/prepwyse
docker-compose pull      # Pull latest images
docker-compose up -d --remove-orphans  # Start with new images
docker image prune -af   # Clean up old images
```

Ensure `docker-compose.yml` is in `/opt/prepwyse/` directory.

### 3. Test Manual Deployment

Before enabling CI/CD, test manual deployment:

```bash
# On VPS
cd /opt/prepwyse
docker-compose up -d

# Verify health
curl http://localhost:3000/api/health
```

## Using the CI/CD Pipeline

### Automatic Deployment

Once configured, deployment happens automatically:

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

2. **GitHub Actions triggers**
   - Runs CI pipeline
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Deploys to VPS

3. **Monitor deployment**
   - Go to GitHub **Actions** tab
   - View workflow run progress
   - Check for errors

### Manual Deployment

Trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Docker Build and Deploy** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Viewing Workflow Results

### CI Pipeline Results

- ✅ **Linting**: ESLint passed
- ✅ **Type Check**: TypeScript types valid
- ✅ **Security**: No vulnerabilities found
- ✅ **Build**: Application builds successfully

### Deployment Results

- ✅ **Build**: Docker image built
- ✅ **Push**: Image pushed to registry
- ✅ **Deploy**: VPS updated
- ✅ **Cleanup**: Old images removed

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors
```
Solution: Run `npx tsc --noEmit` locally and fix errors
```

**Issue**: Missing dependencies
```
Solution: Run `npm install` and commit package-lock.json
```

### Deployment Failures

**Issue**: SSH connection failed
```bash
# Verify SSH key works
ssh -i ~/.ssh/github_actions_key user@vps-ip

# Check VPS firewall
sudo ufw status
sudo ufw allow 22/tcp
```

**Issue**: Docker pull failed
```bash
# On VPS, login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Or use a Personal Access Token
```

**Issue**: Container won't start
```bash
# Check logs
docker-compose logs -f app

# Verify environment variables
docker-compose exec app env | grep -E "DATABASE|CLERK|OPENAI"
```

### Security Scan Failures

**Issue**: Vulnerabilities found
```bash
# Update dependencies
npm audit fix

# For breaking changes
npm audit fix --force

# Update specific package
npm update package-name
```

## Advanced Configuration

### Custom Deployment Script

Edit `.github/workflows/docker-build.yml`:

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    port: ${{ secrets.VPS_PORT }}
    script: |
      cd /opt/prepwyse
      
      # Pull latest code
      git pull origin main
      
      # Run custom deployment script
      ./scripts/deploy-vps.sh
```

### Multiple Environments

Create separate workflows for staging and production:

**staging.yml**:
```yaml
on:
  push:
    branches: [develop]
env:
  VPS_HOST: ${{ secrets.STAGING_VPS_HOST }}
```

**production.yml**:
```yaml
on:
  push:
    branches: [main]
env:
  VPS_HOST: ${{ secrets.PRODUCTION_VPS_HOST }}
```

### Slack/Discord Notifications

Add notification step:

```yaml
- name: Send notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Database Migrations

Add migration step before deployment:

```yaml
- name: Run migrations
  script: |
    cd /opt/prepwyse
    docker-compose exec -T app npx prisma migrate deploy
```

## Monitoring Deployments

### GitHub Actions Dashboard

1. Go to **Actions** tab
2. View recent workflow runs
3. Click on run for details
4. Check logs for each job

### VPS Monitoring

```bash
# View application logs
docker-compose logs -f app

# Monitor resource usage
docker stats

# Check health
curl http://localhost:3000/api/health
```

### Automated Monitoring

Set up monitoring tools:
- **UptimeRobot**: Free uptime monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Infrastructure monitoring

## Best Practices

1. **Test Locally First**: Always test changes locally before pushing
2. **Use Feature Branches**: Develop in feature branches, merge to develop
3. **Review PR Checks**: Ensure CI passes before merging
4. **Monitor Deployments**: Watch first few deployments closely
5. **Backup Before Deploy**: Automate database backups
6. **Rollback Plan**: Keep previous Docker image for quick rollback
7. **Environment Parity**: Keep staging and production similar
8. **Secrets Rotation**: Regularly rotate SSH keys and API keys

## Rollback Strategy

### Quick Rollback

```bash
# On VPS
cd /opt/prepwyse

# View image history
docker images | grep prepwyse

# Rollback to previous image
docker-compose down
docker tag ghcr.io/user/prepwyse:previous ghcr.io/user/prepwyse:latest
docker-compose up -d
```

### Git Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# CI/CD will deploy previous version
```

## Cost Optimization

### Reduce Build Minutes

```yaml
# Cache dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Use build cache
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Self-Hosted Runners

For unlimited build minutes:

1. Set up self-hosted runner on VPS
2. Update workflow: `runs-on: self-hosted`
3. No GitHub Actions minutes charged

## Support

- **Documentation**: See DOCKER_DEPLOYMENT.md
- **Issues**: GitHub Issues page
- **Community**: GitHub Discussions

## Security Considerations

- ✅ Use SSH keys, not passwords
- ✅ Rotate secrets regularly
- ✅ Use least privilege access
- ✅ Enable 2FA on GitHub
- ✅ Review workflow logs for sensitive data
- ✅ Use environment secrets, not hardcoded values
- ✅ Keep dependencies updated
- ✅ Monitor security alerts

---

**Last Updated**: November 2024  
**Version**: 1.0.0
