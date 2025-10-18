#!/usr/bin/env bash
# Validation script to ensure all styling uses Tailwind CSS

set -e

echo "🔍 Validating styling patterns..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check for SCSS imports (excluding Payload admin)
echo "📦 Checking for SCSS imports..."
SCSS_IMPORTS=$(grep -r "import.*\.scss" src \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude="*.scss" \
  --exclude-dir="(payload)" \
  | grep -v "src/app/(payload)" || true)
if [ -n "$SCSS_IMPORTS" ]; then
  echo -e "${RED}❌ Found SCSS imports (should use Tailwind instead):${NC}"
  echo "$SCSS_IMPORTS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No SCSS imports found${NC}"
fi
echo ""

# Check for CSS module imports
echo "📦 Checking for CSS module imports..."
CSS_MODULES=$(grep -r "\.module\.(css|scss)" src --exclude-dir="app/(payload)" || true)
if [ -n "$CSS_MODULES" ]; then
  echo -e "${RED}❌ Found CSS module imports (should use Tailwind instead):${NC}"
  echo "$CSS_MODULES"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No CSS module imports found${NC}"
fi
echo ""

# Check for inline styles (excluding specific Payload components that require it)
echo "🎨 Checking for inline styles..."
INLINE_STYLES=$(grep -r "style={{" src \
  --exclude="*.scss" \
  --exclude-dir="node_modules" \
  --exclude-dir="app/(payload)" \
  --exclude-dir=".next" || true)
if [ -n "$INLINE_STYLES" ]; then
  echo -e "${YELLOW}⚠️  Found inline styles (consider using Tailwind classes):${NC}"
  echo "$INLINE_STYLES"
  echo -e "${YELLOW}Note: This is a warning. Inline styles may be necessary for dynamic values.${NC}"
else
  echo -e "${GREEN}✅ No inline styles found${NC}"
fi
echo ""

# Check for styled-components or emotion
echo "💅 Checking for CSS-in-JS libraries..."
CSS_IN_JS=$(grep -r "styled\.|css\`" src --exclude-dir="node_modules" --exclude-dir=".next" || true)
if [ -n "$CSS_IN_JS" ]; then
  echo -e "${RED}❌ Found CSS-in-JS usage (should use Tailwind instead):${NC}"
  echo "$CSS_IN_JS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No CSS-in-JS usage found${NC}"
fi
echo ""

# TypeScript type checking
echo "🔍 Running TypeScript type checking..."
if pnpm exec tsc --noEmit; then
  echo -e "${GREEN}✅ TypeScript type checking passed${NC}"
else
  echo -e "${RED}❌ TypeScript type checking failed${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ESLint check
echo "🔍 Running ESLint with Tailwind plugin..."
if timeout 90 pnpm run lint; then
  echo -e "${GREEN}✅ ESLint validation passed${NC}"
else
  echo -e "${RED}❌ ESLint validation failed${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All style validations passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS validation error(s)${NC}"
  exit 1
fi
