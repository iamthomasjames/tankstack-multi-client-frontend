import React, { useState, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Radio, BookOpen, Code2, ShoppingCart, Package, Bell } from 'lucide-react'
import { ordersClient, inventoryClient, notificationsClient } from './clients'
import { initEventBusListeners } from './setup'
import { EventBus, EVENTS } from './EventBus'
import {
  useOrders, usePlaceOrder,
  useInventory,
  useNotifications, useMarkAllRead,
  useProducts,
  mockApi,
} from './hooks'
import {
  ServicePanel, OrderList, InventoryList,
  NotificationList, PlaceOrderForm,
} from '../../components/ServiceComponents'

initEventBusListeners()

function OrdersPanel() {
  const { data: orders, isLoading, isRefetching } = useOrders()
  const { mutate, isPending, error, isSuccess } = usePlaceOrder()
  const { data: products = [] } = useProducts()
  return (
    <ServicePanel title="Orders Service" icon={ShoppingCart} color="blue" isRefetching={isRefetching}>
      <PlaceOrderForm products={products} onPlaceOrder={mutate} isPending={isPending} error={error} isSuccess={isSuccess} />
      <div className="border-t border-gray-800 my-2" />
      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Recent Orders</p>
      <OrderList orders={orders} isLoading={isLoading} isRefetching={isRefetching} />
    </ServicePanel>
  )
}

function InventoryPanel() {
  const { data: inventory, isLoading, isRefetching } = useInventory()
  return (
    <ServicePanel title="Inventory Service" icon={Package} color="orange" isRefetching={isRefetching}>
      <p className="text-xs text-gray-500 mb-2">Listens for 'order:placed' events via EventBus</p>
      <InventoryList inventory={inventory} isLoading={isLoading} />
    </ServicePanel>
  )
}

function NotificationsPanel() {
  const { data: notifications, isLoading, isRefetching } = useNotifications()
  const { mutate: markAllRead, isPending: isMarking } = useMarkAllRead()
  return (
    <ServicePanel title="Notifications Service" icon={Bell} color="cyan" isRefetching={isRefetching}>
      <NotificationList notifications={notifications} isLoading={isLoading} onMarkAllRead={markAllRead} isMarking={isMarking} />
    </ServicePanel>
  )
}

const DOC = {
  howItWorks: [
    { step: '1', text: 'EventBus listeners are initialised once (setup.js) when the demo mounts.' },
    { step: '2', text: 'usePlaceOrder mutation places the order via ordersClient.' },
    { step: '3', text: "onSuccess calls EventBus.emit('order:placed', order) — no client refs needed." },
    { step: '4', text: "setup.js EventBus.on('order:placed') fires and calls invalidateQueries on both clients." },
    { step: '5', text: 'Both panels refetch. The mutation knows nothing about the other clients.' },
  ],
  pros: [
    'Maximum decoupling — mutations emit events, not client calls',
    'Any module can listen (analytics, logging, other clients)',
    'Easy fan-out: one event triggers N listeners',
    'Clean domain language: order:placed vs. raw TanStack APIs',
    'Works across micro-frontends, iframes, workers with minor adaptation',
  ],
  cons: [
    'Indirect flow — harder to trace than explicit calls',
    'Event naming discipline required across large teams',
    'Listeners must be cleaned up to avoid memory leaks',
    'Extra abstraction layer vs. native subscribe',
  ],
  codeSnippet: `// EventBus.js
const _target = new EventTarget()

export const EventBus = {
  emit: (name, detail) =>
    _target.dispatchEvent(new CustomEvent(name, { detail })),
  on: (name, handler) => {
    const fn = (e) => handler(e.detail)
    _target.addEventListener(name, fn)
    return () => _target.removeEventListener(name, fn)
  },
}

// setup.js — wired once at app init
EventBus.on('order:placed', () => {
  inventoryClient.invalidateQueries({ queryKey: ['inventory'] })
  notificationsClient.invalidateQueries({ queryKey: ['notifications'] })
})

// hooks.js — mutation only emits, doesn't know clients
onSuccess: (order) => {
  queryClient.invalidateQueries({ queryKey: ['orders'] })
  EventBus.emit('order:placed', order)
}`,
}

function EventLog() {
  const [log, setLog] = useState([])

  useEffect(() => {
    const unsub = EventBus.on(EVENTS.ORDER_PLACED, (order) => {
      setLog((prev) => [
        { id: Date.now(), event: EVENTS.ORDER_PLACED, payload: `Order #${order?.id}`, ts: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ])
    })
    return unsub
  }, [])

  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Event Log</p>
      {!log.length ? (
        <p className="text-xs text-gray-600 text-center py-4">Place an order to see events fire...</p>
      ) : (
        <div className="space-y-1.5">
          {log.map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-600">{l.ts}</span>
              <span className="px-1.5 py-0.5 bg-green-900/40 text-green-400 rounded border border-green-800/50">{l.event}</span>
              <span className="text-gray-400">{l.payload}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Approach3Demo() {
  const [tab, setTab] = useState('how')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 p-5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
        <div className="p-2.5 bg-emerald-900/50 rounded-lg shrink-0">
          <Radio size={20} className="text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-emerald-300">Approach 3 — Event Bus</h2>
            <span className="badge bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">Maximum Decoupling</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Mutations emit domain events. A separate setup module listens and triggers cross-client
            invalidation. The mutation code has zero knowledge of other clients.
            <strong className="text-emerald-300"> Best for large teams, many services, or fan-out scenarios.</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800">
            {[['how', 'How It Works'], ['pros', 'Pros & Cons'], ['code', 'Code']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
                  tab === id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'how' && (
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-400" /> Flow
              </h3>
              {DOC.howItWorks.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {s.step}
                  </span>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'pros' && (
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ Pros</h3>
                <ul className="space-y-1.5">
                  {DOC.pros.map((p, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ Cons</h3>
                <ul className="space-y-1.5">
                  {DOC.cons.map((c, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'code' && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
                <Code2 size={13} className="text-emerald-400" />
                <span className="text-xs font-mono text-gray-400">EventBus.js + setup.js + hooks.js</span>
              </div>
              <pre className="p-4 text-xs font-mono text-gray-300 overflow-auto leading-relaxed whitespace-pre-wrap">
                {DOC.codeSnippet}
              </pre>
            </div>
          )}

          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Architecture</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-800/60">ordersClient</span>
                <span className="text-gray-600">─── emit('order:placed') ───▶</span>
                <span className="px-2 py-1 bg-emerald-900/60 text-emerald-300 rounded border border-emerald-700">EventBus</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>└─ on('order:placed') ───▶</span>
                  <span className="px-2 py-1 bg-orange-900/40 text-orange-300 rounded border border-orange-800/50">inventoryClient</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>└─ on('order:placed') ───▶</span>
                  <span className="px-2 py-1 bg-cyan-900/40 text-cyan-300 rounded border border-cyan-800/50">notifClient</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>└─ on('order:placed') ───▶</span>
                  <span className="px-2 py-1 bg-yellow-900/40 text-yellow-300 rounded border border-yellow-800/50">analytics...</span>
                </div>
              </div>
            </div>
          </div>

          <EventLog />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Demo</span>
          </div>

          <QueryClientProvider client={ordersClient}>
            <OrdersPanel />
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" position="left" />
          </QueryClientProvider>

          <QueryClientProvider client={inventoryClient}>
            <InventoryPanel />
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" position="right" />
          </QueryClientProvider>

          <QueryClientProvider client={notificationsClient}>
            <NotificationsPanel />
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" position="top" />
          </QueryClientProvider>
        </div>
      </div>
    </div>
  )
}
