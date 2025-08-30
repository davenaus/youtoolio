#!/bin/bash

# YouTool.io - Clean Build & Deploy Script
# This script cleans the project and rebuilds it for React 19 compatibility

echo "🚀 YouTool.io - React 19 Migration & Deploy Script"
echo "=================================================="

# Step 1: Clean existing dependencies and build
echo "🧹 Cleaning existing build and dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -rf build

# Step 2: Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Step 3: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 4: Build the project
echo "🔨 Building the project..."
npm run build

# Step 5: Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready to deploy to Vercel."
    echo "📁 Build files are in the 'build' directory."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Commit your changes: git add . && git commit -m 'Fix: React 19 compatibility'"
    echo "   2. Push to GitHub: git push origin main"
    echo "   3. Vercel will automatically deploy!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
