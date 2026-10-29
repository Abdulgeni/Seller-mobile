# Interactive Demo Walkthrough & Evaluation Guide

This guide walks through how each core feature (F1–F5) can be exercised and verified within the application.

---

## 📸 Feature 1: Product Catalogue by Photo

1. **Viewing 5,000 Seeded Products**:
   - Navigate to the **Products** tab.
   - Observe the Shopify FlashList grid rendering 5,000 seeded catalogue items at 60 FPS without frame drops.
   - Tap the stock switch on any product item. The status updates instantly via TanStack Query optimistic mutation with haptic feedback.
   - Tap the price button to open the quick-edit modal. Update the price and save; observe instant optimistic cache patch and background sync.

2. **Photo Capture & Draft Creation**:
   - Tap the **+ New Product** button in the top bar.
   - Tap **Take Photo** (VisionCamera) or **Pick from Gallery**.
   - Observe the photo pipeline compress the image off-the-JS-thread via `react-native-compressor` to ≤ 200 KB and ≤ 1600 px before upload to the mocked Supabase storage provider.
   - Notice the AI suggestion button trigger a deterministic title and category recommendation based on the image's hash.
   - Configure variants (e.g. Size: S, M, L × Color: Black, Blue). Observe the dynamic SKU matrix generation.
   - Partially fill out the form and exit the app. Re-open to verify the draft was persisted in MMKV and recovered without data loss.

---

## 📦 Feature 2: Order Tracking & Optimistic Transitions

1. **Order List & Filtering**:
   - Navigate to the **Orders** tab.
   - Use the status filter chips (`New`, `Accepted`, `Packed`, `Shipped`, `Delivered`, `Cancelled`) to filter orders.
   - Type in the search box to find orders by order number (e.g., `ORD-1001`) or customer name.
   - Select a date filter to constrain orders within a specific timeframe.

2. **Order Detail & Typed State Machine**:
   - Tap an order to open the Order Detail screen (`/orders/[id]`).
   - View the line items, customer delivery details, and status timeline.
   - Action buttons at the bottom reflect only valid state machine transitions (e.g. `ACCEPT_ORDER` is only available for `NEW` orders).
   - Tap an action button. Observe the optimistic transition update the UI immediately with haptic confirmation.
   - On network failure (simulated via `EXPO_PUBLIC_MOCK_FAILURE_RATE`), the transition automatically rolls back to the previous state with an error toast.

---

## 🔔 Feature 3: Push Notifications & Deep-Link Resolution

1. **Dev Push Notification Harness**:
   - Open the **Dev Notification Simulator** from the top header or debug menu.
   - Select an order scenario (e.g., `New Order Received: KES 4,500`).
   - Choose a notification action: `ACCEPT_ORDER` or `VIEW_ORDER`.
   - Tap **Trigger Push Simulation**.

2. **Action Handling & Cold-Start Deep Links**:
   - A foreground notification banner slides down with actionable buttons.
   - Pressing `ACCEPT_ORDER` executes the deep link `seller://orders/:id?action=accept`, transitioning the order status directly.
   - The unread badge on the Orders tab increments accordingly.
   - Test cold-start handling: launch the deep link while logged out. The link is queued and safely resolved only after authentication state hydration completes.
   - Test an invalid order ID (e.g., `seller://orders/invalid_999`). A graceful empty state is displayed rather than an unhandled crash.

---

## 💳 Feature 4: M-Pesa Mobile-Money Payment Flow

1. **Simulating STK Push**:
   - From any accepted order screen, tap **Collect Payment (KES ...)**.
   - The M-Pesa Payment Sheet Modal opens, pre-populated with the customer's phone number.
   - Tap **Send M-Pesa STK Push**.
   - Observe the strict state machine sequence: `IDLE` → `INITIATING` → `PENDING`.
   - The in-flight request lock prevents double-charging if the button is rapidly double-tapped.

2. **Failure Path Simulation & Receipts**:
   - Test failure scenarios by altering the phone number suffix:
     - Ends in `...0000`: triggers `INSUFFICIENT_FUNDS` failure.
     - Ends in `...9999`: triggers `USER_CANCELLED` failure.
     - Ends in `...8888`: triggers `TIMEOUT` failure.
   - On standard numbers, the transaction completes with `SUCCESS` and displays a formal, shareable receipt with transaction ID and reference code.
   - Kill the app mid-pending; on next launch, `recoverActivePayment()` automatically recovers the active transaction from backend state without lost funds.

---

## 📊 Feature 5: Seller Ops Dashboard & Biometric Security

1. **KPI Dashboard & Pre-Aggregated 7-Day Chart**:
   - Navigate to the **Dashboard** tab.
   - View the 4 server-aggregated KPI cards: Today's Revenue, Today's Orders, Low Stock Alerts, and Pending Payouts.
   - Inspect the 7-day revenue trend chart rendered via SVG/Canvas primitives fed directly from the server series.
   - Notice that skeleton loading screens and error retry mechanisms prevent layout shifts.

2. **Biometric Security Gate on Financial Views**:
   - Navigate to **Payouts** (`/payouts`).
   - If not authenticated, the screen is locked behind `BiometricGate` (`expo-local-authentication` with passcode fallback).
   - Authenticate with biometrics or passcode to view available balances, settlement schedules, and masked bank account numbers.
   - Tap **Lock Now** or background the application for more than 5 minutes. Upon returning, the biometric gate re-locks automatically to protect merchant financial data.

3. **Offline Sync Queue (Airplane Mode Run)**:
   - Toggle device offline (or enable airplane mode).
   - The persistent offline sync banner appears showing active connection state.
   - Toggle stock on several products and change an order status.
   - The sync queue counter indicates `N pending actions` persisted in local storage with UUID v4 idempotency keys.
   - Re-enable connection and tap **Sync Now**; mutations flush sequentially (FIFO) with zero duplicates.
