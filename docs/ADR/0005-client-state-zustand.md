# ADR 0005: Client-Side Ephemeral State via Zustand

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
UI components need lightweight, fast, hook-based shared state for purely client concerns (search text filters, status filter dropdown selection, active modal sheets, unsaved product drafts before persistence).

## Decision
Use Zustand exclusively for client-side ephemeral state. Forbid storing any server entities or API response payloads in Zustand stores.

## Alternatives Considered
- **React Context**: Can trigger unwanted re-renders across consumers unless memoized meticulously with custom selectors.
- **Redux / Jotai**: Overkill for lightweight UI-only filters and draft scratchpads.

## Consequences
- **Positive**: Minimal boilerplate, hook-based granular selectors, zero unnecessary re-renders, clear distinction between server and client state.
- **Negative**: Requires architectural enforcement to prevent developers from sneaking server responses into stores.
