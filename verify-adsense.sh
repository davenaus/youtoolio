#!/bin/bash

# AdSense Implementation Verification Script
# Run this after building to verify everything is working

echo "🔍 VERIFYING ADSENSE IMPLEMENTATION (UPDATED)..."
echo "================================================"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "✅ Build directory found"

# Check ads.txt
echo ""
echo "📄 Checking ads.txt..."
if [ -f "build/ads.txt" ]; then
    echo "✅ ads.txt exists in build directory"
    echo "📄 Content:"
    cat build/ads.txt
    
    # Verify correct publisher ID
    if grep -q "pub-3983714365564262" build/ads.txt; then
        echo "✅ Correct publisher ID found in ads.txt"
    else
        echo "❌ Publisher ID mismatch in ads.txt"
    fi
else
    echo "❌ ads.txt missing from build directory"
fi

# Check robots.txt for /static/ blocking issue
echo ""
echo "🤖 Checking robots.txt for critical issues..."
if [ -f "build/robots.txt" ]; then
    echo "✅ robots.txt exists in build directory"
    
    if grep -q "Disallow: /static/" build/robots.txt; then
        echo "❌ CRITICAL: robots.txt is blocking /static/ files!"
        echo "This prevents search engines from accessing CSS/JS files"
    elif grep -q "Allow: /static/" build/robots.txt; then
        echo "✅ /static/ files properly allowed in robots.txt"
    else
        echo "⚠️  /static/ not explicitly mentioned in robots.txt"
    fi
else
    echo "❌ robots.txt missing from build directory"
fi

# Check sitemap.xml
echo ""
echo "🗺️  Checking sitemap.xml..."
if [ -f "build/sitemap.xml" ]; then
    echo "✅ sitemap.xml exists in build directory"
    echo "📊 Number of URLs in sitemap:"
    grep -c "<url>" build/sitemap.xml
else
    echo "❌ sitemap.xml missing from build directory"
fi

# Check index.html for AdSense script
echo ""
echo "📜 Checking index.html for AdSense..."
if [ -f "build/index.html" ]; then
    if grep -q "pub-3983714365564262" build/index.html; then
        echo "✅ AdSense script with correct publisher ID found in index.html"
    else
        echo "❌ AdSense script or publisher ID missing from index.html"
    fi
else
    echo "❌ index.html missing from build directory"
fi

# Check AdSense component for display issue
echo ""
echo "📺 Checking AdSense component..."
if [ -f "src/components/AdSense/AdSense.tsx" ]; then
    if grep -q "display: none" src/components/AdSense/AdSense.tsx; then
        echo "❌ CRITICAL: AdSense component has 'display: none'!"
        echo "Ads will never be visible to users"
    elif grep -q "display: flex" src/components/AdSense/AdSense.tsx; then
        echo "✅ AdSense component display properly configured"
    else
        echo "⚠️  AdSense component display property not found"
    fi
else
    echo "❌ AdSense component file missing"
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "REACT_APP_ADSENSE_CLIENT_ID=ca-pub-3983714365564262" .env; then
        echo "✅ AdSense client ID configured in .env"
    else
        echo "❌ AdSense client ID missing or incorrect in .env"
    fi
    
    if grep -q "REACT_APP_ADSENSE_SLOT_" .env; then
        echo "✅ AdSense slot IDs configured"
        echo "📊 Configured slots:"
        grep "REACT_APP_ADSENSE_SLOT_" .env
    else
        echo "❌ AdSense slot IDs not configured"
    fi
else
    echo "❌ .env file not found"
fi

# Summary
echo ""
echo "📋 VERIFICATION SUMMARY"
echo "======================"

# Count successful checks
checks=0
total=5

[ -d "build" ] && ((checks++))
[ -f "build/ads.txt" ] && grep -q "pub-3983714365564262" build/ads.txt && ((checks++))
[ -f "build/sitemap.xml" ] && ((checks++))
[ -f "build/index.html" ] && grep -q "pub-3983714365564262" build/index.html && ((checks++))
[ -f ".env" ] && grep -q "REACT_APP_ADSENSE_CLIENT_ID=ca-pub-3983714365564262" .env && ((checks++))

echo "✅ Passed: $checks/$total checks"

if [ $checks -eq $total ]; then
    echo ""
    echo "🎉 ALL CHECKS PASSED!"
    echo "Your website is ready for AdSense approval!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy the build folder to your hosting"
    echo "2. Verify https://youtool.io/ads.txt is accessible"
    echo "3. Verify https://youtool.io/sitemap.xml is accessible"
    echo "4. Apply for Google AdSense"
else
    echo ""
    echo "❌ Some checks failed. Please review the issues above."
fi

echo ""
echo "🔗 Quick test URLs (after deployment):"
echo "• https://youtool.io/ads.txt"
echo "• https://youtool.io/sitemap.xml"
echo "• https://youtool.io/privacy-policy"
echo "• https://youtool.io/terms-of-service"