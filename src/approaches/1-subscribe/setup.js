/**
 * Approach 1 – QueryCache.subscribe()
 *
 * This is the CORE of Approach 1. We subscribe to the ordersClient's
 * MutationCache. Whenever a mutation settles as 'success', we
 * programmatically call invalidateQueries on the other two clients.
 *
 * Call initSubscriptions() once when the app mounts.
 */
import { ordersClient, inventoryClient, notificationsClient } from './clients'

let initialized = false

export function initSubscriptions() {
  if (initialized) return
  initialized = true

  const unsubOrders = ordersClient.getMutationCache().subscribe((event) => {
    if (event.type !== 'updated') return
    if (event.mutation?.state.status !== 'success') return

    const mutationKey = event.mutation.options.mutationKey
    if (!mutationKey || !mutationKey.includes('placeOrder')) return

    console.log('[Approach 1] ordersClient mutation success → cross-invalidating clients')

    inventoryClient.invalidateQueries({ queryKey: ['inventory'] })
    notificationsClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  return () => {
    unsubOrders()
    initialized = false
  }
}
