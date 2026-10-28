# ADR 0004: Server State Management via TanStack Query

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Server state involves asynchronous fetching, background polling, caching, stale-while-revalidate, deduplication, and optimistic mutations. Duplicating server state in client-side global stores (e.g. Redux or Zustand) leads to synchronization drift and state tearing.

## Decision
Adopt TanStack Query (v5) as the single source of truth for all server-originating data. Require typed query key factories per feature. Implement optimistic mutation lifecycles (`onMutate` -> snapshot -> patch -> `onError` rollback -> `onSettled` invalidate). Ban storing server data in Zustand.

## Alternatives Considered
- **Redux Toolkit / RTK Query**: Heavier boilerplate, more complex setup for simple offline mutation rollback flows.
- **Zustand with async actions**: Conflates ephemeral client state with cached server state, requiring custom caching and refetching mechanisms.

## Consequences
- **Positive**: Automatic cache invalidation, deduplication, built-in retry mechanisms, standard optimistic UI primitives.
- **Negative**: Requires strict adherence to query key conventions to avoid cache misses or stale data.
