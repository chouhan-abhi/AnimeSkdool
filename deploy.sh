#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="skdool.surge.sh"
BUILD_DIR="dist"

echo -e "${BLUE}🚀 Starting deployment to Surge...${NC}\n"

# Check if surge is installed
if ! command -v surge &> /dev/null; then
    echo -e "${RED}❌ Surge CLI is not installed.${NC}"
    echo -e "${YELLOW}Installing Surge CLI globally...${NC}"
    npm install -g surge
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Surge CLI. Please install it manually: npm install -g surge${NC}"
        exit 1
    fi
fi

# Build the project
echo -e "${BLUE}📦 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}\n"

# Check if dist directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory '$BUILD_DIR' not found.${NC}"
    exit 1
fi

# Create CNAME file if it doesn't exist
if [ ! -f "$BUILD_DIR/CNAME" ]; then
    echo -e "${BLUE}📝 Creating CNAME file...${NC}"
    echo "$DOMAIN" > "$BUILD_DIR/CNAME"
fi

# Deploy to Surge
echo -e "${BLUE}🌐 Deploying to Surge (${DOMAIN})...${NC}\n"
surge "$BUILD_DIR" "$DOMAIN"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Your site is live at: https://${DOMAIN}${NC}\n"
else
    echo -e "\n${RED}❌ Deployment failed.${NC}"
    exit 1
fi

