# Single-Vendor E-Commerce Seller App (React Native / Expo)

A production-grade, strict-typed, contract-first mobile seller application built with **React Native (Expo Dev Client)**, **TypeScript**, **Turborepo**, **TanStack Query**, and **Shopify FlashList**.

Designed as a single-vendor store with a forward-compatible multi-vendor split-payout seam documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📱 Feature Matrix

| Feature | Description | Implementation Highlights |
|---|---|---|
| **F1: Product Catalogue by Photo** | Capture or pick photos, compress off-thread, manage variants and live catalogue. | `react-native-compressor` (≤ 200 KB, ≤ 1600 px), `MockStorageClient` (Supabase-compatible), dynamic size × color variant matrix with SKU generation, MMKV draft persistence, image-hash AI suggestions stub, FlashList grid of 5,000 items at 60 FPS with optimistic stock toggle & price edit. |
| **F2: Order Tracking** | Live order list, customer search, status filters, and detail timeline. | FlashList order list, status filter chips (`New`, `Accepted`, `Packed`, `Shipped`, `Delivered`, `Cancelled`), date range filters, typed order state machine in `@repo/schemas` with 11 transition unit tests, TanStack Query optimistic transitions with snapshot rollback toast on failure. |
| **F3: Push Notifications (FCM)** | Remote order push notifications, actionable buttons, and deep links. | FCM service interface, actionable notifications (`ACCEPT_ORDER`, `VIEW_ORDER`), strict Zod deep-link router (`seller://orders/:id?action=accept`), cold-start queue resolving only after auth hydration, interactive dev notification simulator harness modal (`NotificationHarnessModal`). |
| **F4: M-Pesa Mobile Money Flow** | Realistic mobile-money STK push simulation and transaction ledger. | Typed payment state machine (`IDLE` → `INITIATING` → `PENDING` → `SUCCESS` \| `FAILED` \| `TIMEOUT` \| `CANCELLED`), in-flight double-tap lock preventing duplicate charges, mid-pending crash recovery across app relaunch, failure path injection (insufficient funds, user cancelled, timeout), shareable receipt generator. |
| **F5: Seller Ops & Biometric Gate** | Executive dashboard KPIs, pre-aggregated analytics, and biometrics. | Server-aggregated KPI cards (`revenueToday`, `ordersTodayCount`, `lowStockItemsCount`, `pendingPayoutAmount`), 7-day pre-aggregated revenue trend chart, `BiometricGate` (`expo-local-authentication` + passcode fallback) protecting payouts with 5-minute background re-auth threshold, persistent offline sync queue with UUID v4 idempotency. |

---

## 🏗️ Repository Architecture

Managed with **Turborepo** and **pnpm workspaces** (`node-linker=hoisted`):

```
mob-app-dev/
├── packages/
│   ├── schemas/        # Contract-first Zod schemas & inferred TypeScript types
│   ├── api/            # Typed API client, MSW mocks, fixtures, and offline sync engine
│   ├── ui/             # Accessible UI primitives, theme tokens (light/dark), i18n t(), logger
│   └── config/         # Shared ESLint, TypeScript, and NativeWind/Tailwind configs
├── apps/
│   └── mobile/         # Expo Router application workspace (Expo SDK 58, React 19, RN 0.88)
└── docs/               # 17 ADRs, Architecture specification, setup guide, decision log
```

### Invariant Rules Enforced
1. **Zero `any`**: Static types strictly derived from Zod schemas at every boundary (network, MMKV, deep-links, notifications).
2. **Server State Partitioning**: TanStack Query owns 100% of server state with hierarchical typed query key factories. Server data never enters Zustand.
3. **No Client-Side Aggregations**: KPI counts, revenue totals, and chart series are pre-aggregated on the server mock.
4. **Offline-First Resilience**: All mutations use client-generated UUID v4 idempotency keys and persist to a FIFO retry queue with exponential backoff.
5. **No FlatList**: Shopify FlashList is used exclusively for all virtualized lists.
6. **No Raw Hex Codes**: All colors reference `@repo/ui` theme tokens.

---

## 🧪 Verification & Automated Tests

All packages are strictly typed and covered by automated unit and integration tests:

| Package | Test Suites | Tests | Status |
|---|---|---|---|
| `@repo/schemas` | 3 | 19 | ✅ Passing |
| `@repo/api` | 4 | 14 | ✅ Passing |
| `@repo/mobile` | 10 | 36 | ✅ Passing |
| **Total** | **17** | **69** | **100% Green** |

### Verification Commands
```bash
# Run all automated tests across monorepo
pnpm test

# Typecheck all 5 workspace projects (zero errors)
pnpm run typecheck

# Lint with ESLint 9 (zero errors, zero warnings)
pnpm --filter @repo/mobile run lint
```

---

## 🚀 Quickstart & Development

### 1. Prerequisites
- **Node.js**: v20+ (Tested on v22.16.0)
- **pnpm**: v9+ (Tested on v12.15.0)
- **Java**: JDK 17+ (Tested on Java 22.0.1)
- **Android SDK**: API 34+ with an active emulator (`emulator-5554`) or physical device.

### 2. Installation
```bash
# Install all dependencies across monorepo
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Running the App
```bash
# Start Expo development bundler
pnpm --filter @repo/mobile start

# Run on attached Android emulator / device
pnpm --filter @repo/mobile android
```

---

## 🔐 Credentials & Cloud Swaps
Instructions for swapping local MSW mocks to live cloud infrastructure (Firebase Cloud Messaging, Supabase Storage, and Safaricom Daraja M-Pesa API) are detailed in [`docs/SETUP.md`](docs/SETUP.md).

## 🏛️ Architectural Decisions
The 17 Architectural Decision Records (ADRs) and ongoing decision log can be inspected in [`docs/ADR/`](docs/ADR/) and [`docs/DECISIONS.md`](docs/DECISIONS.md).
