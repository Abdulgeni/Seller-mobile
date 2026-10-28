# Setup & Credentials Runbook

## 1. Prerequisites
- **Node.js**: v20+ (Verified v22.16.0)
- **pnpm**: v9+ (Verified v12.15.0 via npm global / AppData\Roaming\npm)
- **JDK**: Java 17+ (Verified Java 22.0.1)
- **Android SDK**: API 34+ build-tools, platform-tools, emulator (Verified `Medium_Phone_API_37.0` running)
- **Turborepo**: Monorepo orchestration

## 2. Monorepo Configuration
The repository is managed with `pnpm` workspaces:
```bash
# Monorepo root
pnpm install
```
`.npmrc` is configured with `node-linker=hoisted` to ensure React Native's Metro bundler resolves dependencies from a hoisted `node_modules` without symlink breakages.

## 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default environment variables:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_MOCK_NETWORK=true
EXPO_PUBLIC_MOCK_FAILURE_RATE=0.0
EXPO_PUBLIC_STORAGE_MODE=mock
```

## 4. Swapping Mocks to Real Infrastructure

### Push Notifications (FCM)
Currently, push notifications are handled via `expo-notifications` with a dev-mode notification simulator harness that simulates incoming orders and action buttons (`ACCEPT_ORDER`, `VIEW_ORDER`).
To swap to production FCM:
1. Create a Firebase project in Firebase Console.
2. Download `google-services.json` and place it in `apps/mobile/google-services.json`.
3. In `apps/mobile/app.json`, add:
   ```json
   "plugins": [
     [
       "expo-notifications",
       {
         "icon": "./assets/notification-icon.png",
         "color": "#16a34a"
       }
     ]
   ],
   "android": {
     "googleServicesFile": "./google-services.json"
   }
   ```
4. Update `apps/mobile/src/features/notifications/service.ts` to register real Expo Push Token / FCM token with your backend.

### Photo Storage
Currently, photo uploads use a mocked Supabase-compatible storage provider that stores blobs in local cache/memory.
To swap to live storage (Supabase / AWS S3):
1. In `.env`, set:
   ```env
   EXPO_PUBLIC_STORAGE_MODE=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
   EXPO_PUBLIC_STORAGE_BUCKET=product-photos
   ```
2. The storage adapter in `packages/api/src/storage/index.ts` automatically switches implementation based on `EXPO_PUBLIC_STORAGE_MODE`.

### Mobile-Money Payment Gateway (M-Pesa)
Currently, payments use an East African M-Pesa STK push state machine simulator with injectable failure modes (insufficient funds, user cancelled, timeout).
To swap to live Safaricom Daraja API:
1. Provide Daraja consumer key, secret, passkey, and shortcode in `.env`.
2. Swap the transport adapter in `packages/api/src/payments/daraja.ts`.
