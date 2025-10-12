# Pocket Pallet Style Guide

## 🎨 Color Palette

### Background Colors

**Primary Backgrounds:**
- `bg-wine-50` (#fdf8f6) - Main page background, very light warm beige
- `bg-white` (#ffffff) - Cards, panels, forms
- `bg-clay-50` (#f9f7f4) - Alternative neutral background
- `bg-sage-50` (#f6f7f4) - Alternative cool background

**Accent Backgrounds:**
- `bg-wine-600` (#a85d4a) - Primary buttons, badges
- `bg-clay-700` (#715542) - Secondary accents
- `bg-sage-700` (#475238) - Tertiary accents

---

## ✅ Text Color Rules (WCAG AA Compliant)

### **CRITICAL: Always Follow These Rules**

| Background | Text Color | Tailwind Class | Contrast Ratio | Use Case |
|:-----------|:-----------|:---------------|:---------------|:---------|
| `bg-wine-50` | Dark gray | `text-gray-900` | 16.1:1 ✅ | Headings, titles |
| `bg-wine-50` | Medium-dark gray | `text-gray-800` | 12.6:1 ✅ | Subheadings |
| `bg-wine-50` | **MINIMUM** dark gray | `text-gray-700` | 9.7:1 ✅ | **Body text, descriptions** |
| `bg-wine-50` | ❌ Medium gray | `text-gray-600` | 4.4:1 ❌ | **TOO LIGHT - DO NOT USE** |
| `bg-white` | Dark gray | `text-gray-900` | 21:1 ✅ | Headings |
| `bg-white` | Medium-dark gray | `text-gray-700` | 10.5:1 ✅ | Body text |
| `bg-white` | **MINIMUM** medium gray | `text-gray-600` | 7.2:1 ✅ | Secondary text |
| `bg-wine-600` | White | `text-white` | 7.4:1 ✅ | Buttons, badges |

### **Golden Rule:**
> **On `bg-wine-50` (or any light custom background): ALWAYS use `text-gray-700` or darker for body text**

---

## 📝 Typography Patterns

### Pattern 1: Page Header on Wine Background
```jsx
<div className="bg-wine-50 py-12">
  <h1 className="text-3xl font-normal text-gray-900">
    Main Heading
  </h1>
  <p className="mt-2 text-sm text-gray-700">
    Subtitle or description text
  </p>
</div>
```

### Pattern 2: Card on Wine Background
```jsx
<div className="bg-wine-50">
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Card Title
    </h3>
    <p className="mt-2 text-sm text-gray-600">
      Card description (gray-600 is OK on white)
    </p>
  </div>
</div>
```

### Pattern 3: Form Labels
```jsx
<label className="block text-sm font-medium text-gray-700 mb-1.5">
  Email address
</label>
<input
  type="email"
  className="block w-full rounded-md border border-gray-300 px-3.5 py-2.5 
             text-gray-900 placeholder-gray-500
             focus:border-wine-500 focus:ring-1 focus:ring-wine-500"
  placeholder="you@example.com"
/>
```

---

## 🎯 Component Styles

### Buttons

**Primary Button:**
```jsx
<button className="px-4 py-2.5 
                   bg-wine-600 text-white 
                   hover:bg-wine-700 
                   rounded-md shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-wine-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors">
  Primary Action
</button>
```

**Secondary Button:**
```jsx
<button className="px-4 py-2.5 
                   border border-gray-300 text-gray-700 
                   hover:bg-gray-50 
                   rounded-md
                   focus:outline-none focus:ring-2 focus:ring-wine-500 focus:ring-offset-2
                   transition-colors">
  Secondary Action
</button>
```

**Text Button / Link:**
```jsx
<button className="text-wine-600 hover:text-wine-700 
                   font-medium transition-colors">
  Link Action
</button>
```

### Form Inputs

```jsx
<input className="block w-full rounded-md 
                  border border-gray-300 
                  px-3.5 py-2.5 
                  text-gray-900 
                  placeholder-gray-500
                  focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 
                  transition-colors" />
```

### Cards

```jsx
<div className="bg-white rounded-lg 
                border border-gray-200 
                p-6 
                hover:border-wine-300 hover:shadow-sm 
                transition-all">
  {/* Content */}
</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG:
```jsx
<div className="bg-wine-50">
  <p className="text-gray-600">This text is too light!</p>
  <p className="text-gray-500">This is even worse!</p>
</div>
```

### ✅ CORRECT:
```jsx
<div className="bg-wine-50">
  <p className="text-gray-700">This text has proper contrast</p>
  <p className="text-gray-800">This is even better</p>
</div>
```

---

## 🔍 Testing Contrast

### Method 1: Browser DevTools
1. Right-click element → Inspect
2. In Styles panel, click the color swatch
3. DevTools shows contrast ratio and WCAG pass/fail

### Method 2: Quick Reference

**On `bg-wine-50`:**
- ✅ `text-gray-900` (darkest)
- ✅ `text-gray-800` (very dark)
- ✅ `text-gray-700` ← **MINIMUM**
- ❌ `text-gray-600` (too light)
- ❌ `text-gray-500` (way too light)

**On `bg-white`:**
- ✅ `text-gray-900`
- ✅ `text-gray-800`
- ✅ `text-gray-700`
- ✅ `text-gray-600` ← **MINIMUM**
- ⚠️ `text-gray-500` (barely passes, use sparingly)

---

## 📐 Spacing & Layout

### Container Widths
```jsx
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Dashboard, main content */}
</div>

<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Forms, single-column content */}
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Wide layouts, grids */}
</div>
```

### Vertical Spacing
- Between sections: `py-12` or `py-8`
- Between elements: `space-y-4` or `space-y-6`
- Within cards: `p-6` or `p-8`

---

## 🎨 Design Principles (Applied)

1. **Confident, never pushy**
   - Use `text-gray-900` for headings (strong but not bold)
   - Avoid ALL CAPS unless necessary
   - Prefer `font-normal` over `font-bold`

2. **Positive by design**
   - Success: `bg-green-50` with `text-green-700`
   - Error: `bg-red-50` with `text-red-700`
   - Info: `bg-blue-50` with `text-blue-700`

3. **Frictionless motion**
   - Always include `transition-colors` or `transition-all`
   - Hover states should be subtle: `hover:bg-wine-700` not drastic color changes
   - Focus rings: `focus:ring-2 focus:ring-wine-500 focus:ring-offset-2`

4. **Quiet confidence**
   - Minimal borders: `border-gray-200` on white, `border-gray-300` for inputs
   - Subtle shadows: `shadow-sm` not `shadow-lg`
   - Generous whitespace: Don't cram content

---

## 🔄 State Styles

### Loading States
```jsx
<div className="flex items-center justify-center min-h-screen bg-wine-50">
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 
                    border-4 border-solid border-wine-600 border-r-transparent" />
    <p className="mt-4 text-gray-800">Loading...</p>
  </div>
</div>
```

### Disabled States
```jsx
<button disabled 
        className="px-4 py-2.5 
                   bg-wine-600 text-white 
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Action
</button>
```

### Error Messages
```jsx
<div className="rounded-md bg-red-50 border border-red-200 p-4">
  <p className="text-sm text-red-700">Error message here</p>
</div>
```

### Success Messages
```jsx
<div className="rounded-md bg-green-50 border border-green-200 p-4">
  <p className="text-sm text-green-700">Success message here</p>
</div>
```

---

## ✅ Pre-Commit Checklist

Before pushing any UI changes:

- [ ] All text on `bg-wine-50` uses `text-gray-700` or darker
- [ ] All text on light backgrounds meets WCAG AA (4.5:1 minimum)
- [ ] Buttons have clear hover and focus states
- [ ] Form inputs have visible placeholders (`placeholder-gray-500` minimum)
- [ ] Error/success messages use proper contrast
- [ ] Loading states are visible
- [ ] Tested in both light and dark browser modes

---

## 📚 Resources

- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind Colors**: https://tailwindcss.com/docs/customizing-colors

---

## 🍷 Summary

**The #1 Rule for Pocket Pallet:**

> On `bg-wine-50` (our main background), ALWAYS use `text-gray-700` or darker for body text. Only use `text-gray-600` on pure white backgrounds.

This ensures our wine-inspired design remains accessible to all users. 🍷♿

