const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('repairflow_token');
  const headers = new Headers(options.headers || {});

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body !== undefined && typeof options.body !== 'string' && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
    });
  } catch {
    throw new ApiError('Cannot connect to the RepairFlow server. Check that the backend is running.', 0);
  }

  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { data = raw; }
  }

  if (!response.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error || data.detail))
      || (typeof data === 'string' && data)
      || `Request failed with HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const authApi = {
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: credentials }),
  register: (details) => apiRequest('/api/auth/register', { method: 'POST', body: details }),
};

export const repairApi = {
  getMine: () => apiRequest('/api/repairs/my'),
  getById: (id) => apiRequest(`/api/repairs/${id}`),
  getHistory: (id) => apiRequest(`/api/repairs/${id}/history`),
  create: (details) => apiRequest('/api/repairs', { method: 'POST', body: details }),
  submitEstimate: (id, estimatedCost) => apiRequest(`/api/repairs/${id}/estimate`, {
    method: 'POST', body: { estimatedCost: Number(estimatedCost) },
  }),
  approveEstimate: (id, approved) => apiRequest(`/api/repairs/${id}/approval`, {
    method: 'POST', body: { approved },
  }),
  updateStatus: (id, status, remarks) => apiRequest(`/api/repairs/${id}/status`, {
    method: 'PUT', body: { status, remarks },
  }),
};

export const adminApi = {
  getTechnicians: () => apiRequest('/api/admin/technicians'),
  getUsers: () => apiRequest('/api/admin/users'),
  createStaff: (details) => apiRequest('/api/admin/users', { method: 'POST', body: details }),
  updateRole: (id, role) => apiRequest(`/api/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),
  deleteRepair: (id) => apiRequest(`/api/admin/repairs/${id}`, { method: 'DELETE' }),
  assignTechnician: (repairId, technicianId) => apiRequest(`/api/admin/repairs/${repairId}/technician`, {
    method: 'PUT', body: { technicianId: Number(technicianId) },
  }),
};
