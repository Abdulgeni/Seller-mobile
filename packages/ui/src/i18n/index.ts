const en = {
  // Navigation & Tabs
  "nav.dashboard": "Dashboard",
  "nav.orders": "Orders",
  "nav.products": "Products",
  "nav.ops": "Ops & Settings",

  // Orders
  "orders.title": "Orders",
  "orders.searchPlaceholder": "Search by order # or customer...",
  "orders.empty": "No orders found",
  "orders.filterAll": "All",
  "orders.filterNew": "New",
  "orders.filterAccepted": "Accepted",
  "orders.filterPacked": "Packed",
  "orders.filterShipped": "Shipped",
  "orders.filterDelivered": "Delivered",
  "orders.filterCancelled": "Cancelled",
  "orders.accept": "Accept Order",
  "orders.pack": "Mark as Packed",
  "orders.ship": "Mark as Shipped",
  "orders.deliver": "Mark as Delivered",
  "orders.cancel": "Cancel Order",
  "orders.customer": "Customer",
  "orders.shippingAddress": "Shipping Address",
  "orders.timeline": "Order Timeline",
  "orders.total": "Total",

  // Products
  "products.title": "Products",
  "products.searchPlaceholder": "Search catalog...",
  "products.newProduct": "Add Product",
  "products.inStock": "In Stock",
  "products.outOfStock": "Out of Stock",
  "products.price": "Price",
  "products.variants": "Variants",
  "products.empty": "No products in catalogue",

  // Payments
  "payments.title": "Mobile Money",
  "payments.amount": "Amount",
  "payments.phone": "Customer Phone (M-Pesa)",
  "payments.sendStk": "Send STK Push",
  "payments.status.initiating": "Initiating STK push...",
  "payments.status.pending": "Waiting for customer PIN entry...",
  "payments.status.success": "Payment Successful!",
  "payments.status.failed": "Payment Failed",
  "payments.status.timeout": "Payment Timed Out",
  "payments.status.cancelled": "Payment Cancelled by User",
  "payments.receipt": "Payment Receipt",
  "payments.shareReceipt": "Share Receipt",

  // Dashboard
  "dashboard.title": "Seller Overview",
  "dashboard.revenueToday": "Revenue Today",
  "dashboard.ordersToday": "Orders Today",
  "dashboard.lowStock": "Low Stock Items",
  "dashboard.pendingPayouts": "Pending Payout",
  "dashboard.revenueTrend": "7-Day Revenue Trend",

  // Offline & Sync
  "sync.offlineBanner": "You are currently offline. Changes are saved locally.",
  "sync.pendingCount": "{count} pending sync actions",
  "sync.syncNow": "Sync Now",
  "sync.synced": "All changes synced",

  // Security
  "security.biometricPrompt": "Authenticate to access financial payouts",
  "security.unlock": "Unlock with Biometrics",
  "security.passcodeFallback": "Enter Passcode",

  // Common Actions
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Retry",
  "common.loading": "Loading...",
  "common.error": "An error occurred",
  "common.confirm": "Confirm",
} as const;

export type TranslationKey = keyof typeof en;

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let text: string = en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}
