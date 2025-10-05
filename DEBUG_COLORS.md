# Color Debug Guide

Use this to diagnose color issues in dark mode.

## 🔍 How to Debug

### 1. Open Browser Console

Visit: `http://localhost:3000/design-system-demo`

Press `F12` or `Cmd+Option+I` to open DevTools

### 2. Check CSS Variables

Paste this in the console:

```javascript
const root = document.documentElement;
const style = getComputedStyle(root);

console.log('=== BANYAN COLOR TOKENS ===');
console.log('Text Default:', style.getPropertyValue('--banyan-text-default'));
console.log('Text Subtle:', style.getPropertyValue('--banyan-text-subtle'));
console.log('BG Base:', style.getPropertyValue('--banyan-bg-base'));
console.log('BG Surface:', style.getPropertyValue('--banyan-bg-surface'));
console.log('Primary:', style.getPropertyValue('--banyan-primary'));
console.log('Border:', style.getPropertyValue('--banyan-border-default'));
```

**Expected in Light Mode:**
```
Text Default:  #1E1E1E
Text Subtle:  #4A4A4A
BG Base:  #F9FAF9
BG Surface:  #FFFFFF
Primary:  #1B4D3E
```

**Expected in Dark Mode:**
```
Text Default:  #F5F7FA
Text Subtle:  #B8C1CE
BG Base:  #0A0C0E
BG Surface:  #13151A
Primary:  #2EAD7B
```

### 3. Inspect Specific Elements

Right-click on the theme toggle button → Inspect

Check the **Computed** tab in DevTools:
- Look for `color` property
- Trace back to see which style is setting it
- Check if `--banyan-text-default` is being applied

### 4. Find Override Issues

Paste this to find elements with wrong colors:

```javascript
// Find all elements and check their computed color
const elements = document.querySelectorAll('*');
const darkBG = getComputedStyle(document.body).backgroundColor;
console.log('Body BG:', darkBG);

elements.forEach(el => {
  const color = getComputedStyle(el).color;
  const bg = getComputedStyle(el).backgroundColor;
  
  // Check if text is too similar to background (low contrast)
  if (color === 'rgb(10, 12, 14)' || color === 'rgb(13, 15, 18)') {
    console.log('⚠️ Dark text found:', el.className, 'Color:', color);
  }
});
```

### 5. Force Fix

If elements still have wrong colors, force them in console:

```javascript
// Force all text to use Banyan tokens
document.querySelectorAll('*').forEach(el => {
  el.style.color = 'var(--banyan-text-default)';
});
```

## 🐛 Common Issues

### Issue 1: Tailwind Utility Classes Override
**Symptom**: Element has `text-gray-700` or similar class

**Fix**: Remove Tailwind color class, use `text-banyan-text-default` instead

### Issue 2: Inline Styles
**Symptom**: Element has `style="color: #xxx"`

**Fix**: Remove inline style, use CSS class

### Issue 3: CSS Specificity
**Symptom**: Element has correct class but wrong color

**Fix**: Add `!important` to Banyan token

### Issue 4: SVG Not Inheriting
**Symptom**: SVG icon invisible in dark mode

**Fix**: Ensure SVG has `stroke="currentColor"` or `fill="currentColor"`

## 🔧 Quick Fixes

### Fix Theme Toggle
```typescript
// In ThemeToggle.tsx, ensure:
<button className="btn-banyan-ghost">  // ✅ Good
  <svg stroke="currentColor">  // ✅ Inherits color
```

### Fix All Buttons
```css
/* Add to globals.css */
button {
  color: var(--banyan-text-default) !important;
}
```

### Fix All Text
```css
/* Nuclear option - force everything */
* {
  color: var(--banyan-text-default) !important;
}
```

## 📊 Contrast Check

Use this to verify contrast:

```javascript
function checkContrast(fg, bg) {
  // Simplified contrast calculator
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio.toFixed(2);
}

// Check body text
const bodyColor = getComputedStyle(document.body).color;
const bodyBG = getComputedStyle(document.body).backgroundColor;
console.log('Body contrast ratio:', checkContrast(bodyColor, bodyBG));
// Should be > 7:1 for WCAG AAA
```

## 🎯 Expected Results

After all fixes:

### Light Mode
- All text should be `#1E1E1E` (dark)
- Background should be `#F9FAF9` (light)
- Buttons have white text on dark green
- Everything clearly visible

### Dark Mode  
- All text should be `#F5F7FA` (bright white)
- Background should be `#0A0C0E` (very dark)
- Buttons have dark text on bright green
- Everything clearly visible with high contrast

## 🚨 If Nothing Works

Try clearing all caches:

1. Open DevTools
2. Right-click refresh button
3. "Empty Cache and Hard Reload"
4. Wait 5 seconds
5. Toggle dark mode
6. Check again

Still broken? Restart dev server:
```bash
# Kill process
ps aux | grep next | grep -v grep | awk '{print $2}' | xargs kill

# Restart
npm run dev
```

