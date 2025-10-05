# Banyan Design System v1.0

> **Clarity, human potential, and meaningful progress — translated into every visual and motion detail.**

Banyan's design tokens define a unified visual and behavioral language across the site and app. The core palette uses deep green, warm neutrals, and soft accents to convey steadiness and focus, with color serving clarity, not decoration.

## 🎨 Design Philosophy

- **Clarity over decoration** - Every visual element serves a functional purpose
- **Human-centered** - Designs built with empathy and precision for effortless interaction
- **Meaningful progress** - Visual feedback that shows users their journey and achievements
- **Calm & legible** - Restrained grid system and gentle transitions create ease, not flash
- **Accessible by default** - WCAG AA compliance and reduced motion support built in

---

## 📁 Files & Structure

### Core Files
- **`banyan-design-tokens.json`** - Complete design token definitions with descriptions
- **`tailwind.config.ts`** - Tailwind CSS configuration with Banyan tokens
- **`src/app/globals.css`** - CSS custom properties and component classes
- **`src/lib/design-tokens.ts`** - TypeScript utilities for programmatic access

### Documentation
- **`DESIGN_SYSTEM.md`** (this file) - Complete design system guide

---

## 🎨 Color System

### Brand Colors
```css
--banyan-primary: #1B4D3E        /* Deep green - primary brand color */
--banyan-primary-contrast: #F9FAF9  /* Off-white - text on primary */
```

### Text Colors
```css
--banyan-text-default: #1E1E1E   /* Near-black - body text */
--banyan-text-subtle: #4A4A4A    /* Medium gray - secondary text */
```

### Background Colors
```css
--banyan-bg-base: #F9FAF9        /* Off-white - page background */
--banyan-bg-surface: #FFFFFF     /* Pure white - cards, modals */
```

### State Colors
```css
--banyan-success: #2FB57C        /* Success states */
--banyan-warning: #FFB64C        /* Warning states */
--banyan-error: #E45757          /* Error states */
--banyan-info: #4B91F1           /* Info states */
```

### Accent Colors
```css
--banyan-sand: #F4EDE2           /* Warm beige accent */
--banyan-mist: #E5EEF5           /* Cool blue-gray accent */
```

### Tailwind Usage
```tsx
<div className="bg-banyan-primary text-banyan-primary-contrast">
  <p className="text-banyan-text-default">Body text</p>
  <span className="text-banyan-text-subtle">Caption text</span>
</div>
```

---

## 📝 Typography

### Font Families
- **Primary**: Inter (UI and body text)
- **Secondary**: Publico (Editorial content, future use)

### Font Sizes
```css
text-display: 64px   /* Large display headlines */
text-h1: 48px        /* Page-level headings */
text-h2: 32px        /* Section headings */
text-h3: 24px        /* Subsection headings */
text-body: 18px      /* Default body text, buttons, UI */
text-caption: 14px   /* Small text, labels, helpers */
```

### Font Weights
```css
font-regular: 400    /* Normal text */
font-medium: 500     /* Slightly emphasized */
font-semibold: 600   /* Headings and important UI */
```

### Line Heights
- **tight** (110%): Headings and display text
- **normal** (130%): Subheadings and short text blocks
- **relaxed** (160%): Body text and long-form content

### Tailwind Usage
```tsx
<h1 className="text-h1 font-semibold">Page Title</h1>
<h2 className="text-h2 font-semibold">Section Title</h2>
<p className="text-body font-regular">Body paragraph with comfortable reading.</p>
<span className="text-caption font-medium">Helper text</span>
```

---

## 📏 Spacing System

Based on an **8-pixel rhythm** for vertical and horizontal consistency:

```css
xxs: 4px    /* Minimal spacing for tight layouts */
xs: 8px     /* Small gaps between related elements */
s: 12px     /* Compact spacing for buttons and inputs */
m: 16px     /* Base spacing unit - standard gaps and padding */
l: 24px     /* Generous spacing between sections */
xl: 48px    /* Large spacing for major sections */
xxl: 96px   /* Extra-large spacing for page-level separation */
```

### Tailwind Usage
```tsx
<div className="p-m">       {/* padding: 16px */}
<div className="gap-s">     {/* gap: 12px */}
<div className="mb-l">      {/* margin-bottom: 24px */}
<div className="space-y-xs"> {/* vertical spacing: 8px */}
```

---

## 🔲 Border Radius

```css
rounded-s: 4px     /* Subtle rounding for small elements */
rounded-m: 8px     /* Standard rounding for buttons and inputs */
rounded-l: 12px    /* Cards and panels */
rounded-xl: 20px   /* Large containers and modals */
```

### Tailwind Usage
```tsx
<button className="rounded-m">Button</button>
<div className="rounded-l">Card</div>
```

---

## 🌑 Shadows

```css
shadow-surface-low: 0 1px 2px rgba(0,0,0,0.06)   /* Subtle elevation for cards */
shadow-surface-mid: 0 2px 4px rgba(0,0,0,0.08)   /* Medium elevation for hover states */
shadow-surface-high: 0 4px 12px rgba(0,0,0,0.10) /* High elevation for modals */
```

### Tailwind Usage
```tsx
<div className="shadow-surface-low">Card</div>
<div className="shadow-surface-high">Modal</div>
```

---

## ⚡ Motion & Animation

### Durations
```css
duration-fast: 100ms   /* Quick transitions for hover states */
duration-base: 200ms   /* Standard transition duration */
duration-slow: 300ms   /* Deliberate transitions for larger movements */
```

### Easing Functions
```css
ease-banyan: cubic-bezier(0.4, 0, 0.2, 1)    /* Gentle easing for most transitions */
ease-banyan-in: cubic-bezier(0.4, 0, 1, 1)   /* Acceleration easing */
ease-banyan-out: cubic-bezier(0, 0, 0.2, 1)  /* Deceleration easing */
```

### Tailwind Usage
```tsx
<button className="transition-all duration-base ease-banyan hover:transform hover:scale-105">
  Hover me
</button>
```

### Reduced Motion Support
The design system respects `prefers-reduced-motion` by default:

```css
@media (prefers-reduced-motion: reduce) {
  .motion-safe-banyan {
    transition: none !important;
    transform: none !important;
  }
}
```

---

## 🧩 Component Classes

### Buttons

#### Primary Button
```tsx
<button className="btn-banyan-primary">
  Primary Action
</button>
```
- **Use for**: Primary actions, CTAs, form submissions
- **Colors**: Deep green background, off-white text
- **Interaction**: Subtle lift on hover, shadow transition

#### Secondary Button
```tsx
<button className="btn-banyan-secondary">
  Secondary Action
</button>
```
- **Use for**: Secondary actions, cancel buttons
- **Colors**: White background, green border and text
- **Interaction**: Background changes to mist on hover

#### Ghost Button
```tsx
<button className="btn-banyan-ghost">
  Tertiary Action
</button>
```
- **Use for**: Tertiary actions, subtle interactions
- **Colors**: Transparent background, default text
- **Interaction**: Mist background on hover

### Cards

```tsx
<div className="card-banyan">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```
- **Styling**: White background, subtle shadow, rounded corners
- **Interaction**: Shadow increases on hover

### Inputs

```tsx
<input 
  type="text" 
  placeholder="Enter text..."
  className="input-banyan"
/>
```
- **Styling**: White background, light border
- **Interaction**: Primary border on focus with subtle glow

### Alerts

```tsx
<div className="alert-banyan alert-banyan-success">
  ✓ Success message
</div>

<div className="alert-banyan alert-banyan-warning">
  ⚠ Warning message
</div>

<div className="alert-banyan alert-banyan-error">
  ✕ Error message
</div>

<div className="alert-banyan alert-banyan-info">
  ℹ Info message
</div>
```

### Container

```tsx
<div className="container-banyan">
  <p>Content is constrained to max-width with responsive margins</p>
</div>
```
- **Max width**: 1120px
- **Responsive**: 92vw on smaller screens
- **Centered**: Automatic horizontal centering

---

## 💻 Using in TypeScript/JavaScript

```typescript
import { banyanTokens, banyanClasses, getBanyanColor } from '@/lib/design-tokens';

// Access raw token values
const primaryColor = banyanTokens.color.brand.primary; // '#1B4D3E'
const baseSpacing = banyanTokens.spacing.m; // '16px'

// Type-safe color getter
const errorColor = getBanyanColor('error'); // '#E45757'

// Component classes
<button className={banyanClasses.button.primary}>
  Click me
</button>

// Inline styles
<div style={{ 
  backgroundColor: banyanTokens.color.background.surface,
  padding: banyanTokens.spacing.l 
}}>
  Content
</div>
```

---

## ♿ Accessibility

### Built-in Standards
- **Contrast Ratio**: Minimum 4.5:1 (WCAG AA)
- **Tap Targets**: Minimum 44px for mobile
- **Font Size**: Minimum 14px
- **Motion**: Respects `prefers-reduced-motion`

### Focus States
All interactive elements have visible focus indicators:
```css
.btn-banyan-primary:focus-visible {
  outline: 2px solid var(--banyan-primary);
  outline-offset: 2px;
}
```

### Screen Readers
Use semantic HTML and ARIA labels:
```tsx
<button 
  className="btn-banyan-primary"
  aria-label="Generate vision framework"
>
  Generate
</button>
```

---

## 📦 Example Component

Here's a complete example applying the Banyan design system:

```tsx
import { banyanClasses } from '@/lib/design-tokens';

export default function ExampleComponent() {
  return (
    <div className="container-banyan">
      <div className="card-banyan">
        <h2 className="text-h2 font-semibold text-banyan-text-default mb-m">
          Welcome to Banyan
        </h2>
        
        <p className="text-body text-banyan-text-subtle mb-l">
          Experience clarity, human potential, and meaningful progress.
        </p>
        
        <input 
          type="text"
          placeholder="Enter your name..."
          className="input-banyan mb-m"
        />
        
        <div className="flex gap-s">
          <button className={banyanClasses.button.primary}>
            Get Started
          </button>
          <button className={banyanClasses.button.secondary}>
            Learn More
          </button>
        </div>
        
        <div className="alert-banyan alert-banyan-success mt-l">
          ✓ Your changes have been saved successfully!
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Version History

### v1.0 (2025-10-05)
- Initial release
- Core color palette established
- Typography system defined
- Spacing and layout tokens
- Component classes created
- Motion and accessibility standards set

---

## 📚 Resources

- **Design Tokens**: `banyan-design-tokens.json`
- **Tailwind Config**: `tailwind.config.ts`
- **CSS Variables**: `src/app/globals.css`
- **TypeScript Utils**: `src/lib/design-tokens.ts`

---

## 🤝 Contributing

When adding new components or patterns:

1. Use existing tokens whenever possible
2. Follow the 8px spacing rhythm
3. Ensure WCAG AA contrast ratios
4. Support reduced motion preferences
5. Document new patterns in this file
6. Update `banyan-design-tokens.json` if adding new tokens

---

**Built with precision. Designed for humans.**

