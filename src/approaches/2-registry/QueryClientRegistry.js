/**
 * QueryClientRegistry — Approach 2
 *
 * A central coordinator that holds named references to all QueryClients.
 * This is NOT a single global client — each service still has its own
 * isolated QueryClient with its own cache and config.
 */
class QueryClientRegistry {
  #clients = new Map()

  register(name, client) {
    this.#clients.set(name, client)
    console.log(`[Registry] Registered client: "${name}"`)
    return this
  }

  unregister(name) {
    this.#clients.delete(name)
  }

  get(name) {
    return this.#clients.get(name)
  }

  invalidate(serviceNames, filters = {}) {
    const promises = serviceNames.map((name) => {
      const client = this.#clients.get(name)
      if (!client) {
        console.warn(`[Registry] No client registered for "${name}"`)
        return Promise.resolve()
      }
      console.log(`[Registry] Invalidating "${name}"`, filters)
      return client.invalidateQueries(filters)
    })
    return Promise.all(promises)
  }

  resetClients(serviceNames) {
    serviceNames.forEach((name) => {
      const client = this.#clients.get(name)
      if (client) {
        client.clear()
        console.log(`[Registry] Cleared cache for "${name}"`)
      }
    })
  }

  invalidateAll(filters = {}) {
    return this.invalidate([...this.#clients.keys()], filters)
  }

  getRegisteredNames() {
    return [...this.#clients.keys()]
  }
}

export const registry = new QueryClientRegistry()
