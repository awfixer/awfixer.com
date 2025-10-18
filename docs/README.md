# Documentation

This directory contains comprehensive documentation for the AWFixer and Friends website.

## Available Documentation

### 📚 [Styling Guide](./STYLING_GUIDE.md)

Complete guide to styling with Tailwind CSS and shadcn/ui.

**Contents:**

- Core principles and best practices
- Technology stack overview
- Component patterns with examples
- Validation tooling explanation
- Development workflow
- Common patterns library
- Migration examples from SCSS/CSS
- Troubleshooting tips

**When to read:**

- Starting development on new components
- Need to understand styling patterns
- Migrating legacy code to Tailwind
- Setting up your development environment

### 📝 [Refactoring Summary](./REFACTORING_SUMMARY.md)

Summary of the Tailwind CSS refactoring project.

**Contents:**

- Overview of refactoring changes
- Components that were refactored
- Files removed
- Validation tooling added
- Benefits and improvements
- Validation without building
- Testing instructions

**When to read:**

- Understanding what changed in the refactoring
- Learning about validation tooling
- Need to verify changes without building
- Onboarding new team members

## Quick Links

### Validation Commands

```bash
# Type checking
pnpm run typecheck

# Lint checking
pnpm run lint

# Auto-fix lint issues
pnpm run lint:fix

# Style validation
pnpm run validate:styles

# Full validation suite
pnpm run validate:all
```

### Development Workflow

```bash
# 1. Start development
pnpm dev

# 2. Make changes using Tailwind CSS

# 3. Validate before committing
pnpm run validate:all

# 4. Commit (pre-commit hook runs automatically)
git add .
git commit -m "feat: your changes"
```

## External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

When adding new features:

1. ✅ Use Tailwind CSS for all styling
2. ✅ Use shadcn/ui components when available
3. ✅ Run validation before committing
4. ✅ Update documentation if adding new patterns
5. ✅ Test with `pnpm run validate:all`

## Questions?

If you have questions about:

- **Styling patterns** → See [Styling Guide](./STYLING_GUIDE.md)
- **What changed** → See [Refactoring Summary](./REFACTORING_SUMMARY.md)
- **Validation issues** → Check the troubleshooting sections in both docs

---

**Note:** This documentation is maintained alongside the codebase. Please keep it up to date when making significant changes.
