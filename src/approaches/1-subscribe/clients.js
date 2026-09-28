/**
 * Approach 1 – QueryCache.subscribe()
 *
 * Three completely independent QueryClients, one per service.
 * They share NO cache, NO config — total isolation.
 *
 * Cross-client invalidation is wired in setup.js using TanStack's
 * native MutationCache / QueryCache subscription API.
 */
import { QueryClient } from '@tanstack/react-query'

export const ordersClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export const inventoryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

export const notificationsClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

// Expose all clients on window so the TanStack Query Chrome extension can detect them.
// The extension reads window.__TANSTACK_QUERY_CLIENT__; we expose approach-1's
// ordersClient as the primary, plus all three under a namespaced key for inspection.
if (typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = ordersClient
  window.__TANSTACK_QUERY_CLIENTS_A1__ = { ordersClient, inventoryClient, notificationsClient }
}
