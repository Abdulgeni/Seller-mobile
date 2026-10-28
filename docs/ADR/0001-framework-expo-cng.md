# ADR 0001: Expo with Prebuild / Continuous Native Generation (CNG) and Development Build

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
The application requires high-performance native modules including `react-native-vision-camera`, `react-native-mmkv`, `@nozbe/watermelondb`, and `react-native-skia`. Expo Go does not contain these custom native libraries. A choice must be made between bare React Native CLI and Expo Prebuild (Continuous Native Generation).

## Decision
Use Expo Prebuild with `expo-dev-client` (Continuous Native Generation via Config Plugins). Native projects (`android/` and `ios/`) are generated artifacts and never manually modified.

## Alternatives Considered
- **Bare React Native CLI**: Requires manual native project maintenance, manual podfile/gradle edits, and high maintenance overhead when upgrading React Native versions.
- **Expo Go**: Incompatible with custom native modules (`react-native-mmkv`, `vision-camera`, `watermelondb`).

## Consequences
- **Positive**: Upgrades remain deterministic and automated via config plugins. Monorepo builds integrate cleanly with EAS or local `expo run:android`. Native code remains clean and reproducible.
- **Negative**: Requires local native build tools (Android SDK, NDK, JDK, CMake) or cloud EAS builds to produce dev-client binaries.
