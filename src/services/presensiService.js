import apiClient from './apiClient';

const presensiService = {
  /**
   * Penghuni melakukan presensi
   * @param {object} data - { jenis: 'SUBUH'|'MALAM', latitude, longitude }
   */
  doPresensi: (data) => apiClient.post('/api/presensi', data),

  /**
   * Penghuni: ambil riwayat presensi sendiri
   * @param {object} params - { page, size, bulan, tahun, jenis }
   */
  getMyPresensi: (params = {}) => apiClient.get('/api/presensi/me', { params }),

  /**
   * Fasil/Admin: ambil semua data presensi
   * @param {object} params - { page, size, penghuniId, tanggal, jenis }
   */
  getAllPresensi: (params = {}) => apiClient.get('/api/presensi', { params }),

  /**
   * Fasil: edit presensi penghuni
   * @param {number} id
   * @param {object} data - { jenis, status, keterangan, alasanPerubahan }
   */
  updatePresensi: (id, data) => apiClient.put(`/api/presensi/${id}`, data),

  /**
   * Get presensi by id
   */
  getPresensiById: (id) => apiClient.get(`/api/presensi/${id}`),
};

export default presensiService;
