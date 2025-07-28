#!/bin/bash

# TypeScript Migration and Build Script for MCP Blocks Server

echo "🚀 MCP Blocks Server - TypeScript Setup & Build"
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or later."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Version 20 or later is recommended."
else
    echo "✅ Node.js version: $(node -v)"
fi

# Check npm
if ! command_exists npm; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install TypeScript dependencies if not already installed
echo ""
echo "🔧 Installing TypeScript dependencies..."
npm install --save-dev typescript @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint ts-node

# Clean previous build
echo ""
echo "🧹 Cleaning previous build..."
npm run clean 2>/dev/null || rm -rf dist

# Type check
echo ""
echo "🔍 Running type check..."
if npm run type-check; then
    echo "✅ TypeScript type checking passed!"
else
    echo "❌ TypeScript type checking failed. Please fix the errors above."
    exit 1
fi

# Build
echo ""
echo "🔨 Building TypeScript..."
if npm run build; then
    echo "✅ TypeScript build completed successfully!"
else
    echo "❌ TypeScript build failed. Please fix the errors above."
    exit 1
fi

# Run linting
echo ""
echo "🧐 Running ESLint..."
if npm run lint; then
    echo "✅ Linting passed!"
else
    echo "⚠️  Linting found some issues. Consider fixing them."
fi

# Check if dist directory was created
if [ -d "dist" ]; then
    echo ""
    echo "📁 Build output structure:"
    find dist -type f -name "*.js" | head -10
    if [ $(find dist -type f -name "*.js" | wc -l) -gt 10 ]; then
        echo "   ... and $(expr $(find dist -type f -name "*.js" | wc -l) - 10) more files"
    fi
else
    echo "❌ Build directory 'dist' was not created."
    exit 1
fi

echo ""
echo "🎉 TypeScript setup and build completed successfully!"
echo ""
echo "Next steps:"
echo "  • Run 'npm start' to start the compiled server"
echo "  • Run 'npm run dev' to start in development mode"
echo "  • Run 'npm run watch' to watch for changes during development"
echo "  • Check README-TypeScript.md for detailed documentation"
echo ""
echo "Environment variables needed:"
echo "  • BLOCKS_KEY - Your blocks API key"
echo "  • USERNAME - Your username"  
echo "  • USER_KEY - Your user key"
echo ""
