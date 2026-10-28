# ADR 0014: Security via expo-local-authentication and expo-secure-store

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Sellers manage revenue, initiate mobile-money payouts, and store sensitive customer information. Financial screens must be protected from unauthorized access, and sensitive auth tokens must never be written to unencrypted storage (AsyncStorage/MMKV).

## Decision
Use `expo-secure-store` (backed by Android Keystore and iOS Keychain) for sensitive session tokens. Use `expo-local-authentication` to enforce a biometric gate (Fingerprint / Face ID / Passcode fallback) on Payouts and Bank Details screens, with an automatic re-authentication requirement if the app has been in the background for > 5 minutes.

## Alternatives Considered
- **AsyncStorage for tokens**: Vulnerable to root extraction and unencrypted file access on rooted Android devices.
- **Biometric lock only at app launch**: Annoying for everyday catalog browsing; doesn't protect when handing phone to an employee to take product photos.

## Consequences
- **Positive**: Defense-in-depth; hardware-backed token security; scoped biometric protection on financial flows without degrading catalogue workflow.
- **Negative**: Requires handling fallback paths when device has no biometrics enrolled.
