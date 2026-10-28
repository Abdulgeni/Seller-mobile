# ADR 0016: Styling via NativeWind / Tailwind and Unified Design Tokens

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Inconsistent styling, hardcoded hex values, and poor light/dark mode support create visual degradation and accessibility issues. The project strictly bans hardcoded hex colors in components.

## Decision
Use NativeWind (v4) driven by a single theme token specification in `packages/ui/src/tokens`. All components reference semantic token classes (`bg-surface-primary`, `text-content-primary`, `border-border-subtle`). Hardcoded hex strings in JSX are banned and flagged in code review.

## Alternatives Considered
- **StyleSheet.create with manual color objects**: Verbose, easy to accidentally hardcode hex values, requires manual `useColorScheme` wiring in every component.
- **Tamagui / Restyle**: Powerful, but NativeWind provides faster Tailwind-based DX and direct CSS-like class ergonomics.

## Consequences
- **Positive**: Zero hardcoded hex colors, automatic light and dark mode switching, unified design system across packages.
- **Negative**: Requires Babel and Tailwind configuration in the app workspace.
