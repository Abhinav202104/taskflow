const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/tasks';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ error: 'Invalid response from server' }));

  if (!res.ok) {
    const message = data.errors?.join(', ') || data.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
    ).toString();
    return request(`${BASE}${qs ? `?${qs}` : ''}`);
  },

  createTask: (data) => request(BASE, { method: 'POST', body: data }),

  updateTask: (id, data) => request(`${BASE}/${id}`, { method: 'PATCH', body: data }),

  deleteTask: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),

  reorderTasks: (order) =>
    request(`${BASE}/bulk/reorder`, { method: 'PATCH', body: { order } }),
};
