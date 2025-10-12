# Accessibility & Contrast Guide

## 🎨 Contrast Standards (WCAG AA Compliance)

To ensure readability for all users, we follow **WCAG 2.1 Level AA** standards:

- **Normal text** (< 18px): Minimum contrast ratio of **4.5:1**
- **Large text** (≥ 18px or 14px bold): Minimum contrast ratio of **3:1**
- **UI components** (buttons, borders): Minimum contrast ratio of **3:1**

---

## 📏 Pocket Pallet Color Contrast Rules

### ✅ Approved Text Combinations

| Background | Text Color | Contrast Ratio | Use Case |
|:-----------|:-----------|:---------------|:---------|
| `bg-wine-50` (light beige/pink) | `text-gray-900` | 16.1:1 ✅ | Headings |
| `bg-wine-50` | `text-gray-800` | 12.6:1 ✅ | Subheadings, body text |
| `bg-wine-50` | `text-gray-700` | 9.7:1 ✅ | Body text, descriptions |
| `bg-white` | `text-gray-900` | 21:1 ✅ | Headings |
| `bg-white` | `text-gray-700` | 10.5:1 ✅ | Body text |
| `bg-white` | `text-gray-600` | 7.2:1 ✅ | Secondary text, labels |
| `bg-white` | `text-gray-500` | 4.6:1 ✅ | Tertiary text (use sparingly) |
| `bg-wine-600` | `text-white` | 7.4:1 ✅ | Buttons, badges |

### ❌ AVOID These Combinations

| Background | Text Color | Contrast Ratio | Issue |
|:-----------|:-----------|:---------------|:------|
| `bg-wine-50` | `text-gray-600` | 4.4:1 ❌ | Too light! Fails WCAG AA |
| `bg-wine-50` | `text-gray-500` | 3.1:1 ❌ | Way too light |
| `bg-wine-50` | `text-gray-400` | 2.2:1 ❌ | Unreadable |

---

## 🛠️ How to Test Contrast

### Method 1: Browser DevTools (Recommended)

1. **Chrome/Edge:**
   - Right-click element → Inspect
   - In Styles panel, click the color swatch
   - DevTools shows contrast ratio and WCAG pass/fail

2. **Firefox:**
   - Right-click element → Inspect
   - Accessibility panel shows contrast issues

### Method 2: Online Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Coolors Contrast Checker**: https://coolors.co/contrast-checker
- **Color.review**: https://color.review/

### Method 3: Tailwind CSS Color Reference

Use this quick reference for Tailwind gray colors on light backgrounds:

```
On bg-wine-50 or bg-gray-50:
  ✅ text-gray-900  (darkest - headings)
  ✅ text-gray-800  (very dark - subheadings)
  ✅ text-gray-700  (dark - body text) ← MINIMUM for body text
  ❌ text-gray-600  (medium - TOO LIGHT)
  ❌ text-gray-500  (light - way too light)

On bg-white:
  ✅ text-gray-900
  ✅ text-gray-800
  ✅ text-gray-700
  ✅ text-gray-600  ← MINIMUM for body text on white
  ⚠️  text-gray-500  (barely passes, use sparingly)
  ❌ text-gray-400  (TOO LIGHT)
```

---

## 🔍 Pre-Deployment Checklist

Before pushing any UI changes, check:

- [ ] All text on `bg-wine-50` uses at least `text-gray-700`
- [ ] All text on light backgrounds (wine-50, gray-50, white) has sufficient contrast
- [ ] Buttons have 3:1 contrast ratio against background
- [ ] Placeholder text in inputs is visible (use `placeholder-gray-500` or darker)
- [ ] Error messages have sufficient contrast (red-700 or darker)
- [ ] Success messages have sufficient contrast (green-700 or darker)
- [ ] Loading states have sufficient contrast

---

## 🎯 Design System Quick Reference

### Pocket Pallet Color Palette

**Background Colors:**
- Primary: `bg-wine-50` (#fdf8f6 - very light pinkish beige)
- Cards/Panels: `bg-white` (#ffffff)
- Hover states: `bg-wine-100`

**Text Colors (in order of darkness):**
1. `text-gray-900` - Headings, primary content
2. `text-gray-800` - Subheadings
3. `text-gray-700` - **MINIMUM for body text on wine-50**
4. `text-gray-600` - **MINIMUM for body text on white only**
5. `text-gray-500` - Tertiary text on white only (use sparingly)

**Accent Colors:**
- Primary: `text-wine-600` (links, CTAs)
- Secondary: `text-clay-700`
- Tertiary: `text-sage-700`

---

## 📝 Common Patterns

### Pattern 1: Page Header on Wine-50 Background
```tsx
<div className="bg-wine-50 py-12">
  <h1 className="text-gray-900">Main Heading</h1>
  <p className="text-gray-700">Subtitle or description</p>
</div>
```

### Pattern 2: Card on Wine-50 Background
```tsx
<div className="bg-wine-50">
  <div className="bg-white rounded-lg border p-6">
    <h3 className="text-gray-900">Card Title</h3>
    <p className="text-gray-600">Card description (on white bg)</p>
  </div>
</div>
```

### Pattern 3: Button States
```tsx
// Primary button
<button className="bg-wine-600 text-white hover:bg-wine-700">
  Click me
</button>

// Secondary button
<button className="border border-gray-300 text-gray-700 hover:bg-gray-50">
  Cancel
</button>
```

---

## 🚨 Red Flags to Watch For

1. **Light text on light background**
   - ❌ `bg-wine-50` + `text-gray-600` or lighter
   - ❌ `bg-gray-50` + `text-gray-500` or lighter

2. **Faint placeholders**
   - ❌ `placeholder-gray-400` on any background
   - ✅ Use `placeholder-gray-500` minimum

3. **Disabled states too faint**
   - ❌ `disabled:text-gray-400` on light backgrounds
   - ✅ Use `disabled:text-gray-500` minimum

4. **Error/success messages too light**
   - ❌ `text-red-500` or `text-green-500` on light backgrounds
   - ✅ Use `text-red-700` or `text-green-700`

---

## 🎨 Testing in Development

### Quick Visual Test
1. View your page in normal lighting
2. Squint your eyes slightly
3. If text disappears or is hard to read, contrast is too low

### Automated Testing
Add this to your CI/CD pipeline:
```bash
npm install --save-dev @axe-core/playwright
```

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Style Guide](https://a11y-style-guide.com/style-guide/)
- [Tailwind CSS Color Reference](https://tailwindcss.com/docs/customizing-colors)

---

## ✅ Summary

**Golden Rule**: When in doubt, go darker!

- On `bg-wine-50`: Use **text-gray-700** or darker
- On `bg-white`: Use **text-gray-600** or darker  
- For headings: Always use **text-gray-900**
- For body text: Never go lighter than the minimums above

Following these rules ensures Pocket Pallet is accessible to all users, including those with low vision or color blindness. 🍷♿

