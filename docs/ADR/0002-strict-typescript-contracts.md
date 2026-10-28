# ADR 0002: Strict TypeScript Configuration and Boundary Parsing

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Runtime type errors, unexpected null/undefined crashes, and loose `any` casts degrade app stability and developer confidence. We need a zero-tolerance policy against unchecked typing.

## Decision
Enforce TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true`. Strictly ban `any` across all packages. All untrusted boundaries (network responses, MMKV JSON, deep-link params, notification data) are received as `unknown` and parsed with Zod schemas.

## Alternatives Considered
- Standard loose TypeScript without `noUncheckedIndexedAccess`: Causes runtime `undefined` index access bugs in list operations.
- Manual type guards: Fragile, verbose, and difficult to keep synchronized with evolving schemas.

## Consequences
- **Positive**: Compile-time safety guarantees, zero hidden type coercions, compile-time detection of array out-of-bounds risks.
- **Negative**: Requires explicit array element checking and strict Zod schema declarations upfront.
