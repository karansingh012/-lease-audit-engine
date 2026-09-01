# 🚀 LeaseAudit AI - Complete Staging Setup

**Setup Date**: 2026-09-01  
**Status**: ✅ Production + Staging Ready

---

## **Staging URLs Summary**

| Component | Production | Staging |
|---|---|---|
| **Frontend** | https://rocketride-lease-audit.vercel.app | PR Preview URLs (auto-generated) |
| **RocketRide Dashboard** | https://cloud.rocketride.ai | https://cloud.rocketride.ai (same) |
| **RocketRide API** | https://api.rocketride.ai | https://api.rocketride.ai (same) |

---

## **1. Frontend Staging URLs**

### **Production** (Main Branch)
```
🔗 https://rocketride-lease-audit.vercel.app
📊 Active 24/7
🔐 Main production deployment
```

### **Staging** (Feature Branches / PRs)
- Create feature branch: `git checkout -b feature/your-feature`
- Push to GitHub: `git push origin feature/your-feature`
- GitHub will auto-create PR → **Vercel generates preview URL**
- Example: `https://rocketride-lease-audit-pr-42.vercel.app`

**How to Get Staging URL:**
1. Push feature branch to GitHub
2. Create/open Pull Request
3. Look for Vercel bot comment with preview link
4. Use that staging URL to test

---

## **2. RocketRide Cloud Dashboard**

### **Access Dashboard**
🌐 **https://cloud.rocketride.ai**

### **View Pipeline Executions**
1. Go to https://cloud.rocketride.ai
2. Log in with your RocketRide account
3. Go to **Pipelines** section
4. You'll see:
   - **lease_audit** (Production pipeline)
   - **lease_audit-staging** (Staging pipeline)

### **Monitor Runs**
- View all audit pipeline executions
- Check logs for errors
- See task tokens and results
- Both production & staging runs show in same dashboard

---

## **3. RocketRide Production Pipeline**

✅ **Status**: Deployed  
📝 **File**: `lease_audit.pipe`  
🔗 **Task ID**: `8c91bcf3.webhook_1`  
🎫 **Token**: `tk_8c91bcf347e6b302410898a6e6c8fd7a`

### **Deploy Production**
```bash
source .env.local
node scratch_deploy.js
```

Or with inline variables:
```bash
ROCKETRIDE_APIKEY=rr_YOUR_API_KEY \
ROCKETRIDE_URI=https://api.rocketride.ai \
ROCKETRIDE_GEMINI_APIKEY=YOUR_GEMINI_API_KEY \
node scratch_deploy.js
```

---

## **4. RocketRide Staging Pipeline**

✅ **Status**: Deployed  
📝 **File**: `lease_audit-staging.pipe`  
🔗 **Task ID**: `39243e55.webhook_1`  
🎫 **Token**: `tk_39243e550cc3dc395b9dcb542857ab0c`

### **Deploy Staging**
```bash
ROCKETRIDE_APIKEY=rr_YOUR_API_KEY \
ROCKETRIDE_URI=https://api.rocketride.ai \
ROCKETRIDE_GEMINI_APIKEY=YOUR_GEMINI_API_KEY \
node deploy-staging.js
```

---

## **5. Complete Workflow**

### **Step 1: Create Feature Branch**
```bash
git checkout staging
git pull origin staging
git checkout -b feature/test-audit
```

### **Step 2: Make Changes & Test Locally**
```bash
npm run dev
# Test at http://localhost:3000
```

### **Step 3: Push & Get Staging URL**
```bash
git add .
git commit -m "feat: test feature"
git push origin feature/test-audit
```

### **Step 4: Test in Staging**
1. Go to GitHub PR
2. Wait for Vercel deployment (1-2 min)
3. Click preview URL in Vercel comment
4. Test audit workflow
5. Upload PDFs
6. Verify results in RocketRide Cloud dashboard

### **Step 5: Merge to Production**
Once tested:
```bash
git checkout main
git merge feature/test-audit
git push origin main
```

→ Auto-deploys to https://rocketride-lease-audit.vercel.app

---

## **6. Environment Variables**

### **Production (.env.local)**
```env
ROCKETRIDE_APIKEY=rr_YOUR_API_KEY_HERE
ROCKETRIDE_URI=https://api.rocketride.ai
ROCKETRIDE_GEMINI_APIKEY=YOUR_GEMINI_API_KEY_HERE
```

### **Vercel Environment Variables**
Set in Vercel Dashboard → Project Settings → Environment Variables:
- Same variables for both Production & Preview environments
- Applies to all deployments

---

## **7. Important Links**

| Link | Purpose |
|---|---|
| https://rocketride-lease-audit.vercel.app | Production frontend |
| https://cloud.rocketride.ai | RocketRide dashboard (view pipeline runs) |
| https://api.rocketride.ai | RocketRide API endpoint |
| https://vercel.com/dashboard | Vercel deployments |
| https://github.com/karansingh012/-lease-audit-engine | GitHub repo |

---

## **8. Troubleshooting**

### **Preview URL not showing**
- Wait 2-3 minutes for Vercel build
- Check PR comments for Vercel bot
- Go to Vercel dashboard to see build status

### **Staging shows different results**
- Both use same RocketRide API endpoint
- Check RocketRide Cloud logs
- Verify environment variables in Vercel

### **Pipeline error in staging**
- Go to https://cloud.rocketride.ai
- Check pipeline execution logs
- Verify PDFs are valid
- Check API key is correct

### **Can't deploy staging**
```bash
# Re-deploy staging pipeline
ROCKETRIDE_APIKEY=... ROCKETRIDE_URI=... node deploy-staging.js
```

---

## **9. Comparison: Production vs Staging**

| Aspect | Production | Staging |
|---|---|---|
| **Frontend URL** | https://rocketride-lease-audit.vercel.app | PR preview URL |
| **Git Branch** | main | feature/*, staging |
| **RocketRide Pipeline** | lease_audit.pipe | lease_audit-staging.pipe |
| **Dashboard** | https://cloud.rocketride.ai | https://cloud.rocketride.ai |
| **API** | https://api.rocketride.ai | https://api.rocketride.ai |
| **Who Uses** | End users | Developers (testing) |
| **Data** | Real audits | Test data |

---

## **Files Created**

✅ `lease_audit.pipe` - Production pipeline  
✅ `lease_audit-staging.pipe` - Staging pipeline  
✅ `scratch_deploy.js` - Deploy production  
✅ `deploy-staging.js` - Deploy staging  
✅ `ROCKETRIDE_STAGING.md` - RocketRide setup guide  
✅ `STAGING_WORKFLOW.md` - Feature branch workflow  
✅ `vercel.json` - Vercel configuration  

---

## **Quick Reference**

```bash
# Test in staging
git checkout -b feature/test
git push origin feature/test
# → Vercel creates preview URL automatically

# Deploy to production
git checkout main
git merge feature/test
git push origin main
# → Deploys to https://rocketride-lease-audit.vercel.app

# View pipeline runs
# → Go to https://cloud.rocketride.ai
```

---

**Last Updated**: 2026-09-01  
**Status**: ✅ Complete & Ready for Staging
