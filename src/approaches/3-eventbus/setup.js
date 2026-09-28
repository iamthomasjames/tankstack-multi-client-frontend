import { EventBus, EVENTS } from './EventBus'
import { inventoryClient, notificationsClient } from './clients'

let cleanup = null

export function initEventBusListeners() {
  if (cleanup) return

  const unsubOrderPlaced = EventBus.on(EVENTS.ORDER_PLACED, () => {
    console.log('[EventBus] order:placed -> invalidating inventory + notifications')
    inventoryClient.invalidateQueries({ queryKey: ['inventory'] })
    notificationsClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const unsubInventory = EventBus.on(EVENTS.INVENTORY_UPDATED, ({ productId }) => {
    console.log(`[EventBus] inventory:updated (productId=${productId})`)
    inventoryClient.invalidateQueries({ queryKey: ['inventory'] })
  })

  cleanup = () => {
    unsubOrderPlaced()
    unsubInventory()
    cleanup = null
  }

  return cleanup
}

export function cleanupEventBusListeners() {
  cleanup?.()
}
