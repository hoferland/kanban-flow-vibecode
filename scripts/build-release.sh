#!/bin/bash

# Flow Kanban - Build Release Script
# This script helps you build the app for release

set -e  # Exit on error

echo "🚀 Flow Kanban - Build Release Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get current version from tauri.conf.json (Tauri v1 format)
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' packages/desktop/src-tauri/tauri.conf.json | head -1 | cut -d'"' -f4)
echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Ask if user wants to update version
read -p "Do you want to update the version? (y/n): " UPDATE_VERSION
if [[ $UPDATE_VERSION =~ ^[Yy]$ ]]; then
    read -p "Enter new version (e.g., 0.2.0): " NEW_VERSION
    
    # Update version in tauri.conf.json (macOS compatible, Tauri v1 format)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" packages/desktop/src-tauri/tauri.conf.json
    else
        sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" packages/desktop/src-tauri/tauri.conf.json
    fi
    
    echo "✅ Version updated to $NEW_VERSION"
    CURRENT_VERSION=$NEW_VERSION
else
    echo "ℹ️  Keeping version $CURRENT_VERSION"
fi

echo ""
echo "🔨 Building production app..."
echo ""

# Navigate to desktop package and build
cd packages/desktop

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Build the app
echo "🔧 Running Tauri build..."
npm run tauri build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Build artifacts location:"
    echo "   packages/desktop/src-tauri/target/release/bundle/dmg/"
    echo ""
    echo "📦 Generated files:"
    echo "   - Flow_${CURRENT_VERSION}_aarch64.dmg (Apple Silicon)"
    echo "   - Flow_${CURRENT_VERSION}_x64.dmg (Intel)"
    echo "   - Flow_${CURRENT_VERSION}_aarch64.dmg.tar.gz"
    echo "   - Flow_${CURRENT_VERSION}_x64.dmg.tar.gz"
    echo "   - Signature files (.sig)"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to packages/desktop/src-tauri/target/release/bundle/dmg/"
    echo "   2. Create a GitHub release with tag v${CURRENT_VERSION}"
    echo "   3. Upload ALL .dmg, .dmg.tar.gz, and .sig files"
    echo "   4. Create latest.json manifest (see docs/RELEASE.md)"
    echo ""
    echo "📖 For detailed instructions, see: docs/RELEASE.md"
else
    echo ""
    echo "❌ Build failed. Check the errors above."
    exit 1
fi
