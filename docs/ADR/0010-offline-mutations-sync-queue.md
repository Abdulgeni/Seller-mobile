# ADR 0010: Offline Mutations via Persisted Idempotent Sync Queue

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Sellers frequently operate in fluctuating or non-existent cellular coverage (markets, transit, warehouses). Actions such as stock toggles, price updates, and order status transitions must not fail or drop when offline, nor must they duplicate upon reconnection.

## Decision
Implement a persistent FIFO sync queue backed by MMKV / SQLite. Every mutation generates a client-side UUID v4 idempotency key at moment of initiation. On network reconnection, the queue flushes mutations in strict chronological order with exponential backoff and jitter. Retries reuse the same idempotency key.

## Alternatives Considered
- **Direct failed-request retry without queue**: Drops mutations if the app is killed before reconnection.
- **Auto-retry without idempotency keys**: Risks duplicate charges, double stock decrements, and race conditions on patchy networks.

## Consequences
- **Positive**: Zero dropped mutations, resilience against app kills mid-offline, strict at-most-once and exactly-once execution semantics.
- **Negative**: Requires persistent conflict handling and rollback toasts if a queued mutation is permanently rejected by the server.
