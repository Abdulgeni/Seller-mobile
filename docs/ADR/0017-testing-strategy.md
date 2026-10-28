# ADR 0017: Multi-Layer Testing Strategy (Vitest, RNTL, MSW, Maestro)

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
A resilient mobile app requires verification across unit logic, React Native component rendering, network boundary mocks, and end-to-end device journeys. "Vibe and hope" is strictly banned.

## Decision
Adopt a multi-layered testing pyramid:
1. **Vitest / Jest**: Pure logic, Zod validation, state machines (Order status, M-Pesa payment flow), sync queue retry algorithms.
2. **React Native Testing Library (RNTL)**: Component tests verifying user interactions, accessibility roles, skeleton/empty/error states.
3. **Mock Service Worker (MSW)**: Network mocking at the Fetch boundary for tests and dev-mode runtime.
4. **Maestro**: End-to-end black-box UI testing of critical merchant journeys on emulator.

## Alternatives Considered
- **Detox**: Complex native compilation setup on Windows/Android, slower test execution than Maestro.
- **Manual QA only**: Prone to regression, cannot satisfy automated loop quality gates.

## Consequences
- **Positive**: High automated confidence; state machines and offline queues tested under deterministic conditions; zero network leaks.
- **Negative**: Requires setting up MSW Node/React Native fetch polyfills and writing unit tests for every network-touching hook.
