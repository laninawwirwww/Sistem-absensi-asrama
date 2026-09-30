/**
 * izinService.js — Dummy-mode override
 * Semua operasi menggunakan DummyDataContext, bukan API call nyata.
 * Signature tetap sama (mengembalikan Promise) agar komponen tidak perlu diubah.
 */

let _ctx = null;
let _user = null;

export function setIzinServiceContext(ctx, user) {
  _ctx = ctx;
  _user = user;
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

const izinService = {
  ajukanIzin: async (formData) => {
    await delay();
    if (!_ctx || !_user) throw new Error('Service tidak terhubung ke context');
    
    // formData bisa berupa FormData object — ekstrak fieldnya
    let data = {};
    if (formData instanceof FormData) {
      data.jenisIzin = formData.get('jenisIzin');
      data.tanggalMulai = formData.get('tanggalMulai');
      data.tanggalSelesai = formData.get('tanggalSelesai');
      data.alasan = formData.get('alasan');
      // Untuk preview file
      const file = formData.get('bukti');
      if (file && file instanceof File) {
        data.buktiPreviewUrl = URL.createObjectURL(file);
      }
    } else {
      data = formData;
    }

    const result = _ctx.ajukanIzin(_user.id, _user.name || _user.username, data);
    return { data: result };
  },

  getMyIzin: async (params = {}) => {
    await delay(300);
    if (!_ctx || !_user) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getMyIzin(_user.id, params);
    return { data: result };
  },

  getAllIzin: async (params = {}) => {
    await delay(300);
    if (!_ctx) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getAllIzin(params);
    return { data: result };
  },

  getIzinById: async (id) => {
    await delay(200);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const found = _ctx.izin.find((iz) => iz.id === id || iz.id === parseInt(id));
    if (!found) throw new Error('Izin tidak ditemukan');
    return { data: found };
  },

  approveIzin: async (id) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.approveIzin(id);
    return { data: { message: 'Izin berhasil disetujui' } };
  },

  rejectIzin: async (id, alasanPenolakan) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.rejectIzin(id, alasanPenolakan);
    return { data: { message: 'Izin berhasil ditolak' } };
  },
};

export default izinService;
