# RocketRide Staging Integration Guide

## Overview

The LeaseAudit AI staging environment is fully integrated with RocketRide. Feature branches and pull requests use RocketRide Cloud to process audits, just like production.

## Current Setup

### Environment Variables

```
Production (.env.local):
- ROCKETRIDE_APIKEY: rr_YOUR_PRODUCTION_KEY
- ROCKETRIDE_URI: https://api.rocketride.ai
- ROCKETRIDE_GEMINI_APIKEY: YOUR_PRODUCTION_GEMINI_KEY

Staging (Vercel Environment):
- ROCKETRIDE_APIKEY: rr_YOUR_STAGING_KEY
- ROCKETRIDE_URI: https://api.rocketride.ai
- ROCKETRIDE_GEMINI_APIKEY: YOUR_STAGING_GEMINI_KEY
```

## How It Works

1. **Feature Branch Created** → PR opens with preview URL
2. **Vercel Deploys** → Pulls environment variables for `Preview` deployments
3. **User Tests** → Upload PDFs to preview URL
4. **RocketRide Processes** → Same pipeline as production
5. **Results Returned** → Lease audit appears in preview

## Vercel Configuration

The `vercel.json` file automatically configures environment variables for preview deployments:

```json
"env": {
  "ROCKETRIDE_APIKEY": { "description": "RocketRide API Key" },
  "ROCKETRIDE_URI": { "description": "RocketRide API URI" },
  "ROCKETRIDE_GEMINI_APIKEY": { "description": "RocketRide Gemini API Key" }
}
```

## Setting Up Staging RocketRide Variables

### Option 1: Use Same API (Current Setup)

No action needed. Staging uses production RocketRide:
- Same API endpoint
- Same credentials
- Same pipeline behavior

### Option 2: Use Separate Staging RocketRide Instance

If you have a separate RocketRide staging environment:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select `rocketride-lease-audit` project

2. **Settings → Environment Variables**

3. **Add/Update Variables**:
   - Name: `ROCKETRIDE_APIKEY`
   - Value: `rr_your_staging_key`
   - Environments: ✅ Preview, ✅ Production

4. **Repeat for**:
   - `ROCKETRIDE_URI`
   - `ROCKETRIDE_GEMINI_APIKEY`

5. **Test**:
   - Create a feature branch
   - Get preview URL
   - Test audit workflow with staging RocketRide

### Option 3: Environment-Specific Overrides

Use Vercel's branch-specific environment variables:

```
Name: ROCKETRIDE_URI
Value (Preview/staging): https://staging.api.rocketride.ai
Value (Production): https://api.rocketride.ai
```

## Testing Staging RocketRide

### 1. Create Feature Branch
```bash
git checkout staging
git checkout -b feature/test-rocketride
```

### 2. Push & Get Preview URL
```bash
git push origin feature/test-rocketride
```

### 3. Wait for Vercel Deployment
- GitHub PR will get Vercel comment with preview URL
- Build takes ~2 minutes

### 4. Test Audit in Preview
1. Go to preview URL: `https://rocketride-lease-audit-pr-XX.vercel.app`
2. Upload lease PDF + invoice PDF
3. Click "Run AI Audit"
4. Wait for RocketRide to process
5. Verify results match expected behavior

### 5. Check RocketRide Logs
1. Go to https://cloud.rocketride.ai
2. View pipeline execution logs
3. Confirm staging/preview requests are processed

## Code Flow

```
User uploads files (Preview)
    ↓
POST /api/audit (Next.js API Route)
    ↓
Reads environment variables:
  - ROCKETRIDE_APIKEY (from Vercel env vars)
  - ROCKETRIDE_URI (from Vercel env vars)
  - ROCKETRIDE_GEMINI_APIKEY (from Vercel env vars)
    ↓
RocketRideClient.withConnection({ auth: apiKey, uri })
    ↓
Sends to RocketRide Cloud (production or staging endpoint)
    ↓
Pipeline processes (same lease_audit.pipe)
    ↓
Returns results to frontend
    ↓
User sees audit in preview UI
```

## Troubleshooting

### Preview shows "ROCKETRIDE_APIKEY is not set"

**Cause**: Environment variables not configured in Vercel

**Fix**:
1. Go to Vercel Project Settings
2. Add `ROCKETRIDE_APIKEY` to Environment Variables
3. Set for `Preview` and `Production` environments
4. Redeploy preview

### Preview processes PDF but returns error

**Cause**: RocketRide endpoint unreachable or API key invalid

**Fix**:
1. Verify `ROCKETRIDE_URI` is correct in Vercel env vars
2. Verify API key in Vercel matches active RocketRide account
3. Check RocketRide Cloud logs: https://cloud.rocketride.ai
4. Ensure pipeline (`lease_audit.pipe`) is deployed in RocketRide

### "Pipeline not found" error

**Cause**: `lease_audit.pipe` not deployed to RocketRide environment

**Fix**:
1. Deploy pipeline to RocketRide:
   ```bash
   node scratch_deploy.js
   ```
2. Verify pipeline appears in RocketRide Cloud dashboard
3. Retry audit in preview

## Environment Variable Priority

Next.js reads environment variables in this order:

1. `.env.local` (local machine only, not committed)
2. `.env` (fallback, for defaults)
3. Vercel Project Settings (production & preview)
4. Defaults in code (`process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai'`)

For staging preview deployments, Vercel env vars take priority over local `.env.local`.

## Summary

| Aspect | Production | Staging |
|---|---|---|
| **URL** | rocketride-lease-audit.vercel.app | PR preview URLs |
| **Branch** | main | feature/*, staging |
| **Vercel Env** | Environment: Production | Environment: Preview |
| **RocketRide API** | https://api.rocketride.ai | Same or separate endpoint |
| **API Key** | production key | same or staging key |
| **Pipeline** | lease_audit.pipe | same lease_audit.pipe |

---

**Last Updated**: 2026-09-01
