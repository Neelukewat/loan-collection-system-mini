import api from './axios'

// Auth APIs
export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
}

// Dashboard APIs
export const dashboardAPI = {
  summary:    () => api.get('/dashboard'),
  prediction: () => api.get('/dashboard/prediction'),
}

// Loans APIs
export const loansAPI = {
  list:   (params) => api.get('/loans', { params }),
  get:    (id)     => api.get(`/loans/${id}`),
  create: (data)   => api.post('/loans', data),
  update: (id, data) => api.put(`/loans/${id}`, data),
  delete: (id)     => api.delete(`/loans/${id}`),
}

// Collections APIs
export const collectionsAPI = {
  list:   (params) => api.get('/collections', { params }),
  get:    (id)     => api.get(`/collections/${id}`),
  create: (data)   => api.post('/collections', data),
}