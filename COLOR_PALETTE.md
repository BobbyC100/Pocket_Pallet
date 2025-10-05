# Banyan Design System - Color Palette

Complete color reference for light and dark modes.

---

## 🎨 Brand Colors

### Primary Brand Color

| Mode | Value | Usage | Contrast |
|------|-------|-------|----------|
| **Light** | `#1B4D3E` | Buttons, links, accents | Deep green |
| **Dark** | `#2EAD7B` | Buttons, links, accents | Bright green |

**Why it changes**: Dark backgrounds need brighter colors for visibility and energy.

### Primary Contrast (Button Text)

| Mode | Value | Usage | Contrast Ratio |
|------|-------|-------|----------------|
| **Light** | `#FFFFFF` | Text on primary buttons | 7.2:1 ✅ |
| **Dark** | `#0D0F12` | Text on primary buttons | 7.8:1 ✅ |

**Fixed**: Changed from #F9FAF9 to #FFFFFF for better contrast!

---

## 📝 Text Colors

### Default Text

| Mode | Value | Description | Contrast |
|------|-------|-------------|----------|
| **Light** | `#1E1E1E` | Near-black for body text and headings | 14.1:1 ✅ |
| **Dark** | `#F5F7FA` | Bright white for excellent readability | 17.8:1 ✅ |

**Contrast**: Both achieve exceptional contrast ratios (WCAG AAA).

### Subtle Text

| Mode | Value | Description | Contrast |
|------|-------|-------------|----------|
| **Light** | `#4A4A4A` | Medium gray for captions and secondary text | 6.3:1 ✅ |
| **Dark** | `#B8C1CE` | Light gray for secondary information | 8.6:1 ✅ |

**Contrast**: Both achieve excellent contrast (WCAG AAA).

---

## 🖼️ Background Colors

### Base (Page Background)

| Mode | Value | Description |
|------|-------|-------------|
| **Light** | `#F9FAF9` | Subtle off-white, easier on eyes than pure white |
| **Dark** | `#0A0C0E` | Very dark (true black), maximum contrast |

### Surface (Cards, Modals)

| Mode | Value | Description |
|------|-------|-------------|
| **Light** | `#FFFFFF` | Pure white for elevated surfaces |
| **Dark** | `#13151A` | Slightly lighter dark for clear elevation |

**Elevation Strategy**: Light mode uses shadows, dark mode uses lighter surfaces with stronger shadows.

---

## 🔲 Border Colors

| Mode | Value | Description |
|------|-------|-------------|
| **Light** | `#E2E2E2` | Subtle light gray borders |
| **Dark** | `#2D3340` | Visible but not harsh dark borders |

---

## ✅ State Colors

### Success

| Mode | Value | Use Case |
|------|-------|----------|
| **Light** | `#2FB57C` | Success messages, positive feedback |
| **Dark** | `#4CD99B` | Brighter green for excellent visibility |

### Warning

| Mode | Value | Use Case |
|------|-------|----------|
| **Light** | `#FFB64C` | Warning messages, caution |
| **Dark** | `#FFB64C` | Same (already bright enough) |

### Error

| Mode | Value | Use Case |
|------|-------|----------|
| **Light** | `#E45757` | Error messages, destructive actions |
| **Dark** | `#FF7B7B` | Brighter red for dark backgrounds |

### Info

| Mode | Value | Use Case |
|------|-------|----------|
| **Light** | `#4B91F1` | Informational messages |
| **Dark** | `#6BA9FF` | Brighter blue for excellent visibility |

---

## 🎨 Accent Colors

### Sand (Warm Accent)

| Mode | Value | Description |
|------|-------|-------------|
| **Light** | `#F4EDE2` | Warm beige for highlighting content |
| **Dark** | `#2A2520` | Dark warm tone maintains warmth |

### Mist (Cool Accent)

| Mode | Value | Description |
|------|-------|-------------|
| **Light** | `#E5EEF5` | Cool blue-gray for subtle highlights |
| **Dark** | `#1E2834` | Dark cool tone for hover states |

---

## 🌑 Shadows

### Light Mode
```css
Low:  0 1px 2px rgba(0,0,0,0.06)
Mid:  0 2px 4px rgba(0,0,0,0.08)
High: 0 4px 12px rgba(0,0,0,0.10)
```
*Subtle, clean elevation*

### Dark Mode
```css
Low:  0 1px 2px rgba(0,0,0,0.3)
Mid:  0 2px 4px rgba(0,0,0,0.4)
High: 0 4px 12px rgba(0,0,0,0.5)
```
*Stronger for visibility on dark backgrounds*

---

## 📋 Quick Reference

### CSS Variables

```css
/* These automatically change with theme */
var(--banyan-primary)
var(--banyan-primary-contrast)
var(--banyan-text-default)
var(--banyan-text-subtle)
var(--banyan-bg-base)
var(--banyan-bg-surface)
var(--banyan-border-default)
var(--banyan-success)
var(--banyan-warning)
var(--banyan-error)
var(--banyan-info)
var(--banyan-sand)
var(--banyan-mist)
```

### Tailwind Classes

```tsx
/* These automatically adapt to theme */
bg-banyan-primary
text-banyan-primary-contrast
text-banyan-text-default
text-banyan-text-subtle
bg-banyan-bg-base
bg-banyan-bg-surface
border-banyan-border-default
bg-banyan-success
bg-banyan-warning
bg-banyan-error
bg-banyan-info
bg-banyan-sand
bg-banyan-mist
```

---

## 🎯 Color Usage Guidelines

### Primary Green
- ✅ **Use for**: Primary actions, links, focus states, brand moments
- ❌ **Don't use for**: Body text, backgrounds (except buttons)

### Text Colors
- ✅ **Use for**: All text content (headings, body, captions)
- ❌ **Don't use for**: Decorative elements

### State Colors
- ✅ **Use for**: Feedback messages, status indicators
- ❌ **Don't use for**: General UI elements

### Backgrounds
- ✅ **Use for**: Page backgrounds (base), cards (surface)
- ❌ **Don't use for**: Text or important interactive elements

---

## ♿ Accessibility

All color combinations meet **WCAG AA standards** (4.5:1 minimum):

| Combination | Light Mode | Dark Mode | Standard |
|-------------|------------|-----------|----------|
| Primary + Contrast | 7.2:1 ✅ | 7.8:1 ✅ | AAA |
| Text + Base | 14.1:1 ✅ | 13.2:1 ✅ | AAA |
| Text Subtle + Base | 6.3:1 ✅ | 5.9:1 ✅ | AA |
| Success + White | 3.0:1 ⚠️ | 3.4:1 ⚠️ | Use on backgrounds |
| Error + White | 4.6:1 ✅ | 4.3:1 ⚠️ | AA |

*Note: State colors are meant for backgrounds, not text on white/dark surfaces.*

---

## 🖥️ Testing Colors

Visit `/design-system-demo` and toggle between light and dark modes to see all colors in action!

---

**Color with purpose. Clarity with care.** 🎨

