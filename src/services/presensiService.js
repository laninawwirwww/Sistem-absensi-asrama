/**
 * presensiService.js — Dummy-mode override
 * Semua operasi menggunakan DummyDataContext, bukan API call nyata.
 */

let _ctx = null;
let _user = null;

export function setPresensiServiceContext(ctx, user) {
  _ctx = ctx;
  _user = user;
}

function delay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

const presensiService = {
  doPresensi: async (data) => {
    await delay(800); // Simulasi GPS + server delay
    if (!_ctx || !_user) throw new Error('Service tidak terhubung ke context');
    
    try {
      const result = _ctx.doPresensi(
        _user.id,
        _user.name || _user.username,
        data.jenis,
        data.latitude,
        data.longitude
      );
      return { data: result };
    } catch (err) {
      throw err;
    }
  },

  getMyPresensi: async (params = {}) => {
    await delay(300);
    if (!_ctx || !_user) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getMyPresensi(_user.id, params);
    return { data: result };
  },

  getAllPresensi: async (params = {}) => {
    await delay(300);
    if (!_ctx) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getAllPresensi(params);
    return { data: result };
  },

  updatePresensi: async (id, data) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.updatePresensi(parseInt(id), data);
    return { data: { message: 'Presensi berhasil diperbarui' } };
  },

  getPresensiById: async (id) => {
    await delay(200);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const found = _ctx.presensi.find((p) => p.id === id || p.id === parseInt(id));
    if (!found) throw new Error('Presensi tidak ditemukan');
    return { data: found };
  },
};

export default presensiService;
