# ADR 0015: File-Based Navigation via Expo Router

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
The app needs strict deep-linking support (`seller://orders/:id`, `seller://orders/:id?action=accept`), typed navigation params, and clean route organization matching feature domains.

## Decision
Adopt Expo Router (v4+). Routes are defined file-based in `apps/mobile/src/app/`. All deep-link query parameters are validated with Zod before being passed to screen components. Cold-start links are gated until auth state hydration completes.

## Alternatives Considered
- **React Navigation (native stack only)**: Requires verbose manual linking configuration files and prone to route string typos.
- **Custom URL routers**: High maintenance burden and reinvents standard navigation primitives.

## Consequences
- **Positive**: Deep-linking works out of the box; typed route paths; automated screen transitions and nested layout stacks.
- **Negative**: Requires strict adherence to file naming conventions in `src/app/`.
