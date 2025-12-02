#!/bin/bash

# Blog Admin Whitelist Setup Script
# This script helps you set up Discord-based blog admin access

set -e

echo "================================================"
echo "  Blog Admin Whitelist Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local file not found${NC}"
    echo "Please create .env.local from .env.example first"
    exit 1
fi

# Function to check if a variable exists in .env.local
check_env_var() {
    if grep -q "^$1=" .env.local; then
        return 0
    else
        return 1
    fi
}

# Function to add or update env variable
set_env_var() {
    local key=$1
    local value=$2

    if check_env_var "$key"; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^$key=.*|$key=$value|" .env.local
        else
            sed -i "s|^$key=.*|$key=$value|" .env.local
        fi
        echo -e "${GREEN}✓${NC} Updated $key"
    else
        # Add new
        echo "$key=$value" >> .env.local
        echo -e "${GREEN}✓${NC} Added $key"
    fi
}

echo "Step 1: Checking required environment variables..."
echo ""

# Check for required variables
MISSING_VARS=()

required_vars=(
    "DISCORD_CLIENT_ID"
    "DISCORD_CLIENT_SECRET"
    "NEXT_PUBLIC_SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
    "BETTER_AUTH_SECRET"
    "PAYLOAD_SECRET"
)

for var in "${required_vars[@]}"; do
    if ! check_env_var "$var"; then
        MISSING_VARS+=("$var")
        echo -e "${YELLOW}⚠${NC}  Missing: $var"
    else
        echo -e "${GREEN}✓${NC} Found: $var"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo "Please add these to your .env.local file:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "See DISCORD_BLOG_ADMIN_SETUP.md for more information"
    exit 1
fi

echo ""
echo -e "${GREEN}All required variables found!${NC}"
echo ""

# Check for BLOG_ADMIN_WHITELIST
echo "Step 2: Setting up blog admin whitelist..."
echo ""

if check_env_var "BLOG_ADMIN_WHITELIST"; then
    current_whitelist=$(grep "^BLOG_ADMIN_WHITELIST=" .env.local | cut -d'=' -f2)
    echo -e "${GREEN}✓${NC} BLOG_ADMIN_WHITELIST already exists"
    echo "Current value: $current_whitelist"
    echo ""
    read -p "Do you want to update it? (y/N): " update_whitelist

    if [[ $update_whitelist =~ ^[Yy]$ ]]; then
        echo ""
        echo "Enter Discord user IDs (comma-separated, no spaces):"
        echo "Example: 123456789012345678,987654321098765432"
        echo ""
        read -p "Discord IDs: " discord_ids

        if [ -n "$discord_ids" ]; then
            set_env_var "BLOG_ADMIN_WHITELIST" "$discord_ids"
        else
            echo -e "${YELLOW}⚠${NC}  Keeping existing value"
        fi
    fi
else
    echo "BLOG_ADMIN_WHITELIST not found. Let's set it up."
    echo ""
    echo "To get Discord user IDs:"
    echo "1. Enable Developer Mode in Discord (Settings → Advanced)"
    echo "2. Right-click on a user and select 'Copy User ID'"
    echo ""
    read -p "Enter Discord user IDs (comma-separated, no spaces): " discord_ids

    if [ -n "$discord_ids" ]; then
        set_env_var "BLOG_ADMIN_WHITELIST" "$discord_ids"
    else
        echo -e "${YELLOW}⚠${NC}  Skipping whitelist setup. You can add it later."
    fi
fi

echo ""
echo "Step 3: Database migration..."
echo ""

if command -v psql &> /dev/null; then
    echo "PostgreSQL client found. Would you like to run the migration now?"
    echo ""
    read -p "Run database migration? (y/N): " run_migration

    if [[ $run_migration =~ ^[Yy]$ ]]; then
        database_url=$(grep "^DATABASE_URL=" .env.local | cut -d'=' -f2)

        if [ -n "$database_url" ]; then
            echo "Running migration..."
            psql "$database_url" -f database/migrations/001_add_blog_admin_whitelist.sql
            echo -e "${GREEN}✓${NC} Migration completed"
        else
            echo -e "${RED}Error: DATABASE_URL not found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠${NC}  Skipping migration. Run it manually with:"
        echo "   psql \$DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql"
    fi
else
    echo -e "${YELLOW}⚠${NC}  PostgreSQL client (psql) not found"
    echo "Please run the migration manually:"
    echo "  psql \$DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql"
    echo ""
    echo "Or use Supabase SQL Editor to run:"
    echo "  database/migrations/001_add_blog_admin_whitelist.sql"
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Restart your development server:"
echo "   ${GREEN}pnpm dev${NC}"
echo ""
echo "2. Sign in with Discord:"
echo "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo "3. Access blog admin (if whitelisted):"
echo "   ${GREEN}http://localhost:3000/blog-admin${NC}"
echo ""
echo "4. Get your Discord user ID:"
echo "   - Sign in first"
echo "   - Check the database:"
echo "     ${GREEN}SELECT discord_id, email FROM \"user\"${NC}"
echo ""
echo "For more information, see:"
echo "  - DISCORD_BLOG_ADMIN_SETUP.md"
echo "  - AUTH_SETUP.md"
echo ""
echo "Troubleshooting: If you get 'Access Denied':"
echo "  1. Verify your Discord ID is in BLOG_ADMIN_WHITELIST"
echo "  2. Restart the dev server"
echo "  3. Sign out and sign in again"
echo ""
