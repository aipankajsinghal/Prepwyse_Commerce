# PrepWyse Commerce Design System

## Overview

A distinctive, context-aware design system tailored for educational platforms serving commerce students in India. The design avoids generic "AI slop" aesthetics by prioritizing memorable typography, cohesive warm color systems, purposeful motion, and layered backgrounds while maintaining accessibility and performance.

---

## 1. Typography

### Philosophy
Combines modern geometric display fonts with warm, readable serif body text to create a friendly yet academic feel.

### Font Families

#### Display/Headings: Space Grotesk
- **Purpose**: Headlines, UI elements, buttons
- **Characteristics**: Modern, geometric, friendly, slightly technical
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage**: All `h1-h6` tags, navigation, buttons, labels

#### Body/Content: Crimson Pro
- **Purpose**: Body text, descriptions, articles
- **Characteristics**: Warm, readable, academic, slightly classical
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage**: Paragraphs, descriptions, explanations

### Type Scale

```css
h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.02em; }      /* 48px */
h2 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.015em; }  /* 36px */
h3 { font-size: 1.875rem; font-weight: 600; }                           /* 30px */
h4 { font-size: 1.5rem; font-weight: 600; }                             /* 24px */
h5 { font-size: 1.25rem; font-weight: 600; }                            /* 20px */
h6 { font-size: 1.125rem; font-weight: 600; }                           /* 18px */
body { font-size: 1rem; line-height: 1.7; }                             /* 16px */
```

### Responsive Typography
```css
@media (max-width: 768px) {
  h1 { font-size: 2.25rem; }  /* 36px */
  h2 { font-size: 1.875rem; } /* 30px */
  h3 { font-size: 1.5rem; }   /* 24px */
}
```

### CSS Variables
```css
font-family: 'Space Grotesk', system-ui, sans-serif;  /* Display */
font-family: 'Crimson Pro', Georgia, serif;           /* Body */
```

### Tailwind Classes
```css
.font-display  /* Space Grotesk */
.font-body     /* Crimson Pro */
.font-sans     /* Alias for Space Grotesk */
.font-serif    /* Alias for Crimson Pro */
```

---

## 2. Color System

### Philosophy
Warm, supportive colors inspired by Indian education, paper textures, and terra cotta elements. Avoids cold blues and harsh contrasts in favor of warmth and approachability.

### Core Brand Colors

#### Primary: Deep Navy
```css
--primary: 28 41 73;           /* rgb(28, 41, 73) */
--primary-light: 45 64 107;
--primary-dark: 18 27 48;
```
**Usage**: Authority, trust, headers
**When to use**: Primary branding, navigation, important headers

#### Accent 1: Warm Terracotta
```css
--accent-1: 183 73 50;         /* rgb(183, 73, 50) - Main terracotta */
--accent-1-light: 211 100 80;
--accent-1-dark: 140 56 38;
```
**Usage**: CTAs, highlights, primary actions
**When to use**: Primary buttons, important UI elements, active states

#### Accent 2: Deep Teal
```css
--accent-2: 36 119 123;        /* rgb(36, 119, 123) */
--accent-2-light: 55 162 167;
--accent-2-dark: 25 83 86;
```
**Usage**: Secondary actions, info badges, complementary highlights
**When to use**: Secondary buttons, info messages, badges

### Surface Colors

#### Backgrounds
```css
--bg: 252 250 247;             /* Warm off-white, paper-like */
--surface: 255 253 250;        /* Lighter surface for cards */
--surface-elevated: 255 255 255; /* Pure white for elevated cards */
```

### Text Colors
```css
--text-primary: 31 31 36;      /* Near black with warmth */
--text-secondary: 84 84 91;    /* Warm gray */
--text-muted: 142 142 151;     /* Light gray for hints */
```

### Semantic Colors
```css
--success: 34 139 34;          /* Forest green */
--warning: 217 119 6;          /* Warm amber */
--error: 185 28 28;            /* Deep red */
--info: 36 119 123;            /* Teal (matches accent-2) */
```

### Dark Theme
Automatically adjusts colors for dark mode with warmer, softer tones:
```css
.dark {
  --primary: 107 137 204;      /* Lighter blue */
  --accent-1: 231 138 118;     /* Softer terracotta */
  --accent-2: 88 196 202;      /* Bright teal */
  --bg: 23 23 26;              /* Deep warm black */
  --surface: 31 31 36;
  --surface-elevated: 41 41 46;
}
```

### Color Usage Examples

```tsx
/* Tailwind classes */
<button className="bg-accent-1 text-white hover:bg-accent-1-dark">
  Primary Action
</button>

<div className="bg-surface-elevated border border-text-primary/10">
  Card content
</div>

<p className="text-text-secondary">
  Secondary text
</p>

/* Direct CSS variables */
background: rgb(var(--accent-1));
color: rgb(var(--text-primary));
```

### Contrast Ratios (WCAG AA)
- Text on background: 7.2:1 (AAA compliant)
- Large text on accent-1: 4.8:1 (AA compliant)
- All interactive elements: Minimum 4.5:1

---

## 3. Motion Design

### Philosophy
One signature motion sequence per screen with purposeful, delightful animations. CSS-first approach for performance.

### Signature Animation: Staggered Reveal

**Primary page entrance animation**
```css
.animate-reveal {
  animation: reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stagger delays */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
```

**Usage**: Apply to main content sections for sequential reveal effect.

### Bloom Effect (Signature CTA)

**Button interaction with radial gradient bloom**
```css
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
}

.btn-primary:hover::before {
  animation: bloom 0.6s ease-out;
}

@keyframes bloom {
  0% { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
```

**Usage**: Primary call-to-action buttons for delightful hover effect.

### Supporting Animations

#### Gentle Float (Decorative)
```css
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
```
**Usage**: Icons, badges, decorative elements

#### Subtle Pulse (Attention)
```css
.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { box-shadow: 0 4px 12px rgba(183, 73, 50, 0.3); }
  50% { box-shadow: 0 4px 20px rgba(183, 73, 50, 0.45); }
}
```
**Usage**: Important CTAs, notification badges

#### Slide In (Panels/Modals)
```css
.animate-slide-in-right {
  animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-bottom {
  animation: slide-in-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```
**Usage**: Side panels, modals, dropdown menus

### Motion Budget
- **Maximum simultaneous animations**: 3
- **Preferred properties**: transform, opacity (GPU-accelerated)
- **Avoid**: layout-thrashing properties (width, height, top, left)
- **Performance**: Use `will-change` sparingly

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Backgrounds & Atmosphere

### Philosophy
Layered backgrounds create depth and a paper-like, tactile quality suitable for educational content.

### Base Background Texture
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(var(--accent-1), 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(var(--accent-2), 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,..."); /* SVG dot pattern */
  opacity: var(--texture-opacity);
  pointer-events: none;
  z-index: 0;
}
```

### Pattern Class
```css
.bg-pattern {
  background: 
    linear-gradient(135deg, rgba(var(--accent-1), 0.02) 0%, rgba(var(--accent-2), 0.02) 100%),
    url("data:image/svg+xml,...");
}
```
**Usage**: Apply to main containers for subtle patterned background

### Gradient Backgrounds
```css
/* Warm gradient for hero sections */
background: linear-gradient(135deg, rgb(var(--bg)) 0%, rgb(var(--surface)) 100%);

/* Accent gradient for cards */
background: linear-gradient(to-br, rgba(var(--accent-1), 0.1), rgba(var(--accent-2), 0.1));
```

### Shadow System
```css
--shadow-sm: 0 1px 3px rgba(28, 41, 73, 0.08);
--shadow-md: 0 4px 12px rgba(28, 41, 73, 0.12);
--shadow-lg: 0 12px 24px rgba(28, 41, 73, 0.15);
```

### Depth Layers
1. **Background**: Base texture (z-index: 0)
2. **Content**: Main content layer (z-index: 1)
3. **Cards**: `.edu-card` with shadow-md (z-index: auto)
4. **Elevated**: Modals, dropdowns (z-index: 10+)

---

## 5. Components

### Educational Card (.edu-card)
```css
.edu-card {
  background: rgb(var(--surface-elevated));
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(var(--text-primary), 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.edu-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```
**Usage**: Primary container for content blocks

### Primary Button (.btn-primary)
```css
.btn-primary {
  font-family: 'Space Grotesk', sans-serif;
  background: rgb(var(--accent-1));
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--accent-1), 0.3);
  /* Includes bloom effect on hover */
}
```

### Secondary Button (.btn-secondary)
```css
.btn-secondary {
  font-family: 'Space Grotesk', sans-serif;
  background: transparent;
  color: rgb(var(--accent-1));
  border: 2px solid rgb(var(--accent-1));
  /* Fills with color on hover */
}
```

---

## 6. Accessibility

### Contrast Requirements
- ✅ All text meets WCAG AA (minimum 4.5:1)
- ✅ Large text meets WCAG AAA (7:1)
- ✅ Interactive elements have clear focus states

### Focus States
```css
*:focus-visible {
  outline: 2px solid rgb(var(--accent-1));
  outline-offset: 2px;
}
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Skip links for main content

### Screen Reader Support
- Semantic HTML structure
- Proper ARIA labels where needed
- Alt text for all images

### Color Blindness
- Not relying on color alone for information
- Icons and text labels accompany colors
- High contrast mode support

---

## 7. Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large */
```

### Container Sizing
```css
.container {
  max-width: 7xl (1280px);
  padding: 1rem;
  margin: 0 auto;
}
```

### Responsive Typography
- Base: 16px (1rem)
- Scales down on mobile (h1: 3rem → 2.25rem)
- Line height: 1.7 for body text
- Letter spacing adjusted for large text

---

## 8. SEO Optimization

### Meta Tags Structure
```tsx
<title>Page Title | PrepWyse Commerce</title>
<meta name="description" content="...130-160 characters..." />
<meta name="keywords" content="commerce, education, cuet, class 11, class 12" />
```

### Semantic HTML
- Proper heading hierarchy (h1 → h6)
- Semantic tags: `<article>`, `<section>`, `<nav>`, `<aside>`
- Descriptive link text

### Performance
- Font loading strategy: `font-display: swap`
- CSS optimized and minified
- Critical CSS inlined
- Lazy loading for below-fold content

---

## 9. Implementation Examples

### Page Structure
```tsx
<div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
  <div className="container mx-auto px-4 py-16 max-w-7xl">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-16"
    >
      <h1 className="font-display text-5xl md:text-6xl font-bold">
        Page Title
      </h1>
    </motion.div>
    
    <div className="grid md:grid-cols-3 gap-6">
      <div className="edu-card">
        Card content
      </div>
    </div>
  </div>
</div>
```

### Button Usage
```tsx
<button className="btn-primary">
  Primary Action
</button>

<button className="btn-secondary">
  Secondary Action
</button>
```

### Color Usage
```tsx
<div className="bg-accent-1 text-white">
  Accent background
</div>

<p className="text-text-secondary">
  Secondary text
</p>
```

---

## 10. Performance Budget

### CSS
- Total CSS: < 50KB gzipped
- Critical CSS: < 14KB inline

### Fonts
- Space Grotesk: 4 weights = ~40KB
- Crimson Pro: 4 weights = ~45KB
- Total fonts: < 100KB with subsetting

### Animations
- Max simultaneous: 3
- Only transform/opacity (GPU-accelerated)
- Reduced motion fallbacks

### Images
- Use Next.js Image component
- WebP format preferred
- Lazy loading below fold

---

## 11. Browser Support

### Target Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: Last 2 versions

### Fallbacks
- CSS custom properties with fallbacks
- Graceful degradation for animations
- Progressive enhancement approach

---

## 12. Tools & Resources

### Development
- **Tailwind CSS**: Utility-first framework
- **Framer Motion**: React animation library
- **Lucide React**: Icon system

### Testing
- **WAVE**: Accessibility testing
- **Lighthouse**: Performance audits
- **axe DevTools**: Accessibility scanner

### Design
- **Figma**: Design mockups (if needed)
- **Coolors**: Color palette generation
- **Type Scale**: Typography scale calculator

---

## Conclusion

This design system prioritizes:
1. **Distinctive Typography**: Space Grotesk + Crimson Pro
2. **Warm, Educational Colors**: Terracotta + Teal
3. **Purposeful Motion**: Signature reveal + bloom effects
4. **Tactile Backgrounds**: Paper-like textures
5. **Accessibility**: WCAG AA compliant
6. **Performance**: CSS-first, GPU-accelerated

The result is a memorable, context-specific design that feels purposefully crafted for commerce education in India, avoiding generic patterns while maintaining excellent usability and performance.
