# ADR 0012: Off-JS-Thread Image Compression via react-native-compressor

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
High-resolution photos from modern mobile cameras (12MP - 48MP) are several megabytes each. Decoding and compressing them in JavaScript blocks the UI thread, causing severe lag and out-of-memory crashes on mid-tier Android devices. The spec requires photos compressed to <= 200 KB and <= 1600 px.

## Decision
Use `react-native-compressor` to compress and downscale images natively on background worker threads before uploading or caching. Never perform image manipulation on the JavaScript main thread.

## Alternatives Considered
- **Pure JS image manipulation (e.g. canvas/base64)**: Catastrophic memory spikes and frozen animations on the main thread.
- **`expo-image-manipulator`**: Good, but `react-native-compressor` provides fine-grained byte size budgeting and native compression quality algorithms.

## Consequences
- **Positive**: Main thread remains 60 FPS during photo processing; payloads stay under 200 KB; cellular data usage is drastically reduced.
- **Negative**: Requires native prebuild module and asynchronous filesystem paths handling.
