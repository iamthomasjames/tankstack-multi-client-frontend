// Instead of returning in-memory mock state, we return a fetch wrapper
// that calls our new Vercel serverless backend.
const API_BASE_URL = 'https://tankstack-api.vercel.app/api';

export function createMockApi() {
  return {
    async getProducts() {
      // Products are effectively our inventory items in this demo
      const res = await fetch(`${API_BASE_URL}/inventory`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },

    async getOrders() {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },

    async placeOrder({ productId, quantity }) {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to place order');
      }
      return res.json();
    },

    async getInventory() {
      const res = await fetch(`${API_BASE_URL}/inventory`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },

    async getNotifications() {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },

    async markAllRead() {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to mark notifications read');
      return res.json();
    },
  };
}
