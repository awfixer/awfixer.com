# Styling Guide: Tailwind CSS & shadcn/ui

This project uses **Tailwind CSS** and **shadcn/ui** for all styling. This guide explains our styling approach and validation tooling.

## Table of Contents

- [Core Principles](#core-principles)
- [Technology Stack](#technology-stack)
- [Component Patterns](#component-patterns)
- [Validation Tooling](#validation-tooling)
- [Development Workflow](#development-workflow)
- [Common Patterns](#common-patterns)
- [Migration Examples](#migration-examples)

## Core Principles

### ✅ DO

- **Use Tailwind utility classes** for all styling
- **Use shadcn/ui components** for common UI elements
- **Use CSS variables** defined in `globals.css` for theming
- **Use `cn()` utility** from `@/utilities/ui` for conditional classes
- **Use arbitrary values** `[value]` when necessary for one-off styles
- **Use responsive modifiers** (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) for breakpoints
- **Use dark mode modifiers** (`dark:`) for theme-aware styles

### ❌ DON'T

- ❌ Create `.scss` or `.css` files (except `globals.css`)
- ❌ Use CSS modules (`.module.css` or `.module.scss`)
- ❌ Use inline `style` props (except for truly dynamic values)
- ❌ Use CSS-in-JS libraries (styled-components, emotion, etc.)
- ❌ Use BEM class naming conventions
- ❌ Create custom CSS classes outside Tailwind's @layer directives

## Technology Stack

### Tailwind CSS

Our Tailwind configuration is in `tailwind.config.mjs`:

```typescript
// Custom theme extensions
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ... more colors
}
```

### shadcn/ui

Configuration in `components.json`:

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/(frontend)/globals.css"
  }
}
```

Available components in `src/components/ui/`:

- `button.tsx` - Button component with variants
- `card.tsx` - Card component
- `checkbox.tsx` - Checkbox component
- `input.tsx` - Input component
- `label.tsx` - Label component
- `select.tsx` - Select dropdown
- `textarea.tsx` - Textarea component
- `pagination.tsx` - Pagination component
- `calendar.tsx` - Calendar component

## Component Patterns

### Basic Component Structure

```tsx
import { cn } from '@/utilities/ui'

export const MyComponent: React.FC<{
  className?: string
  variant?: 'default' | 'primary'
}> = ({ className, variant = 'default' }) => {
  return (
    <div
      className={cn(
        // Base styles
        'flex items-center gap-4 p-4',
        // Conditional styles
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'default',
        },
        // Allow external className override
        className,
      )}
    >
      {/* Content */}
    </div>
  )
}
```

### Using shadcn/ui Components

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const LoginForm = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Responsive Design

```tsx
<div
  className="
  flex flex-col gap-2
  md:flex-row md:gap-4
  lg:gap-8
"
>
  {/* Mobile: column, tablet: row, desktop: larger gaps */}
</div>
```

### Dark Mode Support

```tsx
<div
  className="
  bg-white text-gray-900
  dark:bg-gray-900 dark:text-white
"
>
  {/* Automatically adapts to theme */}
</div>
```

### Dynamic Width Component Pattern

```tsx
import { cn } from '@/utilities/ui'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const widthClass = width
    ? {
        '25': 'max-w-[25%]',
        '50': 'max-w-[50%]',
        '75': 'max-w-[75%]',
        '100': 'max-w-full',
      }[String(width)] || `max-w-[${width}%]`
    : undefined

  return <div className={cn(widthClass, className)}>{children}</div>
}
```

## Validation Tooling

### Automated Checks

We have comprehensive validation to ensure styling standards:

#### 1. ESLint Plugin (eslint-plugin-tailwindcss)

Configured in `eslint.config.mjs`:

```javascript
import tailwind from 'eslint-plugin-tailwindcss'

const eslintConfig = [
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      'tailwindcss/classnames-order': 'warn', // Enforce consistent class order
      'tailwindcss/enforces-shorthand': 'warn', // Use shorthand classes
      'tailwindcss/no-contradicting-classname': 'error', // Prevent conflicting classes
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: ['payload-richtext', 'prose', 'sr-only'],
        },
      ],
    },
  },
]
```

#### 2. Style Validation Script

`scripts/validate-styles.sh` checks for:

- ❌ SCSS imports
- ❌ CSS module imports
- ⚠️ Inline styles (warning only)
- ❌ CSS-in-JS usage
- ✅ TypeScript type checking
- ✅ ESLint validation

#### 3. Pre-commit Hook

The pre-commit hook (`.husky/pre-commit`) runs:

1. `lint-staged` - Format and lint changed files
2. `typecheck` - TypeScript type validation

### Available Scripts

```bash
# Type checking only
pnpm run typecheck

# Style validation
pnpm run validate:styles

# Full validation (type check + lint + style validation)
pnpm run validate:all

# Lint with auto-fix
pnpm run lint:fix
```

## Development Workflow

### 1. Daily Development

```bash
# Start development server
pnpm dev

# Run validation before committing
pnpm run validate:all
```

### 2. Pre-commit (Automatic)

When you run `git commit`, the pre-commit hook automatically:

- ✅ Formats code with Prettier
- ✅ Lints with ESLint (including Tailwind rules)
- ✅ Runs TypeScript type checking

### 3. Continuous Integration

The CI pipeline runs:

```bash
pnpm run ci  # Includes build, which validates everything
```

## Common Patterns

### Container Layout

```tsx
<div className="container mx-auto px-4 py-8">{/* Container with consistent padding */}</div>
```

### Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Responsive grid */}</div>
```

### Flexbox Layouts

```tsx
<div className="flex items-center justify-between gap-4">
  {/* Horizontal layout with space between */}
</div>
```

### Card Components

```tsx
import { Card } from '@/components/ui/card'

;<Card className="p-6 hover:shadow-lg transition-shadow">{/* Content */}</Card>
```

### Form Layouts

```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Field Name</Label>
    <Input id="field" />
  </div>
  {/* More fields */}
</form>
```

### Typography

```tsx
<div className="prose dark:prose-invert max-w-none">
  {/* Rich text content with proper typography */}
</div>
```

## Migration Examples

### Before: SCSS + BEM

```tsx
// ❌ OLD APPROACH
import './styles.scss'

const Component = () => (
  <div className="my-component">
    <div className="my-component__header">
      <h1 className="my-component__title">Title</h1>
    </div>
  </div>
)
```

```scss
// styles.scss
.my-component {
  padding: 1rem;

  &__header {
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: bold;
  }
}
```

### After: Tailwind CSS

```tsx
// ✅ NEW APPROACH
import { cn } from '@/utilities/ui'

const Component = () => (
  <div className="p-4">
    <div className="mb-4">
      <h1 className="text-2xl font-bold">Title</h1>
    </div>
  </div>
)
```

### Before: Inline Styles

```tsx
// ❌ OLD APPROACH
<div
  style={{
    backgroundColor: 'transparent',
    padding: 0,
    position: 'relative',
    zIndex: 'unset',
  }}
>
  {/* Content */}
</div>
```

### After: Tailwind Classes

```tsx
// ✅ NEW APPROACH
<div className="bg-transparent p-0 relative z-auto">{/* Content */}</div>
```

## Troubleshooting

### ESLint Tailwind Warnings

If you see warnings about custom class names:

1. Check if it's a necessary custom class
2. Add it to the whitelist in `eslint.config.mjs`

```javascript
'tailwindcss/no-custom-classname': ['warn', {
  whitelist: ['your-custom-class']
}]
```

### Type Errors

Run type checking to identify issues:

```bash
pnpm run typecheck
```

### Validation Failures

If validation fails:

1. Run `pnpm run validate:all` to see all issues
2. Run `pnpm run lint:fix` to auto-fix linting issues
3. Manually fix remaining TypeScript and style issues

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind ESLint Plugin](https://github.com/francoismassart/eslint-plugin-tailwindcss)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) (VS Code extension)

## Questions?

If you have questions about styling patterns or need help with a specific component, please:

1. Check this guide first
2. Review existing components in `src/components/`
3. Consult the Tailwind CSS documentation
4. Ask the team for guidance
