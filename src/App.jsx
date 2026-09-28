import React, { Suspense, lazy, useState } from 'react'
import { Zap, Database, Radio, Home, ChevronRight } from 'lucide-react'
import HomePage from './pages/HomePage'

// Lazy load each demo to keep initial bundle small
const Approach1Demo = lazy(() => import('./approaches/1-subscribe/Demo'))
const Approach2Demo = lazy(() => import('./approaches/2-registry/Demo'))
const Approach3Demo = lazy(() => import('./approaches/3-eventbus/Demo'))

const TABS = [
  { id: 0,  label: 'Overview',        shortLabel: 'Overview',  icon: Home,     color: 'gray'    },
  { id: 1,  label: 'subscribe()',      shortLabel: 'Subscribe', icon: Zap,      color: 'blue'    },
  { id: 2,  label: 'Registry',         shortLabel: 'Registry',  icon: Database, color: 'purple'  },
  { id: 3,  label: 'Event Bus',        shortLabel: 'Event Bus', icon: Radio,    color: 'emerald' },
]

const activeStyles = {
  gray:    'border-b-2 border-gray-400 text-gray-200',
  blue:    'border-b-2 border-blue-500 text-blue-300',
  purple:  'border-b-2 border-purple-500 text-purple-300',
  emerald: 'border-b-2 border-emerald-500 text-emerald-300',
}

const inactiveStyle = 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'

function DemoSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-gray-900 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-gray-900 rounded-xl" />
        <div className="h-64 bg-gray-900 rounded-xl" />
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)

  const activeTabData = TABS.find((t) => t.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          {/* Brand row */}
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => setActiveTab(0)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold text-gray-100">TanStack Multi-Client</span>
                <span className="text-xs text-gray-500 ml-2">Cross-Client Invalidation Patterns</span>
              </div>
            </button>

            {/* Breadcrumb */}
            {activeTab > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-600">
                <button onClick={() => setActiveTab(0)} className="hover:text-gray-400 transition-colors">
                  Overview
                </button>
                <ChevronRight size={12} />
                <span className={
                  activeTab === 1 ? 'text-blue-400' :
                  activeTab === 2 ? 'text-purple-400' :
                  'text-emerald-400'
                }>
                  Approach {activeTab} — {activeTabData?.label}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 hidden sm:block">TanStack Query v5</span>
            </div>
          </div>

          {/* Tab Bar */}
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive ? activeStyles[tab.color] : inactiveStyle
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {tab.id > 0 && (
                    <span className={`hidden md:inline text-xs px-1.5 py-0.5 rounded-full font-normal ${ 
                      isActive
                        ? tab.color === 'blue'    ? 'bg-blue-900/60 text-blue-400'
                        : tab.color === 'purple'  ? 'bg-purple-900/60 text-purple-400'
                        : 'bg-emerald-900/60 text-emerald-400'
                        : 'bg-gray-800 text-gray-600'
                    }`}>
                      {tab.id === 1 ? 'Native' : tab.id === 2 ? 'Pattern' : 'Decoupled'}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 0 && (
          <HomePage onNavigate={setActiveTab} />
        )}

        {activeTab > 0 && (
          <Suspense fallback={<DemoSkeleton />}>
            {activeTab === 1 && <Approach1Demo />}
            {activeTab === 2 && <Approach2Demo />}
            {activeTab === 3 && <Approach3Demo />}
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 px-6 text-center">
        <p className="text-xs text-gray-600">
          TanStack Multi-Client Invalidation Patterns · Built with React 18 + TanStack Query v5
          · <span className="text-gray-500">All demos use isolated mock data</span>
        </p>
      </footer>
    </div>
  )
}
