# VisualRef Design & Theme Guide

This document outlines the core design philosophy, styling patterns, and best practices used in the VisualRef landing page. It serves as a single source of truth for future development to ensure visual consistency and maintain the "premium, glassmorphic" aesthetic.

## 1. Core Philosophy

- **Premium & Modern:** The visual aesthetic must feel state-of-the-art. Forget basic blocks of color—our components use subtle gradients, blurs, and micro-interactions.
- **Glassmorphism:** A heavy emphasis on semi-transparent overlays with backdrop blurs over dynamic imagery or gradients.
- **Clean Readability:** Always prioritize readability. Use split layouts (e.g., solid white/clean background on one side for text, imagery on the other).
- **Motion as Identity:** Smooth entrance animations and subtle floating effects are key to making the page feel "alive."

## 2. Typography

- **Body & Headings:** `var(--font-dm-sans)` – Provides clean, readable, sans-serif text suitable for modern tech sites.
- **Brand/Logo:** `var(--font-groote)` – A distinctive custom font used exclusively for the "VisualRef" wordmark to make the branding pop.
- **Styling:** Headings are typically bold tracking-tight to maintain a sharp look (`tracking-tight`), while smaller elements like nav links might use slight tracking (`tracking-[0.01em]`).

## 3. Color Palette

The project is configured via `globals.css` with inline theme tokens:

- **Primary Brand:** `#48C5AF` (Hover: `#7DDECB`)
- **Dark Elements:** `#20395B` (Text Main, Headers)
- **Dark Accents:** `#2C5282` (Text Muted, Dark Cards) 
- **Light Surfaces:** `#FFFFFF` (Base Background)
- **Subtle Backgrounds:** `#EAF8F5`
- **Glass Overlays:** `rgba(255, 255, 255, 0.7)`

## 4. Specific Utility Classes

*Located in `src/app/globals.css` @layer utilities:*

### Glassmorphism
- `.glass-dark`: `rgba(255, 255, 255, 0.7)` with `blur(24px)` and a subtle `0.08` opacity border. Used for floating cards and overlays.
- `.glass-dark-solid`: `rgba(255, 255, 255, 0.85)` with `blur(20px)` and bottom border. Used for the sticky Navbar and components requiring higher contrast.

### Gradients
- `.hero-gradient-overlay`: Multi-stop linear gradient from 55% white fading to transparent. Great for text readability over complex hero backgrounds.
- `.feature-card-glow`: A radial glow using Primary Color (`#48C5AF`) at 12% opacity. Used to highlight platform features on hover.

## 5. Animations & Framer Motion

The site uses a mix of Tailwind/CSS animations and Framer Motion logic.

### CSS Keyframes (`globals.css`)
- **Float (`animate-float`):** 4s ease-in-out vertical float (Y-axis -8px). Used for imagery, badges, or floating UI components.
- **Pulse (`animate-pulse-slow`):** 6s slow pulsing. Used for glowing background elements.
- **Hero Mask Up (`animate-hero-mask-up`):** Staggered upward slide with opacity fade (100% Y to 0% Y).
- **Logo Scroll (`animate-logo-scroll`):** 30s linear infinite slide horizontally for marquees.

### Framer Motion (`framer-motion`)
Used for complex layout transitions (like the Solutions Tabs) and scroll-triggered entrance animations (`initial`, `whileInView`, `viewport={{ once: true }}`).
- **Pattern:** Typically `initial={{ opacity: 0, y: 20 }}` and `whileInView={{ opacity: 1, y: 0 }}`.

## 6. Layout Structural Patterns

- **Navigation (`Navbar.tsx`):** Fixed to top. Transparent when at Y=0, transitions to `.glass-dark-solid` with a shadow when scrolled.
- **Split Hero (`Hero.tsx`):** Uses left alignment for primary H1 and CTA on a solid/clean background, and right alignment for masked imagery overlays.
- **Grid Layouts:** Common use of `grid-cols-1 md:grid-cols-2` or `lg:grid-cols-3` with specific gap scaling (`gap-8 lg:gap-12`).
- **Interactive Cards:** Hover states should always have slight scaling (`hover:scale-[1.02]`) and duration (`duration-300`).

## 7. Adding New Components (Checklist)

1. **Does it feel flat?** If the background is too plain, add a blurred radial gradient or use `.glass-dark` with a subtle background image.
2. **Is text readable?** Avoid placing dark text directly over busy background areas; employ gradients or glass overlays.
3. **Does it move?** When elements enter the screen, apply a stagger animation. When a user hovers a card, ensure there is a clear, smooth transition.
4. **Is it responsive?** Always maintain comfortable padding (`px-4 sm:px-6 lg:px-8`) and ensure text scales proportionally across breakpoints.
