# Design Bible: The Atelier Design System ("Signature Edition")

**Status**: LOCKED (Single Source of Truth)  
**Applies to**: All screens, components, tokens, motion, and assets across `@repo/ui` and `apps/mobile`.

---

## 1. Color System

### 1.1 Philosophy & Restraint
- **No Pure Black (`#000000`) or Pure White (`#FFFFFF`)**: Base backgrounds use calibrated desaturated slate-tinted canvas to prevent OLED harshness and preserve depth.
- **The 5% Accent Rule**: Primary brand accent (`Viridian Emerald`) is strictly rationed to $\le 5\%$ of any viewport. It guides the eye to high-intent actions; it does not coat the chrome.
- **Sovereign Gold**: Reserved strictly for high-trust moments: financial receipts, biometric seals, and verified settlement badges.
- **Light & Dark Equal Craft**: Both themes are first-class citizens designed with equal contrast and emotional depth.

### 1.2 Semantic Token Specification

```typescript
export const colorTokens = {
  light: {
    // Backgrounds & Canvas
    bgCanvas: "#F8F9FC",       // Off-slate warm canvas
    bgSurface: "#FFFFFF",      // Crisp elevated card surface
    bgRaised: "#F1F3F8",       // Inset chips, secondary badges, search wells
    bgOverlay: "rgba(10, 13, 20, 0.45)", // Modal / sheet scrim

    // Borders & Hairlines
    borderSubtle: "#E5E8F0",   // Structural 0.5px partition lines
    borderStrong: "#CBD2E1",   // Input outlines, active card strokes
    borderFocus: "#059669",    // Active keyboard focus ring

    // Typography
    textPrimary: "#0B0E14",    // High-contrast primary reading text
    textSecondary: "#4B5565",  // Metadata, timestamps, supporting labels
    textTertiary: "#8894A8",   // Placeholder, subtle icons, counters
    textInverse: "#FFFFFF",    // Text on accent or dark fills

    // Brand & Intent Accents (<= 5% screen budget)
    accent: "#059669",         // Viridian Emerald (Primary brand)
    accentHover: "#047857",    // Pressed state
    accentSubtle: "#ECFDF5",   // Ambient accent wash for active pills

    // Sovereign Highlight
    gold: "#D97706",           // Sovereign Gold for receipts & biometric seals
    goldSubtle: "#FEF3C7",     // Gold ambient glow / badge wash

    // Status Signals
    positive: "#059669",       // Success, delivered, confirmed
    positiveSubtle: "#ECFDF5",
    warning: "#D97706",        // In-transit, pending sync, low stock
    warningSubtle: "#FFFBEB",
    critical: "#DC2626",       // Cancelled, failed, destructive
    criticalSubtle: "#FEF2F2",
  },
  dark: {
    // Backgrounds & Canvas
    bgCanvas: "#0A0D14",       // Tinted slate-obsidian void
    bgSurface: "#121622",      // Layer 1 card surface
    bgRaised: "#1A2030",       // Inset wells, chip pills, list headers
    bgOverlay: "rgba(0, 0, 0, 0.75)", // Modal / sheet scrim

    // Borders & Hairlines
    borderSubtle: "rgba(255, 255, 255, 0.08)", // 0.5px jewel hairline
    borderStrong: "rgba(255, 255, 255, 0.16)", // Input boundary
    borderFocus: "#10B981",    // Emerald luminescence focus

    // Typography
    textPrimary: "#F2F5FA",    // Soft luminous white (no blinding glare)
    textSecondary: "#9BA5B7",  // Muted silver metadata
    textTertiary: "#5B667A",   // Ghost guidance text
    textInverse: "#0A0D14",    // Text on bright accents

    // Brand & Intent Accents
    accent: "#10B981",         // Luminous Viridian Emerald
    accentHover: "#059669",    // Pressed state
    accentSubtle: "rgba(16, 185, 129, 0.12)", // Ambient glow pill

    // Sovereign Highlight
    gold: "#F59E0B",           // Sovereign Champagne Gold
    goldSubtle: "rgba(245, 158, 11, 0.14)",

    // Status Signals
    positive: "#10B981",
    positiveSubtle: "rgba(16, 185, 129, 0.12)",
    warning: "#F59E0B",
    warningSubtle: "rgba(245, 158, 11, 0.14)",
    critical: "#EF4444",
    criticalSubtle: "rgba(239, 68, 68, 0.14)",
  },
} as const;
```

---

## 2. Typography System

### 2.1 Dual-Font Architecture
1. **Display Face (`SpaceGrotesk` / `Syne` / `CabinetGrotesk`)**: Hero numbers, KPI figures, screen titles, receipt seals. Loaded via `expo-font` before splash unmounts. **Zero FOUT.**
2. **UI Face (`Inter` / System Grotesque)**: Body text, tables, forms, buttons, chips, metadata.
3. **Tabular Numerals**: Every monetary figure (`KES 14,500`), stock quantity, phone number, and countdown timer uses `fontVariant: ['tabular-nums']`.

### 2.2 Explicit Scale & Tracking
```typescript
export const typeScale = {
  // Display Hero
  displayHero: { fontSize: 34, lineHeight: 40, letterSpacing: -1.0, fontWeight: "700" as const },
  displayLg:   { fontSize: 28, lineHeight: 34, letterSpacing: -0.8, fontWeight: "700" as const },
  displayMd:   { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: "600" as const },

  // Headings
  headline:    { fontSize: 18, lineHeight: 24, letterSpacing: -0.3, fontWeight: "600" as const },
  title:       { fontSize: 16, lineHeight: 22, letterSpacing: -0.2, fontWeight: "600" as const },

  // Body
  bodyLg:      { fontSize: 15, lineHeight: 21, letterSpacing: -0.1, fontWeight: "400" as const },
  bodyMd:      { fontSize: 14, lineHeight: 20, letterSpacing: 0.0,  fontWeight: "400" as const },
  bodySm:      { fontSize: 13, lineHeight: 18, letterSpacing: 0.0,  fontWeight: "400" as const },

  // Caption & Micro
  caption:     { fontSize: 12, lineHeight: 16, letterSpacing: 0.1,  fontWeight: "500" as const },
  micro:       { fontSize: 10, lineHeight: 14, letterSpacing: 0.3,  fontWeight: "600" as const, textTransform: "uppercase" as const },

  // Tabular Numerals (Financial)
  numericLg:   { fontSize: 24, lineHeight: 30, letterSpacing: -0.5, fontWeight: "700" as const, fontVariant: ["tabular-nums"] },
  numericMd:   { fontSize: 16, lineHeight: 22, letterSpacing: -0.2, fontWeight: "600" as const, fontVariant: ["tabular-nums"] },
  numericSm:   { fontSize: 13, lineHeight: 18, letterSpacing: 0.0,  fontWeight: "600" as const, fontVariant: ["tabular-nums"] },
} as const;
```

---

## 3. Space, Shape & Elevation

### 3.1 4pt Base Grid & 8pt Rhythm
All dimensions, paddings, and margins must align with the mathematical series: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

### 3.2 Role-Based Radii
Radii are locked by component **role**, not ad-hoc preference:
- **`radii.full` (9999px)**: Filter chips, status pills, avatar circles, icon buttons.
- **`radii.lg` (16px)**: Standard cards, swipeable rows, product tiles.
- **`radii.md` (10px)**: Primary / secondary action buttons, text input fields.
- **`radii.sm` (6px)**: Inner thumbnails, variant chips, toast notifications.
- **`radii.sheet` (24px)**: Bottom sheet modals (top corners only).

### 3.3 Layered Ambient Elevation
- **Light Mode**: 2-stage stacked ambient drop shadow:
  - Ambient: `shadowColor: "#0B0E14", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }`
  - Direct: `shadowColor: "#0B0E14", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }`
- **Dark Mode**: No muddy dark drop shadows. Elevation is rendered via **0.5px hairline jewel borders** (`rgba(255,255,255,0.08)`) and an 8% surface tone step.

---

## 4. Motion & Physical Grammar

### 4.1 Tokenized Durations & Springs
```typescript
export const motionTokens = {
  durations: {
    instant: 120, // Toggles, micro-checks
    quick: 200,   // Button scales, chip selection
    base: 320,    // Sheet transitions, list re-orders
    dramatic: 480 // Full screen reveals, morph transitions
  },
  springs: {
    // Physical spring: oiled mechanical feel with zero nauseating bounce
    physical: { damping: 28, stiffness: 220, mass: 1 },
    // Interactive tactile spring: for button down-press
    press: { damping: 24, stiffness: 300, mass: 0.8 },
    // Restrained pop: for tick checkmarks and badge updates
    pop: { damping: 20, stiffness: 260, mass: 0.9 },
  }
} as const;
```

### 4.2 Rules of Motion Grammar
1. **Every Animation Runs on the UI Thread**: Built strictly with `react-native-reanimated` worklets. Zero legacy `Animated`, zero per-frame `setState`.
2. **Motion Grammar**:
   - *Enter*: Subtle rise ($+8\text{px} \rightarrow 0$) + opacity ($0 \rightarrow 1$) with `ease-out-quint`.
   - *Exit*: Subtle fall ($0 \rightarrow +8\text{px}$) + opacity ($1 \rightarrow 0$) with `ease-in`.
   - *Commit / Success*: Restrained spring scale ($0.98 \rightarrow 1.02 \rightarrow 1.0$) + haptic pulse.
   - *Reject / Error*: 2-cycle horizontal shake ($\pm 6\text{px}$) + warning haptic.
3. **Accessibility**: `useReducedMotion()` hook wraps all animated components. When Reduce Motion is enabled, all animations fall back immediately to instant opacity swaps.

---

## 5. Haptic Architecture

All haptics are routed through a unified, rate-limited module (`haptics.ts`). Never call `expo-haptics` raw in feature components.

| Event Role | Haptic Method | System Equivalent | Usage |
|---|---|---|---|
| `selection` | `Haptics.selectionAsync()` | Tick | Tab switch, filter chip toggle, segmented control. |
| `buttonPress` | `Haptics.impactAsync(Light)` | Soft tap | Primary & secondary button press down. |
| `sheetOpen` | `Haptics.impactAsync(Medium)` | Detent | Bottom sheet reaches detent, command palette opens. |
| `destructive` | `Haptics.impactAsync(Heavy)` | Thud | Delete product, cancel order confirmation. |
| `success` | `Haptics.notificationAsync(Success)` | Double-pulse | Payment settled, order accepted, sync completed. |
| `warning` | `Haptics.notificationAsync(Warning)` | Stutter | Network offline, optimistic mutation rollback. |

---

## 6. Imagery & Optical Consistency

- **Inner Hairline Rings**: Every product image tile features an inner `0.5px` border (`rgba(255,255,255,0.12)` in dark, `rgba(0,0,0,0.06)` in light) to cleanly delineate light photos from light backgrounds.
- **Optical Aspect Ratios**: Product catalogue cards strictly use `4:3` or `1:1` aspect ratios with `resizeMode="cover"`.
- **Skeleton Shimmer**: When images load, a smooth linear pulse placeholder maintains exact layout dimensions. No layout shifts.

---

## 7. Voice, Tone & Microcopy

- **Confident & Terse**: "Order accepted" not "Yay! Your order has been successfully accepted!".
- **Zero Exclamation Marks**: Exclamation marks feel juvenile and needy. Period or clean whitespace.
- **Zero "Oops!"**: "Connection lost. Changes queued offline." not "Oops! Something went wrong!".
- **Zero Emoji in Chrome**: Emoji are never used in buttons, tabs, headers, or status chips.
- **Empty States**: Exactly one honest sentence explaining current status + one clear primary button.
