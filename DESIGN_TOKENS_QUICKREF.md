# Banyan Design Tokens - Quick Reference

Quick copy-paste reference for developers using the Banyan Design System.

## 🎨 Colors (Tailwind Classes)

```tsx
// Brand
bg-banyan-primary text-banyan-primary-contrast

// Text
text-banyan-text-default
text-banyan-text-subtle

// Backgrounds
bg-banyan-bg-base
bg-banyan-bg-surface

// Borders
border-banyan-border-default

// States
bg-banyan-success text-banyan-success
bg-banyan-warning text-banyan-warning
bg-banyan-error text-banyan-error
bg-banyan-info text-banyan-info

// Accents
bg-banyan-sand
bg-banyan-mist
```

## 📝 Typography

```tsx
text-display     // 64px - Large headlines
text-h1          // 48px - Page headings
text-h2          // 32px - Section headings
text-h3          // 24px - Subsection headings
text-body        // 18px - Body text, buttons
text-caption     // 14px - Small text, labels

font-regular     // 400
font-medium      // 500
font-semibold    // 600
```

## 📏 Spacing

```tsx
p-xxs gap-xxs m-xxs    // 4px
p-xs  gap-xs  m-xs     // 8px
p-s   gap-s   m-s      // 12px
p-m   gap-m   m-m      // 16px
p-l   gap-l   m-l      // 24px
p-xl  gap-xl  m-xl     // 48px
p-xxl gap-xxl m-xxl    // 96px
```

## 🔲 Border Radius

```tsx
rounded-s     // 4px
rounded-m     // 8px
rounded-l     // 12px
rounded-xl    // 20px
```

## 🌑 Shadows

```tsx
shadow-surface-low    // Subtle
shadow-surface-mid    // Medium
shadow-surface-high   // High elevation
```

## ⚡ Motion

```tsx
transition-all duration-fast ease-banyan      // 100ms
transition-all duration-base ease-banyan      // 200ms (default)
transition-all duration-slow ease-banyan      // 300ms

// Alternative easing
ease-banyan-in    // Acceleration
ease-banyan-out   // Deceleration
```

## 🧩 Component Classes

### Buttons
```tsx
className="btn-banyan-primary"     // Primary action
className="btn-banyan-secondary"   // Secondary action
className="btn-banyan-ghost"       // Tertiary action
```

### Cards
```tsx
className="card-banyan"
```

### Inputs
```tsx
className="input-banyan"
```

### Alerts
```tsx
className="alert-banyan alert-banyan-success"
className="alert-banyan alert-banyan-warning"
className="alert-banyan alert-banyan-error"
className="alert-banyan alert-banyan-info"
```

### Container
```tsx
className="container-banyan"
```

## 💻 TypeScript Usage

```tsx
import { banyanTokens, banyanClasses, getBanyanColor } from '@/lib/design-tokens';

// Tokens
banyanTokens.color.brand.primary      // '#1B4D3E'
banyanTokens.spacing.m                 // '16px'

// Classes
banyanClasses.button.primary          // 'btn-banyan-primary'

// Type-safe color
getBanyanColor('brand-primary')       // '#1B4D3E'
```

## 📋 Common Patterns

### Primary Button
```tsx
<button className="btn-banyan-primary">
  Click me
</button>
```

### Card with Content
```tsx
<div className="card-banyan">
  <h3 className="text-h3 font-semibold text-banyan-text-default mb-m">
    Title
  </h3>
  <p className="text-body text-banyan-text-subtle">
    Content here
  </p>
</div>
```

### Form Field
```tsx
<div className="mb-m">
  <label className="block text-body font-medium text-banyan-text-default mb-xs">
    Label
  </label>
  <input 
    type="text"
    placeholder="Enter value..."
    className="input-banyan"
  />
</div>
```

### Success Alert
```tsx
<div className="alert-banyan alert-banyan-success">
  ✓ Success message
</div>
```

### Page Layout
```tsx
<div className="min-h-screen bg-banyan-bg-base py-xl">
  <div className="container-banyan">
    <h1 className="text-h1 font-semibold text-banyan-text-default mb-l">
      Page Title
    </h1>
    {/* Content */}
  </div>
</div>
```

---

**See full documentation:** `DESIGN_SYSTEM.md`

