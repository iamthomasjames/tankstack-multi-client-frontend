import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// ── Expose a QueryClient for the TanStack Query Chrome DevTools extension ──
// The extension reads window.__TANSTACK_QUERY_CLIENT__ at page load.
// Approach-specific clients will override this when their tab is visited.
// In the browser console you can also inspect all clients per approach:
//   window.__TANSTACK_QUERY_CLIENTS_A1__  (subscribe approach)
//   window.__TANSTACK_QUERY_CLIENTS_A2__  (registry approach)
//   window.__TANSTACK_QUERY_CLIENTS_A3__  (event bus approach)
const _rootClient = new QueryClient()
window.__TANSTACK_QUERY_CLIENT__ = _rootClient

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
