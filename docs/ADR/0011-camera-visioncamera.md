# ADR 0011: Camera Capture and Frame Processing via VisionCamera

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
The app requires rapid photo capture for product catalog creation, with an architectural requirement to support real-time barcode/SKU scanning via frame processors in future stretch goals.

## Decision
Adopt `react-native-vision-camera` (v4). It provides a high-performance native camera pipeline, hardware-accelerated photo capture, and direct integration with Worklets / Skia / MLKit frame processors.

## Alternatives Considered
- **`expo-camera`**: Simpler integration, but lacks native frame processor architecture needed for high-speed barcode scanning.
- **`expo-image-picker` only**: Suitable for picking existing photos from gallery, but lacks responsive real-time viewfinder control.

## Consequences
- **Positive**: Blazing fast photo capture, 60 FPS viewfinder, future-proof barcode and OCR scanning capabilities.
- **Negative**: Requires native prebuild compilation and camera permissions config plugin in `app.json`.
