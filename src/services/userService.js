/**
 * userService.js — Dummy-mode override
 * Semua operasi menggunakan DummyDataContext, bukan API call nyata.
 */

let _ctx = null;
let _user = null;

export function setUserServiceContext(ctx, user) {
  _ctx = ctx;
  _user = user;
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

const userService = {
  /* ---- PENGHUNI ---- */
  getAllPenghuni: async (params = {}) => {
    await delay(300);
    if (!_ctx) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getAllPenghuni(params);
    return { data: result };
  },

  getPenghuniById: async (id) => {
    await delay(200);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const found = _ctx.penghuni.find((p) => p.id === id || p.id === parseInt(id));
    if (!found) throw new Error('Penghuni tidak ditemukan');
    return { data: found };
  },

  createPenghuni: async (data) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const result = _ctx.createPenghuni(data);
    return { data: result };
  },

  updatePenghuni: async (id, data) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.updatePenghuni(parseInt(id), data);
    return { data: { ...data, id } };
  },

  deactivatePenghuni: async (id) => {
    await delay(400);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.deactivatePenghuni(parseInt(id));
    return { data: { message: 'Penghuni dinonaktifkan' } };
  },

  deletePenghuni: async (id) => {
    await delay(400);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.deletePenghuni(parseInt(id));
    return { data: { message: 'Penghuni dihapus' } };
  },

  promoteToFasil: async (id) => {
    await delay(600);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.promoteToFasil(parseInt(id));
    return { data: { message: 'Penghuni berhasil dipromosikan menjadi Fasil' } };
  },

  register: async (data) => {
    await delay(800);
    if (!_ctx) throw new Error('Context tidak tersedia');
    // Cek username bentrok
    const exists = _ctx.penghuni.find(p => p.username === data.username) || _ctx.fasil.find(f => f.username === data.username);
    if (exists) throw new Error('Username sudah digunakan');
    
    const result = _ctx.createPenghuni(data);
    return { data: result };
  },

  /* ---- FASIL ---- */
  getAllFasil: async (params = {}) => {
    await delay(300);
    if (!_ctx) return { data: { content: [], totalPages: 0 } };
    const result = _ctx.getAllFasil(params);
    return { data: result };
  },

  getFasilById: async (id) => {
    await delay(200);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const found = _ctx.fasil.find((f) => f.id === id || f.id === parseInt(id));
    if (!found) throw new Error('Fasil tidak ditemukan');
    return { data: found };
  },

  createFasil: async (data) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    const result = _ctx.createFasil(data);
    return { data: result };
  },

  updateFasil: async (id, data) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.updateFasil(parseInt(id), data);
    return { data: { ...data, id } };
  },

  deactivateFasil: async (id) => {
    await delay(400);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.deactivateFasil(parseInt(id));
    return { data: { message: 'Fasil dinonaktifkan' } };
  },

  deleteFasil: async (id) => {
    await delay(400);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.deleteFasil(parseInt(id));
    return { data: { message: 'Fasil dihapus' } };
  },

  demoteFasil: async (id) => {
    await delay(500);
    if (!_ctx) throw new Error('Context tidak tersedia');
    _ctx.demoteFasil(parseInt(id));
    return { data: { message: 'Fasil diberhentikan dan dikembalikan menjadi Penghuni' } };
  },

  /* ---- Profile (current user) ---- */
  getProfile: async () => {
    await delay(300);
    if (!_ctx || !_user) return { data: _user || {} };
    const profile = _ctx.getProfile(_user.id);
    return { data: profile || _user };
  },

  updateProfile: async (data) => {
    await delay(500);
    if (!_ctx || !_user) return { data };
    _ctx.updateProfile(_user.id, data, _user.role);
    return { data: { ..._user, ...data } };
  },

  changePassword: async (data) => {
    await delay(600);
    // Validasi password lama (dummy: harus '123456')
    if (data.oldPassword !== '123456' && data.oldPassword !== _user?.password) {
      throw new Error('Password lama tidak sesuai. (Hint: password dummy adalah 123456)');
    }
    return { data: { message: 'Password berhasil diubah' } };
  },
};

export default userService;
