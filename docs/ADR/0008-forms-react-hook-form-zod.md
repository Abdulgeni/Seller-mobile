# ADR 0008: Form Management via react-hook-form and Shared Zod Schemas

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Product creation, variant pricing, order editing, and phone number entry require responsive, accessible forms with instant validation, minimal re-renders, and shared validation schemas across packages.

## Decision
Use `react-hook-form` paired with `@hookform/resolvers/zod`. All form validation schemas reside in `packages/schemas` and are shared between the mobile UI and API mock handlers.

## Alternatives Considered
- **Formik**: Higher re-render frequency on mobile inputs, less ergonomic TypeScript schema inference.
- **Uncontrolled vanilla inputs with custom state**: Prone to duplicate validation logic and state desynchronization.

## Consequences
- **Positive**: Isolated input re-renders, full TypeScript schema inference, seamless integration with accessible input components.
- **Negative**: Requires learning react-hook-form's controller patterns for custom inputs.
