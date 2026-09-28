import React, { useEffect, useRef, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Zap, BookOpen, Code2, ShoppingCart, Package, Bell } from 'lucide-react'
import { ordersClient, inventoryClient, notificationsClient } from './clients'
import { initSubscriptions } from './setup'
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

// Initialise subscriptions once
initSubscriptions()

// ─── Panels (each inside its own QueryClientProvider) ────────────────────────

function OrdersPanel() {
  const { data: orders, isLoading, isRefetching } = useOrders()
  const { mutate, isPending, error, isSuccess, reset } = usePlaceOrder()
  const { data: products = [] } = useProducts()

  return (
    <ServicePanel title="Orders Service" icon={ShoppingCart} color="blue" isRefetching={isRefetching}>
      <PlaceOrderForm
        products={products}
        onPlaceOrder={mutate}
        isPending={isPending}
        error={error}
        isSuccess={isSuccess}
      />
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
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkAllRead={markAllRead}
        isMarking={isMarking}
      />
    </ServicePanel>
  )
}

// ─── Doc content ─────────────────────────────────────────────────────────────

const DOC = {
  howItWorks: [
    { step: '1', text: 'ordersClient places a mutation (placeOrder).' },
    { step: '2', text: "TanStack's MutationCache emits an 'updated' event when status → 'success'." },
    { step: '3', text: "setup.js subscriber checks mutationKey === 'placeOrder'." },
    { step: '4', text: 'Calls inventoryClient.invalidateQueries() and notificationsClient.invalidateQueries().' },
    { step: '5', text: 'Both panels re-fetch from their services automatically.' },
  ],
  pros: [
    'Native TanStack API — zero extra dependencies',
    'Wired once at module load — no component coupling',
    'Fine-grained: react only to specific mutation keys',
    'Fully typed with TypeScript generics',
  ],
  cons: [
    'Subscribing client must import other client references',
    'Harder to fan-out to many clients (use Event Bus then)',
    'Subscription must be cleaned up in tests / hot-reload',
  ],
  codeSnippet: `// setup.js — wire once at app init
const unsub = ordersClient
  .getMutationCache()
  .subscribe((event) => {
    if (event.type !== 'updated') return
    if (event.mutation?.state.status !== 'success') return
    if (!event.mutation.options.mutationKey?.includes('placeOrder')) return

    // Cross-invalidate isolated clients
    inventoryClient.invalidateQueries({ queryKey: ['inventory'] })
    notificationsClient.invalidateQueries({ queryKey: ['notifications'] })
  })`,
}

// ─── Main Demo ───────────────────────────────────────────────────────────────

export default function Approach1Demo() {
  const [tab, setTab] = useState('how')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 bg-blue-950/30 border border-blue-800/40 rounded-xl">
        <div className="p-2.5 bg-blue-900/50 rounded-lg shrink-0">
          <Zap size={20} className="text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-blue-300">Approach 1 — QueryCache.subscribe()</h2>
            <span className="badge bg-blue-900/60 text-blue-400 border border-blue-700/50">Native TanStack</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Subscribe to a client's MutationCache using TanStack Query's own event system.
            When a mutation succeeds, programmatically invalidate other isolated clients.
            <strong className="text-blue-300"> Zero extra dependencies. Best for tightly-coupled service pairs.</strong>
          </p>
        </div>
      </div>

      {/* Body: docs + demo side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Documentation panel */}
        <div className="flex flex-col gap-4">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800">
            {[['how', 'How It Works'], ['pros', 'Pros & Cons'], ['code', 'Code']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
                  tab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'how' && (
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" /> Flow
              </h3>
              {DOC.howItWorks.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-xs font-bold text-blue-400">
                    {s.step}
                  </span>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-blue-400 font-semibold">Key insight:</span> The subscription lives outside React's
                  component tree — it's purely client-to-client wiring. Components stay clean.
                </p>
              </div>
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
                <Code2 size={13} className="text-blue-400" />
                <span className="text-xs font-mono text-gray-400">setup.js</span>
              </div>
              <pre className="p-4 text-xs font-mono text-gray-300 overflow-auto leading-relaxed whitespace-pre-wrap">
                {DOC.codeSnippet}
              </pre>
            </div>
          )}

          {/* Architecture diagram */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Architecture</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-800/60">ordersClient</span>
                <span className="text-gray-600">─── MutationCache.subscribe() ───▶</span>
                <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded border border-gray-700">setup.js</span>
              </div>
              <div className="ml-4 flex items-center gap-2 text-gray-600">
                <span className="text-gray-600">└─── invalidate() ───▶</span>
                <span className="px-2 py-1 bg-orange-900/40 text-orange-300 rounded border border-orange-800/50">inventoryClient</span>
              </div>
              <div className="ml-4 flex items-center gap-2 text-gray-600">
                <span className="text-gray-600">└─── invalidate() ───▶</span>
                <span className="px-2 py-1 bg-cyan-900/40 text-cyan-300 rounded border border-cyan-800/50">notificationsClient</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Demo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Demo</span>
          </div>

          <QueryClientProvider client={ordersClient}>
            <OrdersPanel />
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
              position="left"
            />
          </QueryClientProvider>

          <QueryClientProvider client={inventoryClient}>
            <InventoryPanel />
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-right"
              position="right"
            />
          </QueryClientProvider>

          <QueryClientProvider client={notificationsClient}>
            <NotificationsPanel />
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="top-right"
              position="top"
            />
          </QueryClientProvider>
        </div>
      </div>
    </div>
  )
}
