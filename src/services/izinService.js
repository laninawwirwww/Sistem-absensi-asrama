import apiClient from './apiClient';

const izinService = {
  /**
   * Penghuni: ajukan izin dengan file upload
   * @param {FormData} formData - { jenisIzin, tanggalMulai, tanggalSelesai, alasan, bukti (file) }
   */
  ajukanIzin: (formData) =>
    apiClient.post('/api/izin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Penghuni: lihat riwayat izin sendiri
   */
  getMyIzin: (params = {}) => apiClient.get('/api/izin/me', { params }),

  /**
   * Fasil: lihat semua pengajuan izin
   */
  getAllIzin: (params = {}) => apiClient.get('/api/izin', { params }),

  /**
   * Get detail izin by ID
   */
  getIzinById: (id) => apiClient.get(`/api/izin/${id}`),

  /**
   * Fasil: approve izin
   * @param {number} id
   */
  approveIzin: (id) => apiClient.put(`/api/izin/${id}/approve`),

  /**
   * Fasil: reject izin
   * @param {number} id
   * @param {string} alasanPenolakan
   */
  rejectIzin: (id, alasanPenolakan) =>
    apiClient.put(`/api/izin/${id}/reject`, { alasanPenolakan }),
};

export default izinService;
