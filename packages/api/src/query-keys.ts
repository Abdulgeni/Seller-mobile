export const queryKeys = {
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters?: { category?: string | undefined; search?: string | undefined; inStock?: boolean | undefined }) =>
      [...queryKeys.products.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: {
      status?: string | undefined;
      search?: string | undefined;
      startDate?: string | undefined;
      endDate?: string | undefined;
    }) => [...queryKeys.orders.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  payments: {
    all: ["payments"] as const,
    history: () => [...queryKeys.payments.all, "history"] as const,
    detail: (id: string) => [...queryKeys.payments.all, "detail", id] as const,
    byOrder: (orderId: string) => [...queryKeys.payments.all, "by-order", orderId] as const,
    payouts: () => [...queryKeys.payments.all, "payouts"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    kpis: (vendorId = "vdr_primary_store") => [...queryKeys.dashboard.all, "kpis", vendorId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unread-count"] as const,
  },
} as const;
