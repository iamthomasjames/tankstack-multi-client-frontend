/**
 * EventBus — Approach 3
 * Lightweight pub/sub built on browser's native EventTarget API.
 */
const _target = new EventTarget()

const EventBus = {
  emit(eventName, detail) {
    console.log(`[EventBus] emit: ${eventName}`, detail)
    _target.dispatchEvent(new CustomEvent(eventName, { detail }))
  },

  on(eventName, handler) {
    const listener = (e) => handler(e.detail)
    _target.addEventListener(eventName, listener)
    return () => _target.removeEventListener(eventName, listener)
  },

  once(eventName, handler) {
    const unsub = this.on(eventName, (detail) => {
      handler(detail)
      unsub()
    })
    return unsub
  },

  off(eventName, handler) {
    _target.removeEventListener(eventName, handler)
  },
}

export { EventBus }

export const EVENTS = {
  ORDER_PLACED: 'order:placed',
  INVENTORY_UPDATED: 'inventory:updated',
  NOTIFICATION_CREATED: 'notifications:created',
}
