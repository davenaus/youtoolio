#!/bin/bash

# YouTool.io Image Optimization Script
# This script downloads and optimizes the logo image

echo "🚀 YouTool.io Image Optimization"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed (for optimization)
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not found. Installing...${NC}"
    echo ""
    
    # Detect OS and install ImageMagick
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing ImageMagick via Homebrew..."
            brew install imagemagick
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y imagemagick
    else
        echo -e "${RED}Please install ImageMagick manually: https://imagemagick.org/script/download.php${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📥 Downloading logo from Tumblr...${NC}"
# Download the logo
curl -L "https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png" \
     -o "public/images/logo-original.png"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Downloaded successfully${NC}"
else
    echo -e "${RED}❌ Download failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Optimizing logo (resizing and compressing)...${NC}"

# Optimize the logo
# - Resize to 200px height (2-3x display size for retina)
# - Maintain aspect ratio
# - High quality compression
# - PNG optimization
convert "public/images/logo-original.png" \
        -resize x200 \
        -quality 95 \
        -strip \
        "public/images/logo.png"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Optimized successfully${NC}"
else
    echo -e "${RED}❌ Optimization failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Size comparison:${NC}"
# Get file sizes
original_size=$(stat -f%z "public/images/logo-original.png" 2>/dev/null || stat -c%s "public/images/logo-original.png" 2>/dev/null)
optimized_size=$(stat -f%z "public/images/logo.png" 2>/dev/null || stat -c%s "public/images/logo.png" 2>/dev/null)

# Calculate savings
original_kb=$((original_size / 1024))
optimized_kb=$((optimized_size / 1024))
savings=$((original_kb - optimized_kb))
savings_percent=$(( (savings * 100) / original_kb ))

echo "  Original:  ${original_kb} KB"
echo "  Optimized: ${optimized_kb} KB"
echo -e "${GREEN}  Savings:   ${savings} KB (${savings_percent}%)${NC}"

# Clean up original
rm "public/images/logo-original.png"

echo ""
echo -e "${GREEN}✅ Logo optimization complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update src/pages/Home/Home.tsx (around line 1078)"
echo "   Change the LogoImage src from:"
echo "   'https://64.media.tumblr.com/...' to '/images/logo.png'"
echo ""
echo "2. Build and test:"
echo "   npm run build"
echo "   npx serve -s build"
echo ""
echo "3. Run Lighthouse to verify improvements:"
echo "   npm install -g lighthouse"
echo "   lighthouse http://localhost:3000 --view"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
