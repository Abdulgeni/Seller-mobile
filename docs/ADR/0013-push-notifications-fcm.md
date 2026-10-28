# ADR 0013: Push Notifications via FCM, Categories, and Dev Harness

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Sellers must receive instant alerts for incoming orders, with interactive notification action buttons ("Accept Order" / "View Order") and deep-link routing. External cloud FCM requires project credentials not available in pure local development.

## Decision
Use `expo-notifications` for FCM registration, notification channels, action categories (`ACCEPT_ORDER`, `VIEW_ORDER`), and deep-link handling. Abstract FCM behind a service interface and build an in-app dev notification simulator harness to test foreground, background, and quit states deterministically without external credentials. Provide a clear swap runbook in `docs/SETUP.md`.

## Alternatives Considered
- **`@react-native-firebase/messaging`**: Heavier native footprint, requires raw GoogleService-Info.plist and google-services.json setup immediately before dev builds can boot.
- **Polling only**: Inefficient battery drain, lacks OS-level background action notifications.

## Consequences
- **Positive**: Clean interface boundary; fully testable in CI and local emulator without requiring live Firebase credentials; deep-link action categories supported natively.
- **Negative**: Switching to real production FCM requires adding `google-services.json` to `app.json` config plugins.
