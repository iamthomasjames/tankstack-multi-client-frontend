import React, { useState } from 'react'
import { Zap, Database, Radio, ArrowRight, Github, ExternalLink } from 'lucide-react'

const APPROACHES = [
  {
    id: 1,
    label: 'QueryCache.subscribe()',
    shortLabel: 'Subscribe',
    icon: Zap,
    color: 'blue',
    badge: 'Native TanStack',
    description: 'Use TanStack\'s own MutationCache.subscribe() to react to mutations and cross-invalidate other clients.',
    when: 'Tightly coupled service pairs, internal apps',
    complexity: 'Low',
  },
  {
    id: 2,
    label: 'QueryClient Registry',
    shortLabel: 'Registry',
    icon: Database,
    color: 'purple',
    badge: 'Design Pattern',
    description: 'A central coordinator holds named references to all clients. Mutations call registry.invalidate() with service names.',
    when: 'Teams needing clear service visibility & audit trail',
    complexity: 'Medium',
  },
  {
    id: 3,
    label: 'Event Bus',
    shortLabel: 'Event Bus',
    icon: Radio,
    color: 'emerald',
    badge: 'Max Decoupling',
    description: 'Mutations emit domain events. Setup listeners bridge events to client invalidations. Mutations know nothing about other clients.',
    when: 'Large teams, many services, fan-out scenarios',
    complexity: 'Medium',
  },
]

const colorMap = {
  blue:    { bg: 'bg-blue-950/30',   border: 'border-blue-800/40',  icon: 'bg-blue-900/50',   text: 'text-blue-400',   badge: 'bg-blue-900/60 text-blue-400 border-blue-700/50',   active: 'border-blue-500 bg-blue-950/40' },
  purple:  { bg: 'bg-purple-950/30', border: 'border-purple-800/40', icon: 'bg-purple-900/50', text: 'text-purple-400', badge: 'bg-purple-900/60 text-purple-400 border-purple-700/50', active: 'border-purple-500 bg-purple-950/40' },
  emerald: { bg: 'bg-emerald-950/30', border: 'border-emerald-800/40', icon: 'bg-emerald-900/50', text: 'text-emerald-400', badge: 'bg-emerald-900/60 text-emerald-400 border-emerald-700/50', active: 'border-emerald-500 bg-emerald-950/40' },
}

export default function HomePage({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Production-ready patterns · TanStack Query v5 · React 18
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Cross-Client Cache Invalidation
          <br />
          <span className="text-gradient-blue">in TanStack Query</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          When your React app uses <strong className="text-gray-200">multiple isolated QueryClients</strong> for security or
          service separation, how do you keep caches in sync when data changes?
          <br />
          <span className="text-gray-300">Here are three production-ready approaches.</span>
        </p>
      </div>

      {/* Problem Statement */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-200 mb-3">🏗️ The Real-World Problem</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          An e-commerce platform uses <strong className="text-gray-200">three separate QueryClients</strong> for security reasons —
          the Orders, Inventory, and Notifications services each have their own isolated cache.
          When a customer places an order, the server atomically updates all three. But on the client,
          <strong className="text-gray-200"> only the Orders client knows it placed a mutation</strong>.
          Inventory and Notifications are stale until the user refreshes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { emoji: '🛒', title: 'Orders Service', desc: 'Places the order — decrements stock server-side', color: 'blue' },
            { emoji: '📦', title: 'Inventory Service', desc: 'Stock levels changed but client cache is stale', color: 'orange' },
            { emoji: '🔔', title: 'Notifications Service', desc: 'New confirmation created but client doesn\'t know', color: 'cyan' },
          ].map((s) => (
            <div key={s.title} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="text-xl mb-2">{s.emoji}</div>
              <div className="text-sm font-semibold text-gray-200 mb-1">{s.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-lg px-4 py-2.5">
          <span>⚡</span>
          <span>The solution: cross-client invalidation — tell other clients to refetch without merging them.</span>
        </div>
      </div>

      {/* Approach Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Three Approaches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {APPROACHES.map((a) => {
            const Icon = a.icon
            const c = colorMap[a.color]
            return (
              <button
                key={a.id}
                onClick={() => onNavigate(a.id)}
                className={`text-left flex flex-col gap-3 p-5 border ${c.border} ${c.bg} rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-xl group`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 ${c.icon} rounded-lg`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <span className={`badge border ${c.badge}`}>{a.badge}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${c.text} mb-1`}>
                    Approach {a.id} — {a.shortLabel}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-600">Best for: </span>
                    <span className="text-xs text-gray-400">{a.when}</span>
                  </div>
                  <ArrowRight size={14} className={`${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Criterion</th>
                <th className="text-center py-3 px-4 text-blue-400 font-medium">Subscribe</th>
                <th className="text-center py-3 px-4 text-purple-400 font-medium">Registry</th>
                <th className="text-center py-3 px-4 text-emerald-400 font-medium">Event Bus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {[
                ['Cache Isolation', '✅', '✅', '✅'],
                ['TanStack-Native', '✅', '❌ custom', '❌ custom'],
                ['Mutation Coupling', 'Low', 'Medium', 'None'],
                ['Fan-out (1→N)', 'Manual', 'Easy', 'Native'],
                ['Audit / Visibility', 'Low', '✅ named clients', 'Event log'],
                ['Testability', 'Good', 'Mock registry', 'Mock bus'],
                ['Setup Complexity', '⭐ Low', '⭐⭐ Med', '⭐⭐ Med'],
                ['Logout / Reset', 'Per-client clear', 'registry.resetClients()', 'Emit event'],
              ].map(([criterion, s, r, e]) => (
                <tr key={criterion} className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-2.5 px-4 text-gray-400">{criterion}</td>
                  <td className="py-2.5 px-4 text-center text-gray-300">{s}</td>
                  <td className="py-2.5 px-4 text-center text-gray-300">{r}</td>
                  <td className="py-2.5 px-4 text-center text-gray-300">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision guide */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-200">🤔 Which should you use?</h2>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            <span className="text-blue-400 font-semibold">→ Approach 1 (Subscribe)</span> if you have a small number of service pairs and want to stay 100% in TanStack Query's API.
          </p>
          <p className="text-gray-400">
            <span className="text-purple-400 font-semibold">→ Approach 2 (Registry)</span> if your team needs to audit which services communicate, or you need surgical cache resets (e.g. logout clears only auth + user, not product cache).
          </p>
          <p className="text-gray-400">
            <span className="text-emerald-400 font-semibold">→ Approach 3 (Event Bus)</span> if mutations should be completely ignorant of other services, or you have many downstream effects from one action (analytics, logging, N clients).
          </p>
          <p className="text-gray-500 text-xs mt-3">
            💡 You can combine approaches — e.g. Registry for client management + Event Bus for domain events.
          </p>
        </div>
      </div>
    </div>
  )
}
