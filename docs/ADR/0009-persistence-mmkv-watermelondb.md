# ADR 0009: Hybrid Persistence Layer (MMKV + WatermelonDB)

- **Status**: Accepted
- **Date**: 2026-10-27
- **Decider**: Principal Mobile Engineer / Staff Architect

## Context & Problem Statement
Sellers need instant offline access to thousands of product catalog items and orders, alongside microsecond synchronous access to user preferences, draft backups, and sync queue metadata. Neither pure SQLite nor pure Key-Value storage is optimal for both use cases.

## Decision
Adopt a hybrid persistence architecture:
1. **MMKV (`react-native-mmkv`)**: Synchronous, memory-mapped C++ key-value store for app settings, draft backups, biometric timestamps, and sync queue states.
2. **WatermelonDB (`@nozbe/watermelondb`)**: High-performance relational database on SQLite with lazy-loading observables for offline orders, products, and line items.

## Alternatives Considered
- **AsyncStorage**: Slow, asynchronous, serializes all reads across the bridge, unsuitable for large datasets or synchronous startup settings.
- **Pure SQLite (expo-sqlite)**: Lacks automatic reactive observable queries and complex offline synchronization adapters out of the box.

## Consequences
- **Positive**: Blazing fast synchronous startup reads from MMKV; scalable, observable offline relational querying for thousands of items in WatermelonDB.
- **Negative**: Requires maintaining two distinct storage paradigms and native prebuild plugins.
