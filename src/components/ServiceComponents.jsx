import React, { useState, useRef } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ShoppingCart, Package, Bell, RefreshCw, AlertCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react'

// ─── Shared ServicePanel wrapper ────────────────────────────────────────────

export function ServicePanel({ title, icon: Icon, color, children, isRefetching }) {
  const borderColor = {
    blue:   'border-blue-800/60',
    purple: 'border-purple-800/60',
    green:  'border-green-800/60',
    orange: 'border-orange-800/60',
    cyan:   'border-cyan-800/60',
  }[color] || 'border-gray-800'

  const headerColor = {
    blue:   'text-blue-400',
    purple: 'text-purple-400',
    green:  'text-green-400',
    orange: 'text-orange-400',
    cyan:   'text-cyan-400',
  }[color] || 'text-gray-400'

  return (
    <div className={`flex flex-col bg-gray-900/60 border ${borderColor} rounded-xl overflow-hidden transition-all duration-300`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-gray-900/80">
        <div className={`flex items-center gap-2 font-semibold text-sm ${headerColor}`}>
          <Icon size={15} />
          {title}
        </div>
        {isRefetching && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw size={11} className="animate-spin text-emerald-500" />
            <span className="text-emerald-500 font-medium">Refreshing...</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {children}
      </div>
    </div>
  )
}

// ─── Order list ──────────────────────────────────────────────────────────────

export function OrderList({ orders, isLoading, isRefetching }) {
  if (isLoading) return <LoadingRows count={3} />
  if (!orders?.length) return <EmptyState message="No orders yet — place your first order!" />

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2.5 border border-gray-700/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">#{o.id}</span>
              <span className="text-sm font-medium text-gray-200 truncate">{o.productName}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{o.quantity}× @${o.unitPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{new Date(o.placedAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3">
            <span className="text-sm font-bold text-emerald-400">${o.totalPrice.toLocaleString()}</span>
            <span className="badge bg-emerald-900/50 text-emerald-400 border border-emerald-800/50">
              <CheckCircle size={9} /> {o.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Inventory list ──────────────────────────────────────────────────────────

export function InventoryList({ inventory, isLoading }) {
  if (isLoading) return <LoadingRows count={4} />
  if (!inventory?.length) return <EmptyState message="No inventory data" />

  return (
    <div className="space-y-2">
      {inventory.map((p) => {
        const stockPct = Math.min(100, (p.stock / 50) * 100)
        const stockColor =
          p.stock === 0 ? 'bg-red-500' :
          p.stock <= 5  ? 'bg-orange-500' :
          p.stock <= 15 ? 'bg-yellow-500' :
                          'bg-emerald-500'
        const textColor =
          p.stock === 0 ? 'text-red-400' :
          p.stock <= 5  ? 'text-orange-400' :
          p.stock <= 15 ? 'text-yellow-400' :
                          'text-emerald-400'

        return (
          <div key={p.id} className="bg-gray-800/50 rounded-lg px-3 py-2.5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium text-gray-200">{p.name}</span>
                <span className="ml-2 text-xs text-gray-500 font-mono">{p.sku}</span>
              </div>
              <span className={`text-sm font-bold ${textColor}`}>
                {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
              </span>
            </div>
            <div className="w-full bg-gray-700/60 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${stockColor}`}
                style={{ width: `${stockPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Notification list ───────────────────────────────────────────────────────

export function NotificationList({ notifications, isLoading, onMarkAllRead, isMarking }) {
  if (isLoading) return <LoadingRows count={2} />

  const unread = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="space-y-2">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onMarkAllRead}
            disabled={isMarking}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      )}
      {!notifications?.length ? (
        <EmptyState message="No notifications yet" />
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 border transition-all duration-300 ${
              n.read
                ? 'bg-gray-800/30 border-gray-700/30'
                : 'bg-blue-950/40 border-blue-800/50'
            }`}
          >
            <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${n.read ? 'bg-gray-600' : 'bg-blue-400'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${n.read ? 'text-gray-400' : 'text-blue-300'}`}>
                  {n.title}
                </span>
                <span className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Place Order Form ────────────────────────────────────────────────────────

export function PlaceOrderForm({ products, onPlaceOrder, isPending, error, isSuccess }) {
  const [productId, setProductId] = useState(1)
  const [quantity, setQuantity]   = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    onPlaceOrder({ productId: Number(productId), quantity: Number(quantity) })
  }

  const selectedProduct = products?.find((p) => p.id === Number(productId))

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Product</label>
        <div className="relative">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 appearance-none focus:outline-none focus:border-blue-600 cursor-pointer pr-8"
          >
            {products?.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Quantity</label>
        <input
          type="number"
          min={1}
          max={selectedProduct?.stock || 1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-600"
        />
      </div>

      {selectedProduct && (
        <div className="bg-gray-800/60 rounded-lg px-3 py-2 text-xs text-gray-400 flex justify-between">
          <span>Estimated Total</span>
          <span className="font-bold text-emerald-400">
            ${(selectedProduct.price * quantity).toLocaleString()}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 rounded-lg px-3 py-2 border border-red-800/40">
          <AlertCircle size={13} />
          {error.message}
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-900/20 rounded-lg px-3 py-2 border border-emerald-800/40">
          <CheckCircle size={13} />
          Order placed! Inventory &amp; Notifications updated via cross-client invalidation.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !selectedProduct || selectedProduct.stock === 0}
        className="w-full btn bg-blue-600 hover:bg-blue-500 text-white justify-center"
      >
        {isPending ? (
          <><RefreshCw size={13} className="animate-spin" /> Placing Order...</>
        ) : (
          <><ShoppingCart size={13} /> Place Order</>
        )}
      </button>
    </form>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function LoadingRows({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-800/50 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-600">
      <Clock size={24} className="mb-2 opacity-40" />
      <p className="text-xs text-center">{message}</p>
    </div>
  )
}
