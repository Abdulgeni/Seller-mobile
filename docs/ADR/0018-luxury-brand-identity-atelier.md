# ADR 0018: Luxury Brand Identity & Visual Language ("Atelier")

## Context
Phase 1 established engineering correctness, resilient state synchronization, and strict TypeScript contracts. Phase 2 requires transforming the seller application into a luxury flagship product without compromising any existing performance or stability guarantees. A locked, opinionated design system is needed to govern color, typography, elevation, and motion across all current and future screens.

## Decision
Adopt **Direction C: Atelier** as the single visual and motion identity for the application:
1. **Palette**: Deep desaturated slate canvas (`#0A0D14` dark, `#F8F9FC` light), layered surfaces (`#121620`, `#1A202E`), single Viridian Emerald accent (`#059669` light, `#10B981` dark) occupying $\le 5\%$ of any screen, and a Sovereign Gold highlight (`#D97706` / `#F59E0B`) reserved strictly for receipts, vault seals, and financial confirmations.
2. **Typography**: High-contrast geometric grotesque display face for numerals and headings with negative letter tracking (`-0.03em`), paired with an ultra-clean UI grotesque for reading text. Numeric tabular figures (`fontVariant: ['tabular-nums']`) enforced for all prices, counts, and metrics.
3. **Motion**: UI-thread Reanimated worklets with a locked physical spring profile (`damping: 28, stiffness: 220, mass: 1`). Strict motion grammar (*enter = rise + fade*, *exit = fall + fade*, *success = spring pop + haptic*, *error = 2-cycle shake*).
4. **Elevation**: Zero single harsh drop shadows. Layered ambient elevation in light mode; 0.5px translucent borders and surface luminescing in dark mode.
5. **A11y**: WCAG AA contrast compliance verified in both light and dark themes. Full system `Reduce Motion` and Dynamic Type support.

## Consequences
- **Positive**: Cohesive, distinguished brand aesthetic matching top-tier applications (Linear, Things 3, Arc); instant differentiation from generic competitor apps; zero visual debt from ad-hoc styling.
- **Negative / Constraints**: Requires strict adherence to semantic design tokens; zero inline hex colors or magic numbers permitted in any component (enforced via linting).
