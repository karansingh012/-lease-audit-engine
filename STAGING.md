# Staging Deployment Guide

## Overview

The LeaseAudit AI project uses **Vercel Preview Deployments** for staging. Every push to the `staging` branch triggers an automatic deployment to a preview URL.

## Current Setup

| Environment | Branch | URL | Status |
|---|---|---|---|
| **Production** | `main` | https://rocketride-lease-audit.vercel.app | ✅ Active |
| **Staging** | `staging` | https://rocketride-lease-audit-staging.vercel.app | ✅ Auto-deployed |

## How Staging Works

1. **Branch**: Dedicated `staging` branch tracks the remote `origin/staging`
2. **Auto-Deploy**: Any push to `staging` triggers Vercel preview deployment
3. **Environment Variables**: Same as production (shared RocketRide API)
4. **URL**: `https://rocketride-lease-audit-staging.vercel.app`

## Workflow

### Making Changes to Staging

```bash
# Start from staging branch
git checkout staging

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: your staging feature"
git push origin staging
```

Vercel will automatically deploy within 1-2 minutes. Check deployment at:
- Vercel Dashboard: https://vercel.com/dashboard
- Preview URL: https://rocketride-lease-audit-staging.vercel.app

### Promoting Staging to Production

When staging is ready for production:

```bash
# Switch to main
git checkout main

# Merge staging into main
git merge staging

# Push to production
git push origin main
```

Vercel will deploy the production version automatically.

## Environment Variables

Both staging and production use the same environment variables:

```env
ROCKETRIDE_APIKEY=rr_...
ROCKETRIDE_URI=https://api.rocketride.ai
ROCKETRIDE_GEMINI_APIKEY=AQ.Ab8...
```

To use different staging variables:

1. Go to **Vercel Project Settings** → **Environment Variables**
2. Add staging-specific variables with git branch override:
   - **Name**: `ROCKETRIDE_URI`
   - **Value**: `https://staging.api.rocketride.ai` (if you have a staging endpoint)
   - **Environments**: Select `Preview` branch `staging`

## Verifying the Deployment

After pushing to `staging`:

1. Check Vercel Dashboard for deployment status
2. Once complete, visit: https://rocketride-lease-audit-staging.vercel.app
3. The page should load with the LeaseAudit AI interface
4. Test with sample PDFs to verify RocketRide connectivity

## Troubleshooting

### Staging URL not accessible

- Ensure `staging` branch was pushed: `git push origin staging`
- Check Vercel Dashboard for build errors
- Verify environment variables are set in Vercel Project Settings

### Different behavior in staging vs production

- Check if `.env.local` is being used (should not be committed)
- Verify Vercel environment variables are correctly set
- Clear browser cache or use incognito mode

## Git Commands Reference

```bash
# View all branches
git branch -a

# Switch to staging
git checkout staging

# Pull latest staging changes
git pull origin staging

# Create a feature branch from staging
git checkout -b feature/your-feature staging

# Push feature branch to trigger preview deployment
git push -u origin feature/your-feature
```

## CI/CD Pipeline

- **Any branch push** → Vercel Preview Deployment
- **Push to `staging`** → Staging Preview (https://rocketride-lease-audit-staging.vercel.app)
- **Push to `main`** → Production (https://rocketride-lease-audit.vercel.app)

---

**Last Updated**: 2026-09-01
