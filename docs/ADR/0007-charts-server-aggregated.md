# ADR 0007: Server-Aggregated Charts and Visualizations

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Rendering revenue trends and order analytics on mobile devices can easily choke the JavaScript thread if the client fetches raw order lists and runs `.reduce()` calculations locally.

## Decision
Feed mobile charts (Victory Native XL / React Native Skia primitives) exclusively with pre-aggregated server data series. The server mock computes daily revenue buckets, order counts, and KPI totals. Client-side aggregation of raw records is strictly prohibited.

## Alternatives Considered
- **Client-side aggregation over raw order entities**: Heavy CPU usage on JS thread, scales poorly as merchant order volume grows, drains battery.
- **WebView-based charting (e.g. Chart.js / Highcharts)**: High memory overhead, sluggish touch interaction, jarring dark/light mode switches.

## Consequences
- **Positive**: Instant chart rendering, zero JS-thread lag, predictable payload sizes regardless of order history size.
- **Negative**: Requires dedicated backend/mock aggregation endpoints for analytics.
