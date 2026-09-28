import React, { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Database, BookOpen, Code2, ShoppingCart, Package, Bell } from 'lucide-react'
import { ordersClient, inventoryClient, notificationsClient } from './clients'
import {
  useOrders, usePlaceOrder,
  useInventory,
  useNotifications, useMarkAllRead,
  useProducts,
  mockApi,
} from './hooks'
import { registry } from './QueryClientRegistry'
import {
  ServicePanel, OrderList, InventoryList,
  NotificationList, PlaceOrderForm,
} from '../../components/ServiceComponents'

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
      <p className="text-xs text-gray-500 mb-2">Stock updates automatically when orders are placed</p>
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
    { step: '1', text: 'All QueryClients are registered with the registry on module load.' },
    { step: '2', text: 'usePlaceOrder places the order via ordersClient mutation.' },
    { step: '3', text: "onSuccess calls registry.invalidate(['inventory', 'notifications'], {})." },
    { step: '4', text: 'Registry looks up each named client and calls invalidateQueries on it.' },
    { step: '5', text: 'Both panels re-fetch from their isolated services.' },
  ],
  pros: [
    'Named clients — clear intent at call-site (no magic keys)',
    'Centralised inventory of all clients in the app',
    'resetClients(["auth"]) for logout flows — clean and surgical',
    'Easy to audit which services are registered',
    'Fine-grained control: invalidate subset vs. invalidateAll()',
  ],
  cons: [
    'Registry is a singleton — needs careful handling in tests',
    'onSuccess in mutation has direct registry coupling',
    'Slightly more boilerplate than native subscribe',
  ],
  codeSnippet: `// QueryClientRegistry.js
class QueryClientRegistry {
  #clients = new Map()

  register(name, client) {
    this.#clients.set(name, client)
    return this // chainable
  }

  invalidate(serviceNames, filters = {}) {
    return Promise.all(
      serviceNames.map((name) =>
        this.#clients.get(name)
          ?.invalidateQueries(filters)
      )
    )
  }

  resetClients(names) { /* clear specific caches */ }
  invalidateAll(filters) { /* nuclear option */ }
}

export const registry = new QueryClientRegistry()

// clients.js — register at module load
registry
  .register('orders',        ordersClient)
  .register('inventory',     inventoryClient)
  .register('notifications', notificationsClient)

// hooks.js — use in mutation onSuccess
onSuccess: () => {
  registry.invalidate(
    ['inventory', 'notifications'], {}
  )
}`,
}

export default function Approach2Demo() {
  const [tab, setTab] = useState('how')
  const registered = registry.getRegisteredNames()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 p-5 bg-purple-950/30 border border-purple-800/40 rounded-xl">
        <div className="p-2.5 bg-purple-900/50 rounded-lg shrink-0">
          <Database size={20} className="text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-purple-300">Approach 2 — QueryClient Registry</h2>
            <span className="badge bg-purple-900/60 text-purple-400 border border-purple-700/50">Design Pattern</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            A central coordinator holds named references to all clients. Mutations call
            <code className="mx-1 px-1.5 py-0.5 bg-gray-800 rounded text-purple-300 text-xs font-mono">registry.invalidate()</code>
            with service names. Each client stays fully isolated.
            <strong className="text-purple-300"> Best for teams that need visibility into which services communicate.</strong>
          </p>
        </div>
      </div>

      {/* Registry status bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl">
        <span className="text-xs font-medium text-gray-500">Registered clients:</span>
        {registered.map((name) => (
          <span key={name} className="badge bg-purple-900/40 text-purple-300 border border-purple-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800">
            {[['how', 'How It Works'], ['pros', 'Pros & Cons'], ['code', 'Code']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
                  tab === id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'how' && (
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <BookOpen size={14} className="text-purple-400" /> Flow
              </h3>
              {DOC.howItWorks.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-xs font-bold text-purple-400">
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
                <Code2 size={13} className="text-purple-400" />
                <span className="text-xs font-mono text-gray-400">QueryClientRegistry.js + hooks.js</span>
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
                <span className="text-gray-600">.mutation.onSuccess ───▶</span>
                <span className="px-2 py-1 bg-purple-900/60 text-purple-300 rounded border border-purple-700">registry</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>└─ registry.get('inventory') ───▶</span>
                  <span className="px-2 py-1 bg-orange-900/40 text-orange-300 rounded border border-orange-800/50">inventoryClient</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>└─ registry.get('notifications') ▶</span>
                  <span className="px-2 py-1 bg-cyan-900/40 text-cyan-300 rounded border border-cyan-800/50">notifClient</span>
                </div>
              </div>
            </div>
          </div>
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
