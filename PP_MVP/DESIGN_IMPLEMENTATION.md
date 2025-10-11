# Pocket Pallet - Design Implementation

This document explains how the design principles from the Design & Build Reference have been applied to the frontend.

## Design Philosophy Applied

### "Calm, Knowledgeable Companion"
The UI has been redesigned to feel like a trusted friend, not a loud app:

- **Muted, wine-inspired color palette** - Earth tones (wine reds, clay, sage) replace bright purples
- **Generous whitespace** - Room to breathe, minimal visual noise
- **Subtle interactions** - Gentle hover states, organic transitions
- **Confident typography** - Clean, readable fonts with normal weight (not bold/heavy)

### "Quiet Confidence"
Implemented through:

- **Minimal decoration** - No gradients, flashy effects, or ornamental UI
- **Typography carries emotion** - Font size and spacing convey hierarchy
- **Subdued color accents** - Wine-600 for actions, not neon or saturated colors
- **Border-first design** - Subtle borders create structure without shadows

### "Frictionless Motion"
- **Smooth transitions** - All interactions use organic cubic-bezier easing
- **Hover feedback** - Gentle color shifts and border changes
- **Loading states** - Simple spinners in brand colors
- **One-tap actions** - Large touch targets, clear clickable areas

## Color Palette

### Wine (Primary)
```
wine-50:  #fdf8f6  - Backgrounds
wine-100: #f7ede8  - Subtle highlights
wine-600: #a85d4a  - Primary actions
wine-700: #8b4839  - Hover states
```

### Clay (Secondary)
```
clay-50:  #f9f7f4  - Alternative backgrounds
clay-700: #715542  - Secondary text/icons
```

### Sage (Tertiary)
```
sage-50:  #f6f7f4  - Module highlights
sage-700: #475238  - Accents
```

### Neutrals
```
Gray scale for text hierarchy
- gray-900: Primary text
- gray-600: Secondary text
- gray-400: Tertiary text
```

## Typography

- **System fonts** - Native look and feel per platform
- **Font weights**:
  - Normal (400) for body and headers - "confident, not performative"
  - Medium (500) for emphasis
  - Light (300) for large numbers/stats
- **Serif option** available for warmth (Georgia) but not overused

## Component Design

### Navigation
- **Clean header** - Logo, app name, user info, sign out
- **No clutter** - Only essential actions visible
- **Fixed height** (h-16) - Consistent, predictable

### Buttons
- **Two styles**:
  - Primary: `bg-wine-600` with white text (main actions)
  - Ghost: Text-only with hover color shift (secondary actions)
- **Consistent padding** - py-2.5 px-3.5 or px-4
- **Rounded corners** - rounded-md (6px) for modern but not overly playful

### Cards/Modules
- **White on wine-50 background** - Clean, elevated feel
- **Border-based** - border-gray-200, not heavy shadows
- **Hover states** - border-wine-300 + subtle shadow
- **Generous padding** - p-6 for comfortable touch targets

### Forms
- **Clear labels** - mb-1.5 spacing, font-medium
- **Comfortable inputs** - py-2.5 px-3.5, proper touch target size
- **Focus states** - ring-wine-500, not jarring blue
- **Helpful hints** - Small gray text below inputs when needed

## Module Presentation (Dashboard)

The core modules are presented as **actionable cards** that reflect their purpose:

### Journal
- **Camera icon** - Photo/capture focus
- **Wine-50 background** - Primary module (most used)
- **Copy**: "Capture a bottle — photo, note, vibe"

### Discovery
- **Sparkle icon** - Inspiration and delight
- **Clay-50 background** - Differentiation
- **Copy**: "Bottles chosen for your palate"

### Companion
- **QR/scan icon** - Quick action, in-the-moment
- **Sage-50 background** - Subtle contrast
- **Copy**: "Scan, identify, decide — in the moment"

## Interaction Patterns

### Core Loop (Observe → Interpret → Reflect → Adapt)
Reflected in UI through:
1. **Quick capture** (Journal) - One tap to start
2. **Instant feedback** (loading states, transitions)
3. **Natural language** (prompts like "photo, note, vibe")
4. **Invisible learning** (no progress bars or "AI training" messages)

### Contextual Design
- **Mobile-first** - Works on the go (max-w-5xl containers, responsive)
- **Touch-friendly** - 44px+ touch targets, generous spacing
- **Fast paths** - Direct module access from dashboard

## Language & Tone

### Updated Copy Examples

**Before** (generic):
- "Add Wine"
- "Total Wines in Collection"

**After** (confident, personal):
- "Capture a bottle"
- "Bottles tasted"
- "Your palate is ready to grow"
- "Build a palate that grows with you"

### Voice Principles
- **Second person** - "Your palate" not "My Collection"
- **Active, present tense** - "Capture" not "Add Entry"
- **Emotional, not clinical** - "Vibe" not "Rating"
- **Affirming** - "Ready to grow" not "Get Started"

## Accessibility

- **Semantic HTML** - Proper heading hierarchy (h1 → h2 → h3)
- **Color contrast** - WCAG AA compliant text colors
- **Focus indicators** - Clear ring states for keyboard nav
- **Touch targets** - Minimum 44x44px for interactive elements
- **Alt text ready** - Icon SVGs use aria-labels (not implemented yet but structured for it)

## Dark Mode Consideration

Palette supports dark mode with inverted values:
```css
/* Dark mode variables defined in globals.css */
--foreground-rgb: 247, 237, 232  (light wine-100)
--background-rgb: 44, 39, 36     (dark clay-900)
--accent-rgb: 193, 125, 102      (lighter wine-500)
```

Currently not activated but ready for `dark:` Tailwind classes.

## Responsive Behavior

- **Mobile**: Single column, full-width cards
- **Tablet**: Same layout, more comfortable spacing
- **Desktop**: Centered content (max-w-5xl), never full-width

The design intentionally keeps the same layout across breakpoints - consistency over flexibility, per design principles.

## Animation Strategy

### What Animates
- **Color transitions** - 300ms on hover/focus
- **Border changes** - Subtle shift to wine-300
- **Loading spinners** - Smooth rotation
- **Icon states** - Arrow color on hover

### What Doesn't Animate
- **Layout shifts** - No expanding/collapsing (causes disorientation)
- **Page transitions** - Simple cuts (Next.js default)
- **Micro-interactions** - No bounces, shakes, or playful effects

Keeps motion **organic, not ornamental** as per design principles.

## Implementation Notes

### Tech Alignment with Design Spec

The design spec called for:
- ✅ Vite + React + TanStack Query + Tailwind
- ⚠️ **Currently using**: Next.js + React + Axios + Tailwind

**Reasoning**: Next.js provides better Vercel deployment, built-in routing, and SSR capabilities. TanStack Query can be added later for advanced data fetching. Core principles remain the same.

### Future Design Enhancements

Based on the design reference, future modules should include:

1. **Journal Detail View**
   - Photo upload/camera capture
   - Natural language note entry
   - Emotion/vibe selectors ("bright", "funky", "summer")
   - Quick save, no mandatory fields

2. **Discovery Feed**
   - Card-based wine suggestions
   - Swipe gestures (if mobile)
   - "Why this bottle" reasoning (human-curated notes)
   - One-tap save to wishlist

3. **Companion Mode**
   - Camera-first UI (full screen)
   - Label recognition overlay
   - Quick match results
   - "Buy again" / "Try something new" prompts

4. **Palate Profile**
   - Visual taste map (not a chart - something organic)
   - Flavor preference words
   - Learning journey (bottles → insights)

## Summary

The redesign shifts from **generic SaaS UI** (purple gradients, heavy shadows, "Sign Up" buttons) to **wine-appropriate aesthetics** (earthy tones, minimal chrome, "Begin your journey" language).

Every design decision traces back to the core principles:
- Confident, never pushy → Clear actions, no upsells
- Positive by design → Affirming language
- Frictionless motion → Smooth transitions, one-tap access
- Familiar, not generic → Native patterns, wine aesthetics
- Human in the loop → Natural language, curated feel
- Quiet confidence → Minimal noise, clear hierarchy

The result is an interface that feels like it was made for wine lovers, not adapted from a template.

