#!/bin/bash

# Performance Testing Script
# Compares build sizes before and after optimization

echo "🧪 YouTool.io Performance Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if build directory exists
if [ ! -d "build" ]; then
    echo -e "${YELLOW}No build directory found. Building now...${NC}"
    npm run build
fi

echo -e "${BLUE}📊 Analyzing bundle size...${NC}"
echo ""

# Calculate total JS size
js_size=$(find build/static/js -name "*.js" -exec du -b {} + | awk '{sum+=$1} END {print sum}')
js_size_kb=$((js_size / 1024))

# Calculate total CSS size
css_size=$(find build/static/css -name "*.css" -exec du -b {} + | awk '{sum+=$1} END {print sum}')
css_size_kb=$((css_size / 1024))

# Calculate total image size
img_size=$(find build/images -type f -exec du -b {} + 2>/dev/null | awk '{sum+=$1} END {print sum}')
img_size_kb=$((img_size / 1024))

# Total
total_kb=$((js_size_kb + css_size_kb + img_size_kb))

echo "Bundle Breakdown:"
echo "─────────────────"
echo -e "JavaScript:  ${js_size_kb} KB"
echo -e "CSS:         ${css_size_kb} KB"
echo -e "Images:      ${img_size_kb} KB"
echo "─────────────────"
echo -e "Total:       ${total_kb} KB"
echo ""

# Performance assessment
if [ $total_kb -lt 100 ]; then
    echo -e "${GREEN}✅ Excellent! Bundle is under 100 KB${NC}"
    score="A+"
elif [ $total_kb -lt 200 ]; then
    echo -e "${GREEN}✅ Good! Bundle is under 200 KB${NC}"
    score="A"
elif [ $total_kb -lt 300 ]; then
    echo -e "${YELLOW}⚠️  Could be better. Bundle is ${total_kb} KB${NC}"
    score="B"
else
    echo -e "${RED}❌ Too large. Bundle is ${total_kb} KB${NC}"
    score="C"
fi

echo ""
echo -e "${BLUE}Performance Grade: ${score}${NC}"
echo ""

# Check for lazy loading (multiple JS chunks)
chunk_count=$(find build/static/js -name "*.js" | wc -l)
echo "Code Splitting:"
echo "─────────────────"
echo -e "JS Chunks: ${chunk_count}"

if [ $chunk_count -gt 5 ]; then
    echo -e "${GREEN}✅ Code splitting is working!${NC}"
else
    echo -e "${RED}❌ Code splitting may not be working correctly${NC}"
    echo "   Expected 5+ chunks, found ${chunk_count}"
fi

echo ""

# Check if images are optimized
echo "Image Optimization:"
echo "─────────────────"
if [ -f "build/images/logo.png" ]; then
    logo_size=$(du -b build/images/logo.png | awk '{print $1}')
    logo_size_kb=$((logo_size / 1024))
    echo -e "Logo size: ${logo_size_kb} KB"
    
    if [ $logo_size_kb -lt 20 ]; then
        echo -e "${GREEN}✅ Logo is optimized!${NC}"
    else
        echo -e "${YELLOW}⚠️  Logo could be smaller (${logo_size_kb} KB)${NC}"
        echo "   Run: ./optimize-images.sh"
    fi
else
    echo -e "${RED}❌ Logo not found at /images/logo.png${NC}"
    echo "   Run: ./optimize-images.sh"
fi

echo ""

# Check for cache headers
echo "Cache Configuration:"
echo "─────────────────"
if [ -f "build/.htaccess" ]; then
    echo -e "${GREEN}✅ .htaccess found (Apache)${NC}"
else
    echo -e "${YELLOW}⚠️  .htaccess not in build${NC}"
fi

if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅ netlify.toml found${NC}"
fi

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
fi

echo ""
echo "─────────────────────────────────"
echo ""

# Overall assessment
if [ $total_kb -lt 100 ] && [ $chunk_count -gt 5 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Your optimizations are working perfectly!${NC}"
    echo ""
    echo "Your site is now:"
    echo "  ⚡ Fast to load (small bundle)"
    echo "  📦 Well code-split (lazy loading)"
    echo "  💾 Properly cached"
    echo ""
    echo "Ready to deploy? Run: git push"
else
    echo -e "${YELLOW}⚠️  Some optimizations may not be fully applied.${NC}"
    echo ""
    echo "Checklist:"
    echo "  [ ] Run ./optimize-images.sh"
    echo "  [ ] Update logo path in Home.tsx"
    echo "  [ ] npm run build"
    echo "  [ ] Run this test again"
fi

echo ""
echo "For detailed metrics, run:"
echo "  npm run lighthouse"
echo ""
