# 🔄 Tailwind → Banyan Design System Migration Guide

## Quick Reference: Class Replacements

### Text Colors
```tsx
// ❌ OLD - Hard-coded Tailwind
className="text-gray-900"
className="text-gray-600"
className="text-gray-400"
className="text-white"
className="text-black"
className="text-blue-600"

// ✅ NEW - Banyan tokens
className="text-banyan-text-default"
className="text-banyan-text-subtle"
className="text-banyan-text-muted"
className="text-banyan-text-default"
className="text-banyan-text-default"
className="text-banyan-primary"
```

### Backgrounds
```tsx
// ❌ OLD
className="bg-gray-900"
className="bg-gray-100"
className="bg-white"
className="bg-blue-600"

// ✅ NEW
className="bg-banyan-bg-base"
className="bg-banyan-bg-surface"
className="bg-banyan-bg-surface"
className="bg-banyan-primary"
```

### Borders
```tsx
// ❌ OLD
className="border-gray-300"
className="border-blue-500"

// ✅ NEW
className="border-banyan-border-default"
className="border-banyan-primary"
```

### Complete Buttons
```tsx
// ❌ OLD - Inline Tailwind utilities
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
  Click me
</button>

// ✅ NEW - Banyan component class
<button className="btn-banyan-primary">
  Click me
</button>
```

### Links
```tsx
// ❌ OLD
<a href="/new" className="text-blue-600 hover:text-blue-700">
  Go somewhere
</a>

// ✅ NEW
<a href="/new" className="link-underline">
  Go somewhere
</a>
```

---

## 🎯 Priority Files for Migration

### High Priority (User-facing)
1. ✅ `src/components/AppHeader.tsx` - **DONE**
2. ⏳ `src/app/page.tsx` - Homepage (15 instances)
3. ⏳ `src/app/new/page.tsx` - New Brief (9 instances)
4. ⏳ `src/app/showcase/page.tsx` - Examples (39 instances)

### Medium Priority (Frequent use)
5. ⏳ `src/components/VisionFrameworkV2Page.tsx` (67 instances)
6. ⏳ `src/components/SOSPage.tsx` (42 instances)
7. ⏳ `src/components/PromptWizard.tsx` (13 instances)
8. ⏳ `src/components/VcSummaryDisplay.tsx` (13 instances)

### Low Priority (Less frequent)
9. ⏳ `src/components/VisionFrameworkPage.tsx` (115 instances - consider deprecating?)
10. ⏳ Other components with <10 instances

---

## 🛠️ Migration Process

### Step 1: Pick a file
Start with the smallest or most important file.

### Step 2: Find & Replace
Use VS Code's find/replace with regex:

**Find:** `text-gray-([0-9]+)`
**Replace:** `text-banyan-text-default`

**Find:** `bg-gray-([0-9]+)`
**Replace:** `bg-banyan-bg-surface`

**Find:** `text-blue-([0-9]+)`
**Replace:** `text-banyan-primary`

### Step 3: Replace Button Patterns
Look for button patterns and replace with Banyan component classes:

```tsx
// Pattern to find:
className=".*bg-blue-600.*text-white.*hover:bg-blue-[0-9]+"

// Replace with:
className="btn-banyan-primary"
```

### Step 4: Test
1. View the page in browser
2. Toggle between light/dark modes
3. Check hover states
4. Verify responsive behavior

### Step 5: Remove overrides gradually
Once a significant portion is migrated, you can start removing overrides from `globals.css`.

---

## 📊 Migration Progress Tracker

Track your progress here:

### Completed ✅
- [x] `src/components/AppHeader.tsx`
- [x] `src/components/GenerationProgressModal.tsx`
- [x] `src/components/ThemeToggle.tsx`
- [x] `src/app/design-system-demo/page.tsx`
- [x] `src/components/BanyanExampleComponent.tsx`

### In Progress 🔄
- [ ] None currently

### Not Started ⏳
- [ ] `src/app/page.tsx` (15 instances)
- [ ] `src/app/new/page.tsx` (9 instances)
- [ ] `src/app/showcase/page.tsx` (39 instances)
- [ ] `src/components/SOSPage.tsx` (42 instances)
- [ ] `src/components/VisionFrameworkV2Page.tsx` (67 instances)
- [ ] `src/components/VisionFrameworkPage.tsx` (115 instances)
- [ ] `src/components/VcSummaryDisplay.tsx` (13 instances)
- [ ] `src/components/PromptWizard.tsx` (13 instances)
- [ ] `src/components/SaveModal.tsx` (7 instances)
- [ ] `src/components/SaveBar.tsx` (4 instances)
- [ ] `src/components/TopNav.tsx` (2 instances)
- [ ] `src/components/ResultTabs.tsx` (1 instance)
- [ ] `src/components/BriefView.tsx` (1 instance)
- [ ] `src/app/sign-up/[[...sign-up]]/page.tsx` (1 instance)
- [ ] `src/app/sign-in/[[...sign-in]]/page.tsx` (1 instance)
- [ ] `src/app/example/page.tsx` (1 instance)

**Total Progress: 5/21 files (24%)**

---

## 🎓 Best Practices Going Forward

### For New Components
```tsx
// ✅ DO: Use Banyan classes from the start
export function MyNewComponent() {
  return (
    <div className="bg-banyan-bg-surface p-l rounded-m">
      <h2 className="text-banyan-text-default font-bold text-h2">
        Title
      </h2>
      <p className="text-banyan-text-subtle text-body">
        Description
      </p>
      <button className="btn-banyan-primary">
        Action
      </button>
    </div>
  );
}

// ❌ DON'T: Use raw Tailwind colors
export function MyNewComponent() {
  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-gray-900 font-bold text-2xl">
        Title
      </h2>
      <p className="text-gray-600 text-base">
        Description
      </p>
      <button className="bg-blue-600 text-white px-4 py-2">
        Action
      </button>
    </div>
  );
}
```

### Refer to Design System
- 📚 See `DESIGN_SYSTEM.md` for complete documentation
- 🎨 See `COLOR_PALETTE.md` for color reference
- 🔧 See `banyan-design-tokens.json` for all tokens
- 🎯 Use `/design-system-demo` page to preview components

---

## 🚀 Automation Ideas

### Create a codemod script
```bash
# Future: Create a codemod to automate migrations
npx jscodeshift -t transform-tailwind-to-banyan.js src/
```

### VS Code snippets
Add to `.vscode/snippets.json`:
```json
{
  "Banyan Button": {
    "prefix": "btn-banyan",
    "body": [
      "<button className=\"btn-banyan-primary\">",
      "  $1",
      "</button>"
    ]
  }
}
```

---

## ❓ FAQs

**Q: Can I still use Tailwind utilities?**
A: Yes! Spacing, layout, and structural utilities are fine:
- ✅ `flex`, `grid`, `gap-4`, `mt-4`, `px-6`, `py-4`
- ❌ Color utilities: `text-gray-900`, `bg-blue-600`, etc.

**Q: What if I need a custom color?**
A: Add it to `banyan-design-tokens.json` and `globals.css` first, then use it.

**Q: When can we remove the CSS overrides?**
A: When all 21 files are migrated and tested.

**Q: This seems like a lot of work...**
A: It is! But the overrides protect you in the meantime. Migrate incrementally as you touch files for other reasons.

