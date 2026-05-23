---
name: Dual-Context Authentication System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
---

## Brand & Style

This design system is engineered to bridge the gap between two distinct user mentalities: the warm, inviting atmosphere of a consumer-facing **Client App** and the high-utility, disciplined environment of an **Admin Dashboard**.

**Client App Style: Modern Softness**
The client interface employs a "Modern Corporate" aesthetic with leanings toward "Glassmorphism." It prioritizes white space, soft shadows, and high-legibility typography to reduce the cognitive load of authentication tasks. The goal is to make security feel effortless and welcoming.

**Admin Dashboard Style: Technical Minimalism**
The admin interface shifts toward a "Minimalist / Utilitarian" approach. It utilizes high-contrast neutrals, sharp data density, and a structured layout to convey authority and precision. It removes decorative elements (like soft shadows) in favor of crisp borders and tonal layers.

## Colors

The palette is bifurcated to serve two distinct moods:

- **Primary (Indigo-600):** Used for primary actions, active input states, and brand presence in the Client App.
- **Secondary/Admin (Slate-700):** Used as the primary structural color for the Admin Dashboard to maintain a professional, neutral tone.
- **Functional Colors:** 
    - **Success (Emerald-500):** For verified states and completed authentication.
    - **Error (Red-500):** For validation failures, incorrect passwords, and locked accounts.
- **Neutrals:** A comprehensive Slate-based scale. Use lower values (50-200) for backgrounds and borders in Client apps, and higher values (700-900) for text and critical navigation in Admin views.

## Typography

This design system uses a dual-font strategy:
- **Hanken Grotesk** is used for headings to provide a modern, sharp, and contemporary feel. Its geometric nature scales well from large marketing-style login headers to compact admin titles.
- **Inter** handles all functional UI text. Its high x-height and neutral character make it ideal for form fields, labels, and microcopy where clarity is paramount.

**Implementation Notes:**
- In the **Client App**, use `headline-lg` for the primary "Welcome Back" greeting.
- In the **Admin Dashboard**, use `headline-md` for form titles to maintain a denser, more professional information architecture.

## Layout & Spacing

The system follows an 8px rhythmic grid (with 4px increments for tight components like labels and inputs).

**Client App Layout:**
- **Structure:** Centralized card-based layout. The card should be vertically and horizontally centered on desktop.
- **Responsive:** On mobile, the card removes its border-radius and shadows to fill the viewport, transitioning into a full-screen vertical stack.
- **Padding:** Uses `xl` (32px) internal padding for a spacious, breathable feel.

**Admin Dashboard Layout:**
- **Structure:** Full-screen split-screen or sidebar layout. The authentication area is typically contained within a right-aligned or centered panel with a fixed width of 400px.
- **Density:** Uses `md` (16px) spacing between form elements to increase data density and efficiency.

## Elevation & Depth

**Client App: Depth via Shadows**
Uses ambient, multi-layered shadows to suggest physical layers.
- **Level 1 (Inputs/Buttons):** Soft 2px blur, 5% opacity black.
- **Level 2 (Auth Card):** 20px blur, 40px spread, 8% opacity of the Primary color to create a subtle glow effect.

**Admin Dashboard: Depth via Tonal Layers**
Rejects shadows in favor of structural definition.
- **Inputs:** 1px solid border (Neutral 300). On focus, 1px solid Primary with a 2px Neutral 100 offset.
- **Surfaces:** The background uses Neutral 50, while the main form container uses a pure white background with a Neutral 200 border.

## Shapes

The design system utilizes **Rounded (0.5rem / 8px)** as the base radius to strike a balance between friendly and professional.

- **Buttons & Inputs:** Use the base `rounded` (8px) for both themes.
- **Client Auth Card:** Uses `rounded-xl` (24px) to emphasize the approachable, "app-like" feel.
- **OTP Inputs:** Use `rounded-lg` (16px) to create distinctive, circular-adjacent squares that are easy to tap on mobile.
- **Checkboxes:** Use a smaller `rounded-sm` (4px) to maintain a crisp, functional appearance even in the Client theme.

## Components

### Buttons
- **Primary:** Full width for mobile/client. Background: Primary-600. Text: White. 
- **Loading State:** Replace label with a centered spinner; the button width must remain constant to prevent layout shift.
- **Admin Variant:** Can use a smaller vertical padding (10px vs 14px) for a more compact look.

### Input Fields
- **Default:** Neutral 100 background for Client (for a "filled" look) and White background with Neutral 300 border for Admin.
- **Focus:** 2px solid Primary-600 border.
- **Error:** 1px solid Error-500 border with Error-500 helper text using `label-sm`.

### OTP Inputs
- A sequence of 4-6 individual boxes.
- **Width/Height:** 56px x 56px for Client; 48px x 48px for Admin.
- **Active:** High-contrast border and a blinking cursor.

### Cards (Client Theme Only)
- Background: White.
- Border: None.
- Shadow: Level 2 Ambient Shadow.

### Lists & Links
- **Links:** Primary-600, `label-md`, semi-bold. No underline unless hovered.
- **Validation List:** Used during password creation. Use `body-sm` with dynamic icons (Neutral dot for pending, Success check for pass, Error X for fail).