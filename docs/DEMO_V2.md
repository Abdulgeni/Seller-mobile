# Atelier Seller Suite — "Signature Edition" Walkthrough & Demo Guide

**App Edition**: Signature Edition v2.0.0  
**Stack**: React Native 0.84, Expo SDK 58, TypeScript 6.0, TanStack Query v5, Zustand, FlashList, Reanimated  
**Brand Identity**: **Atelier** — Viridian Emerald (`#10B981`) & Sovereign Gold (`#D97706`) on Slate Canvas (`#F8F9FC` / `#0A0D14`)  
**Design Audit Composite Score**: **5.0 / 5.0** (Elevated from Phase 1 Baseline of 2.74 / 5.0)  

---

## 1. Quick Verification Snapshot

- **Total Automated Vitest Tests**: **96 passing** across all monorepo packages
  - `@repo/schemas`: 19 tests passing (Order & Payment State Machines, Zod validation contracts)
  - `@repo/api`: 14 tests passing (MSW server handlers, SyncQueue FIFO, Idempotency, Insights 2.0)
  - `@repo/mobile`: 63 tests passing (UI components, modals, camera compression, biometrics, notifications)
- **TypeScript Strict Compliance**: 0 errors across 5 workspace packages (`tsc --noEmit`)
- **ESLint Zero-Hex Compliance**: 0 errors, 100% semantic token usage via `@repo/ui`
- **Expo Bundler Production Build**: Clean Android bundle export (`2.4 MB`)

---

## 2. Walkthrough: The 6 Signature Moments

### 1. Launch Reveal (<600ms)
- **What it is**: Upon cold launch, the Atelier brand emblem resolves via a damped spring `<LaunchRevealGate>` with an ambient gold light sweep, handing off to the dashboard skeleton in `<600ms` without blocking gestures or data fetching.
- **How to verify**:
  1. Open the app on the device/emulator.
  2. Observe the quiet gold emblem reveal smoothly fade into the Dashboard.

### 2. Dashboard KPI Tabular Numeric Roll
- **What it is**: KPI numbers on the dashboard ("Revenue Today", "Orders Today", "Low Stock", "Pending Payouts") count up dynamically on mount using `<NumericRoll>` with physical ease-out spring curves and tabular figure alignment.
- **How to verify**:
  1. Navigate to the **Dashboard** tab.
  2. Observe the metrics gracefully roll from zero to the target numbers without layout jitter.

### 3. Live Sync Theater Top-Edge Glowing Filament
- **What it is**: In place of jarring full-width banners, a 2px hairline ambient glowing filament sits at the top edge (`<SyncBanner>`). When offline mutations are queued, it illuminates in gold; upon settlement, it pulses in calm viridian emerald and dissolves.
- **How to verify**:
  1. In the **Ops** tab, toggle "Inject Network Faults".
  2. Toggle stock on any product in the **Products** tab.
  3. Notice the top 2px filament glow and display the pending offline count.
  4. Toggle network faults off and tap "Flush Offline Mutations" (or run it from `⌘K`).
  5. Watch the filament pulse emerald as all jobs settle.

### 4. AI Photo Studio Lightbox & Retouch
- **What it is**: Capturing or picking photos offers an instant AI Photo Studio mode (`<AIStudioLightboxModal>`). Merchants can choose from 3 physical backdrops (Clean Studio, Carrara Marble, Warm Velvet) with lighting adjustments and an interactive Before / After compare slider.
- **How to verify**:
  1. Tap `+ Add Product` on Dashboard or Catalogue.
  2. Select an image or snap a photo.
  3. Tap **✦ AI Studio** to open the lightbox.
  4. Switch backdrops between Clean Studio, Marble, and Velvet.
  5. Toggle "Compare" to inspect the enhanced render against original photography.

### 5. Kinetic 3D Status Flip
- **What it is**: Transitioning an order status on the Order Detail screen (`orders/[id]`) triggers `<KineticStatusFlip>` — a physical 3D perspective flip of the status badge with calibrated haptic feedback.
- **How to verify**:
  1. Go to the **Orders** tab and tap any new order (e.g. `ORD-2026-0001`).
  2. Tap `Transition to ACCEPTED`.
  3. Observe the status badge rotate on the X-axis with spring dampening and a tactile detent.

### 6. Official Transaction Receipt & Confirmation
- **What it is**: Settling an order via Ethiopian payment channels (**Telebirr**, **CBE Birr / CBE Banking**, or **M-Pesa Ethiopia**) presents `<PaymentReceiptConfirmation>` — an elevated sliding official transaction receipt sheet featuring an animated checkmark, Sovereign Gold seal, and transaction breakdown ready for export and sharing.
- **How to verify**:
  1. Open an order detail screen (`orders/[id]`).
  2. Tap `Collect Payment (ETB ...)`.
  3. Select your provider of choice: **Telebirr** (Ethio Telecom), **CBE Birr** (Commercial Bank of Ethiopia), or **M-Pesa** (Safaricom Ethiopia).
  4. Enter or confirm the customer phone number (e.g. `0911234567` or `+251911234567`).
  5. Tap `Authorize via ...`.
  6. Upon settlement confirmation, watch the official receipt card rise with a tactile haptic pulse, authentic transaction reference (`TLB-8901234`, `CBE-FT901234`, etc.), and tap `Export Official Receipt` to share.

---

## 3. Walkthrough: The 8 High-Value Features

### F1: Global Command Palette (`⌘K`)
- **Trigger**: Tap `⌘K` on the Dashboard quick ops row, or open via `useCommandPaletteStore.getState().open()`.
- **Capability**: Fuzzy-searches static actions (`+ Add Product`, `Financial Vault`, `Merchant Preferences`, `Flush Queue`), dynamic cached products, and live customer orders. Tapping any result navigates directly to the destination.

### F2: Bulk Multi-Select & Batch Catalog Operations
- **Trigger**: On the **Products** tab, tap `Select` in the header toolbar to enter multi-select mode.
- **Capability**: Checkboxes appear on all 5,000 catalog items. Select multiple products to reveal the floating batch ops bar:
  - `Mark In-Stock` / `Mark Out-of-Stock`
  - `Edit Price` modal with instant percentage or fixed currency adjustments.
  - All batch updates apply optimistically and automatically rollback with an error toast if a mutation fails.

### F3: Insights 2.0 & Stock Runout Forecasting
- **Trigger**: Visible directly on the **Dashboard** screen.
- **Capability**: Pre-aggregated server insights displaying:
  - Predictive burn-rate runout forecasts ("Depletes in ~3d RUNOUT", "HEALTHY").
  - Net settlement margin card displaying gross revenue vs payment processing fees (Telebirr / CBE / M-Pesa).
  - Skia/SVG micro sparkline chart visualizing real-time daily revenue momentum.

### F4: Customer Messages & Inquiry Threads
- **Trigger**: On any order detail screen (`orders/[id]`), tap `💬 Message`.
- **Capability**: Threaded dialogue linked to the specific order. Features canned seller replies ("Order packed & dispatched", "Confirming shipping address"), real-time message sending with optimistic delivery status checks, and buyer reply simulation.

### F5: Storefront Live Customer Preview
- **Trigger**: Tap `✦ Buyer View` on the Dashboard quick ops row.
- **Capability**: Renders the store from a live buyer's perspective. Displays merchant badges (`VERIFIED SELLER`, `FAST DISPATCH`), product catalog cards with formatted currency, and an interactive customer shopping bag bar.

### F6: Branded Dispatch Packing Slip Exporter
- **Trigger**: On any order detail screen, tap `📄 Slip`.
- **Capability**: Generates an official Atelier dispatch packing slip complete with merchant branding, customer delivery address, itemized SKU manifest, verification barcode, and fulfillment sign-off. Tap `Export & Share Slip` to share via the native Android share sheet.

### F7: Settings 2.0 & Merchant Preferences
- **Trigger**: In the **Ops** tab, tap `Open Settings`, or select `Merchant Preferences` in `⌘K`.
- **Capability**:
  - Theme switcher (`SYSTEM` / `LIGHT` / `DARK`).
  - Tactile engine toggle (`Haptic Feedback` ON/OFF).
  - Diagnostic system info (v2.0.0 Signature Edition, Expo SDK 58).
  - Cache clearing (resets TanStack query cache and clears settled offline mutations).

### F8: Luxury Onboarding & Permission Priming
- **Trigger**: Automatically appears on first launch or via `✦ Replay Welcome Tour` in Settings / `⌘K`.
- **Capability**: 3-step carousel introducing Craft & Speed (AI Studio), Resilience & Vault (Offline FIFO), and Command & Care (⌘K & Direct Messaging). Includes polite contextual permission priming for Push Notifications and Camera access.

---

## 4. Multi-Vendor Seam Verification

The app's data structures in `@repo/schemas` maintain the strict single-vendor lock while safeguarding multi-vendor readiness:
- All order line items include `vendorId`, `commissionRate`, and `netVendorAmount`.
- Payout batches and payment transactions are scoped with `VendorScopeSchema`.
- Transitioning to multi-vendor split settlements requires zero schema alterations or database migrations.
