import { QueryClient } from '@tanstack/react-query'
import { registry } from './QueryClientRegistry'

export const ordersClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, gcTime: 5 * 60 * 1000, retry: 1 } },
})

export const inventoryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000, retry: 2 } },
})

export const notificationsClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, gcTime: 5 * 60 * 1000, retry: 1 } },
})

registry
  .register('orders', ordersClient)
  .register('inventory', inventoryClient)
  .register('notifications', notificationsClient)

// Expose for TanStack Query Chrome DevTools extension
if (typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = ordersClient
  window.__TANSTACK_QUERY_CLIENTS_A2__ = { ordersClient, inventoryClient, notificationsClient }
}
