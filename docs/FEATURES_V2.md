# Feature Expansion & Selection Matrix: Phase 2

## 1. Feature Menu Scoring Rubric
Every candidate from the Phase 2 charter is evaluated against the formula:
$$\text{Score} = \frac{\text{Value } (1\text{--}5) \times \text{Delight } (1\text{--}5)}{\text{Effort } (1\text{--}5)}$$

### Scoring Table

| Feature Candidate | Value (V) | Delight (D) | Effort (E) | Score | Decision | Rationale |
|---|---|---|---|---|---|---|
| **AI Photo Studio** | 5 | 5 | 3 | **8.33** | **ACCEPTED (L3)** | Highest viral/screenshot potential; transforms phone photos into catalog-ready luxury product cards. |
| **Command Palette (`⌘K`)** | 5 | 5 | 3 | **8.33** | **ACCEPTED (L4)** | Unlocks extreme speed-of-work for power merchants; instant fuzzy search across orders, products, ops. |
| **Settings 2.0 & Onboarding** | 4 | 4 | 2 | **8.00** | **ACCEPTED (L10)** | Essential for theme selection, haptic toggles, and polite contextual permission seeding without cold launch friction. |
| **Bulk Multi-Select & Batch Edit** | 5 | 4 | 3 | **6.67** | **ACCEPTED (L5)** | High utility for catalog maintenance; batch price and stock changes with single optimistic rollback. |
| **Insights 2.0 & Forecasting** | 5 | 4 | 3 | **6.67** | **ACCEPTED (L6)** | High retention value; replaces static charts with predictive inventory runout warnings and Skia sparklines. |
| **Customer Messages & Inquiries** | 4 | 4 | 3 | **5.33** | **ACCEPTED (L7)** | Essential buyer communication; order-linked chat thread with canned responses and unread badges. |
| **Branded Receipt & Packing Slip Export** | 4 | 4 | 3 | **5.33** | **ACCEPTED (L9)** | High merchant utility; generates clean printable packing slips and luxury receipt images for social sharing. |
| **Storefront Live Customer Preview** | 4 | 4 | 3 | **5.33** | **ACCEPTED (L9)** | Instant confidence booster; lets seller preview exactly how products and pricing look to buyers in real time. |
| *Home-screen widgets (Glance / WidgetKit)* | 4 | 4 | 5 | **3.20** | **CUT** | Native widget extensions require platform-specific native compilation and break Expo Go instant development preview. |
| *Reviews & Ratings Inbox* | 3 | 3 | 3 | **3.00** | **CUT** | Overlaps with Customer Messages; consolidated into unified customer communication surface. |
| *Seller Score / Streaks* | 3 | 2 | 2 | **3.00** | **CUT** | Artificial gamification violates Hard Ban on nagging, guilt, and fake urgency. |
| *Live Activity / Dynamic Island* | 3 | 4 | 5 | **2.40** | **CUT** | iOS-exclusive feature violates parity requirement on primary Android target testbed. |
| *Voice Dictation for Product Entry* | 3 | 3 | 4 | **2.25** | **CUT** | Unreliable transcription on local multi-language inventory terminology; high failure rate vs structured form. |

---

## 2. Signature Moments Selection (4–6 Shipped)

The following 6 signature moments are locked for delivery across Phase 2:
1. **Launch Reveal (L2)**: Brand emblem resolves via a damped spring + subtle ambient light sweep, handing off to the dashboard skeleton in $<600\text{ ms}$. Never blocks input.
2. **Dashboard KPI Numeric Roll (L2)**: Tabular currency metrics and order numbers count up once on initial mount with ease-out physics; remains static on refocus.
3. **Live Sync Theater (L2)**: 2px hairline glowing filament along top screen edge tracks offline queue settlement and resolves with a quiet emerald pulse.
4. **AI Photo Morph & Lightbox (L3)**: Instant studio transformation with realistic drop shadow, clean studio backdrop, and luxury beveling.
5. **Order Status Flip & Ripple (L8)**: Advancing order status triggers a localized radial button wave, kinetic status chip flip, and row re-sort.
6. **Payment Vault & Receipt Rise (L8)**: Vector SVG checkmark draws on smoothly, accompanied by a calibrated double haptic pulse and sliding luxury receipt sheet.

---

## 3. Loop Execution Plan (L1 → L10)

| Loop | Name | Scope & Verticals | Primary Gates |
|---|---|---|---|
| **L1** | **Design System & Token Engine** | Semantic Atelier tokens in `@repo/ui`, dual typography loading, Reanimated worklet spring physics, centralized `haptics.ts`, lint rule forbidding color/duration literals. | `typecheck`, `test`, `lint`, `doctor` |
| **L2** | **Signature Moments Core** | Launch reveal (<600ms), Reanimated tabular numeric roll on KPI cards, ambient sync theater filament, card elevation revamp. | `typecheck`, `test`, `visual-smoke` |
| **L3** | **AI Photo Studio** | `AIStudioService` contract, auto-enhancement, background studio isolation, 3 luxury mockup frames (Clean Studio, Marble Slab, Warm Velvet). | `typecheck`, `test`, `perf-budget` |
| **L4** | **Global Command Palette (`⌘K`)** | Global overlay modal, fuzzy search across orders, products, and actions, keyboard shortcut & header trigger, instant action execution. | `typecheck`, `test`, `a11y` |
| **L5** | **Bulk Multi-Select & Batch Ops** | Long-press selection mode on products and orders, batch stock toggle, batch price adjustment, atomic sync queue mutation + rollback. | `typecheck`, `test`, `sync-green` |
| **L6** | **Insights 2.0 & Stock Forecast** | Server-aggregated depletion forecast ("Depletes in ~N days"), Skia micro sparkline charts, revenue margin breakdown. | `typecheck`, `test`, `zero-client-reduce` |
| **L7** | **Customer Messages & Inquiry Thread** | Order-linked threaded conversations, canned seller responses, unread counter badge, optimistic message sending. | `typecheck`, `test`, `state-partition` |
| **L8** | **Signature Moments: Vault & Status Flip** | Vector check draw-on, gold seal receipt sheet, order status ripple & spring flip, haptic orchestration. | `typecheck`, `test`, `60fps-physics` |
| **L9** | **Storefront Preview & Slip Export** | In-app live buyer storefront perspective toggle, branded SVG/PDF packing slip & receipt exporter via native share sheet. | `typecheck`, `test`, `share-sheet` |
| **L10** | **Settings 2.0, Onboarding & DoD** | 3-panel onboarding with contextual permission priming, appearance switcher (system/light/dark + accent), audit re-score, `DEMO_V2.md`. | `audit>=4.0`, `all-tests-green`, `DoD` |
