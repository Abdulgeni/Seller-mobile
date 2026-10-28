# ADR 0006: High-Performance List Rendering via Shopify FlashList

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
The app must render product catalogs of up to 5,000 items at 60 FPS and long order histories with inline toggles. Standard React Native `FlatList` creates and destroys native views during fast scrolling, causing blank spaces, dropped frames, and memory spikes.

## Decision
Adopt Shopify `@shopify/flash-list` for every virtualized list in the application. Ban `FlatList` and `ScrollView` for collection rendering. Enforce memoized cell components and stable keys.

## Alternatives Considered
- **React Native `FlatList`**: Struggles under load with large datasets (5,000 items) and complex nested cards.
- **RecyclerListView**: Excellent performance but verbose boilerplate and manual layout providers compared to FlashList's drop-in API.

## Consequences
- **Positive**: True view recycling, sustained 60 FPS, lower memory footprint, instant rendering of 5k catalog items.
- **Negative**: Requires providing accurate `estimatedItemSize` props to avoid layout jumps.
