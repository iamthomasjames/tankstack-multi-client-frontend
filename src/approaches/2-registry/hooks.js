import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from './api'
import { registry } from './QueryClientRegistry'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: mockApi.getOrders.bind(mockApi),
  })
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: mockApi.getProducts.bind(mockApi),
  })
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: mockApi.placeOrder.bind(mockApi),
    onSuccess: () => {
      console.log('[Approach 2] Order placed -> registry.invalidate')
      registry.get('orders')?.invalidateQueries({ queryKey: ['orders'] })
      registry.invalidate(['inventory', 'notifications'], {})
    },
  })
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory.bind(mockApi),
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: mockApi.getNotifications.bind(mockApi),
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mockApi.markAllRead.bind(mockApi),
    onSuccess: (data) => {
      queryClient.setQueryData(['notifications'], data)
    },
  })
}

export { mockApi }
