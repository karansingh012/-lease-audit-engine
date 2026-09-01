#!/bin/bash

# RocketRide Staging Environment Setup Script
# This script helps configure Vercel environment variables for staging

echo "======================================"
echo "LeaseAudit AI - RocketRide Staging Setup"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please ensure you have a .env.local file in the project root"
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Extract values
ROCKETRIDE_APIKEY=$(grep ROCKETRIDE_APIKEY .env.local | cut -d '=' -f2)
ROCKETRIDE_URI=$(grep ROCKETRIDE_URI .env.local | cut -d '=' -f2)
ROCKETRIDE_GEMINI_APIKEY=$(grep ROCKETRIDE_GEMINI_APIKEY .env.local | cut -d '=' -f2)

echo "Extracted RocketRide Configuration:"
echo "  ROCKETRIDE_APIKEY: ${ROCKETRIDE_APIKEY:0:20}..."
echo "  ROCKETRIDE_URI: $ROCKETRIDE_URI"
echo "  ROCKETRIDE_GEMINI_APIKEY: ${ROCKETRIDE_GEMINI_APIKEY:0:20}..."
echo ""

echo "======================================"
echo "Next Steps:"
echo "======================================"
echo ""
echo "1. Go to Vercel Dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Select project: rocketride-lease-audit"
echo ""
echo "3. Go to Settings → Environment Variables"
echo ""
echo "4. Add these environment variables:"
echo ""
echo "   Variable 1:"
echo "   Name: ROCKETRIDE_APIKEY"
echo "   Value: $ROCKETRIDE_APIKEY"
echo "   Environments: ✅ Production, ✅ Preview, ✅ Development"
echo ""
echo "   Variable 2:"
echo "   Name: ROCKETRIDE_URI"
echo "   Value: $ROCKETRIDE_URI"
echo "   Environments: ✅ Production, ✅ Preview, ✅ Development"
echo ""
echo "   Variable 3:"
echo "   Name: ROCKETRIDE_GEMINI_APIKEY"
echo "   Value: $ROCKETRIDE_GEMINI_APIKEY"
echo "   Environments: ✅ Production, ✅ Preview, ✅ Development"
echo ""
echo "5. Click 'Save' for each variable"
echo ""
echo "6. Test the setup:"
echo "   - Create a feature branch"
echo "   - Push to GitHub"
echo "   - Check Vercel for preview deployment"
echo "   - Test audit with sample PDFs"
echo ""
echo "======================================"
echo "Configuration Status"
echo "======================================"
echo ""
echo "✅ Production: Configured in .env.local"
echo "⏳ Staging/Preview: Requires Vercel setup (see steps above)"
echo "⏳ Feature Branches: Will work after Vercel env vars added"
echo ""
echo "For more details, see ROCKETRIDE_STAGING.md"
