import apiClient from './apiClient';

const userService = {
  /* ---- PENGHUNI ---- */
  getAllPenghuni: (params = {}) => apiClient.get('/api/users/penghuni', { params }),
  getPenghuniById: (id) => apiClient.get(`/api/users/penghuni/${id}`),
  createPenghuni: (data) => apiClient.post('/api/users/penghuni', data),
  updatePenghuni: (id, data) => apiClient.put(`/api/users/penghuni/${id}`, data),
  deactivatePenghuni: (id) => apiClient.put(`/api/users/penghuni/${id}/deactivate`),

  /* ---- FASIL ---- */
  getAllFasil: (params = {}) => apiClient.get('/api/users/fasil', { params }),
  getFasilById: (id) => apiClient.get(`/api/users/fasil/${id}`),
  createFasil: (data) => apiClient.post('/api/users/fasil', data),
  updateFasil: (id, data) => apiClient.put(`/api/users/fasil/${id}`, data),
  deactivateFasil: (id) => apiClient.put(`/api/users/fasil/${id}/deactivate`),

  /* ---- Profile (current user) ---- */
  getProfile: () => apiClient.get('/api/users/profile'),
  updateProfile: (data) => apiClient.put('/api/users/profile', data),
  changePassword: (data) => apiClient.put('/api/users/profile/password', data),
};

export default userService;
