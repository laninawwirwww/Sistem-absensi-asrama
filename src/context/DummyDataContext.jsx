/**
 * DummyDataContext.jsx
 * 
 * Context global yang bertindak sebagai "in-memory database" untuk simulasi
 * interaksi data antar role (Penghuni, Fasil, Admin) tanpa backend.
 * 
 * Data disimpan di localStorage supaya tetap persisten saat refresh.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Helper ───────────────────────────────────────────────────────────────────
let _idCounter = 1000;
function genId() { return ++_idCounter; }

function now() { return new Date().toISOString(); }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// ─── Data Awal (Seed) ─────────────────────────────────────────────────────────
const SEED_PENGHUNI = [
  { id: 3,  username: 'penghuni',  name: 'Budi Santoso',     role: 'PENGHUNI', email: 'budi@student.unand.ac.id',    noTelp: '081234567890', noKamar: '101', blok: 'A', nim: '2110001', fakultas: 'Teknik', status: 'AKTIF' },
  { id: 10, username: 'andi',      name: 'Andi Pratama',     role: 'PENGHUNI', email: 'andi@student.unand.ac.id',    noTelp: '081298765432', noKamar: '102', blok: 'A', nim: '2110002', fakultas: 'MIPA',   status: 'AKTIF' },
  { id: 11, username: 'sari',      name: 'Sari Dewi',        role: 'PENGHUNI', email: 'sari@student.unand.ac.id',    noTelp: '082345678901', noKamar: '201', blok: 'B', nim: '2110003', fakultas: 'Ekonomi', status: 'AKTIF' },
  { id: 12, username: 'reza',      name: 'Reza Firmansyah',  role: 'PENGHUNI', email: 'reza@student.unand.ac.id',    noTelp: '083456789012', noKamar: '202', blok: 'B', nim: '2110004', fakultas: 'Hukum',  status: 'AKTIF' },
  { id: 13, username: 'maya',      name: 'Maya Putri',       role: 'PENGHUNI', email: 'maya@student.unand.ac.id',    noTelp: '085678901234', noKamar: '301', blok: 'C', nim: '2110005', fakultas: 'Kedokteran', status: 'AKTIF' },
  { id: 14, username: 'dimas',     name: 'Dimas Kurniawan',  role: 'PENGHUNI', email: 'dimas@student.unand.ac.id',   noTelp: '087890123456', noKamar: '302', blok: 'C', nim: '2110006', fakultas: 'Pertanian', status: 'NONAKTIF' },
];

const SEED_FASIL = [
  { id: 2,  username: 'fasil',   name: 'Fasilitator Asrama', role: 'FASIL', email: 'fasil@unand.ac.id',   noTelp: '081234500001', status: 'AKTIF' },
  { id: 20, username: 'fasil2',  name: 'Ahmad Fauzi',        role: 'FASIL', email: 'ahmad@unand.ac.id',   noTelp: '081234500002', status: 'AKTIF' },
];

// Data Presensi awal
const SEED_PRESENSI = [
  { id: 101, penghuniId: 3,  penghuniName: 'Budi Santoso',    jenis: 'SUBUH', status: 'HADIR',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 102, penghuniId: 3,  penghuniName: 'Budi Santoso',    jenis: 'MALAM', status: 'HADIR',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 103, penghuniId: 3,  penghuniName: 'Budi Santoso',    jenis: 'SUBUH', status: 'HADIR',  tanggal: dateStr(-2), waktu: daysAgo(2), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 104, penghuniId: 3,  penghuniName: 'Budi Santoso',    jenis: 'MALAM', status: 'ALPHA',  tanggal: dateStr(-2), waktu: daysAgo(2), keterangan: 'Tidak hadir malam', latitude: null, longitude: null },
  { id: 105, penghuniId: 3,  penghuniName: 'Budi Santoso',    jenis: 'SUBUH', status: 'HADIR',  tanggal: dateStr(-3), waktu: daysAgo(3), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 106, penghuniId: 10, penghuniName: 'Andi Pratama',    jenis: 'SUBUH', status: 'HADIR',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 107, penghuniId: 10, penghuniName: 'Andi Pratama',    jenis: 'MALAM', status: 'HADIR',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: '', latitude: -0.9471, longitude: 100.4172 },
  { id: 108, penghuniId: 11, penghuniName: 'Sari Dewi',       jenis: 'SUBUH', status: 'IZIN',   tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: 'Sedang izin pulang', latitude: null, longitude: null },
  { id: 109, penghuniId: 11, penghuniName: 'Sari Dewi',       jenis: 'MALAM', status: 'IZIN',   tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: 'Sedang izin pulang', latitude: null, longitude: null },
  { id: 110, penghuniId: 12, penghuniName: 'Reza Firmansyah', jenis: 'SUBUH', status: 'ALPHA',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: '', latitude: null, longitude: null },
  { id: 111, penghuniId: 13, penghuniName: 'Maya Putri',      jenis: 'SUBUH', status: 'SAKIT',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: 'Demam', latitude: null, longitude: null },
  { id: 112, penghuniId: 13, penghuniName: 'Maya Putri',      jenis: 'MALAM', status: 'SAKIT',  tanggal: dateStr(-1), waktu: daysAgo(1), keterangan: 'Demam', latitude: null, longitude: null },
];

// Data Izin awal
const SEED_IZIN = [
  {
    id: 201,
    penghuniId: 10, penghuniName: 'Andi Pratama',
    jenisIzin: 'Pulang Kampung',
    tanggalMulai: dateStr(1), tanggalSelesai: dateStr(5),
    alasan: 'Acara pernikahan saudara di kampung halaman, perlu hadir untuk membantu persiapan.',
    buktiUrl: 'https://placehold.co/400x300/6D28D9/FFFFFF?text=Surat+Undangan',
    status: 'MENUNGGU',
    createdAt: daysAgo(0),
    alasanPenolakan: null,
  },
  {
    id: 202,
    penghuniId: 11, penghuniName: 'Sari Dewi',
    jenisIzin: 'Acara Keluarga',
    tanggalMulai: dateStr(-2), tanggalSelesai: dateStr(0),
    alasan: 'Ayah sedang sakit dan perlu perawatan di rumah. Saya harus menemani beliau.',
    buktiUrl: 'https://placehold.co/400x300/059669/FFFFFF?text=Surat+Dokter',
    status: 'DISETUJUI',
    createdAt: daysAgo(3),
    alasanPenolakan: null,
  },
  {
    id: 203,
    penghuniId: 12, penghuniName: 'Reza Firmansyah',
    jenisIzin: 'Keperluan Akademik',
    tanggalMulai: dateStr(-5), tanggalSelesai: dateStr(-3),
    alasan: 'Mengikuti seminar nasional hukum di Jakarta yang wajib diikuti sebagai syarat kelulusan mata kuliah.',
    buktiUrl: 'https://placehold.co/400x300/2563EB/FFFFFF?text=Surat+Seminar',
    status: 'DITOLAK',
    createdAt: daysAgo(6),
    alasanPenolakan: 'Tanggal izin sudah lewat dan tidak ada konfirmasi sebelumnya. Mohon ajukan izin minimal H-3.',
  },
  {
    id: 204,
    penghuniId: 3, penghuniName: 'Budi Santoso',
    jenisIzin: 'Kegiatan Organisasi',
    tanggalMulai: dateStr(2), tanggalSelesai: dateStr(3),
    alasan: 'Mengikuti kegiatan BEM universitas berupa bakti sosial di daerah terpencil.',
    buktiUrl: 'https://placehold.co/400x300/D97706/FFFFFF?text=Surat+BEM',
    status: 'MENUNGGU',
    createdAt: daysAgo(0),
    alasanPenolakan: null,
  },
];

// Notifikasi
const SEED_NOTIFIKASI = [
  {
    id: 901,
    penghuniId: 11,
    type: 'IZIN_DISETUJUI',
    title: 'Izin Disetujui ✅',
    message: 'Izin Acara Keluarga Anda (2–4 Okt 2026) telah disetujui oleh fasilitator.',
    read: false,
    createdAt: daysAgo(3),
  },
  {
    id: 902,
    penghuniId: 12,
    type: 'IZIN_DITOLAK',
    title: 'Izin Ditolak ❌',
    message: 'Izin Keperluan Akademik Anda ditolak. Alasan: Tanggal izin sudah lewat dan tidak ada konfirmasi sebelumnya.',
    read: false,
    createdAt: daysAgo(5),
  },
];

// ─── Load / Save ke localStorage ─────────────────────────────────────────────
const LS_KEY = 'siapu_dummy_data_v2';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DummyDataContext = createContext(null);

export function DummyDataProvider({ children }) {
  const [penghuni, setPenghuni] = useState([]);
  const [fasil, setFasil] = useState([]);
  const [presensi, setPresensi] = useState([]);
  const [izin, setIzin] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);

  // Load dari localStorage atau gunakan seed data
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setPenghuni(stored.penghuni || SEED_PENGHUNI);
      setFasil(stored.fasil || SEED_FASIL);
      setPresensi(stored.presensi || SEED_PRESENSI);
      setIzin(stored.izin || SEED_IZIN);
      setNotifikasi(stored.notifikasi || SEED_NOTIFIKASI);
    } else {
      setPenghuni(SEED_PENGHUNI);
      setFasil(SEED_FASIL);
      setPresensi(SEED_PRESENSI);
      setIzin(SEED_IZIN);
      setNotifikasi(SEED_NOTIFIKASI);
    }
  }, []);

  // Auto-save setiap ada perubahan
  useEffect(() => {
    if (penghuni.length === 0 && fasil.length === 0) return; // Skip saat loading awal
    saveToStorage({ penghuni, fasil, presensi, izin, notifikasi });
  }, [penghuni, fasil, presensi, izin, notifikasi]);

  // ── PRESENSI ──────────────────────────────────────────────────────────────

  const doPresensi = useCallback((penghuniId, penghuniName, jenis, latitude, longitude) => {
    const today = dateStr(0);
    // Cek duplikat
    const exists = presensi.find(
      (p) => p.penghuniId === penghuniId && p.jenis === jenis && p.tanggal === today
    );
    if (exists) {
      throw new Error(`Anda sudah melakukan presensi ${jenis.toLowerCase()} hari ini.`);
    }

    const newRecord = {
      id: genId(),
      penghuniId,
      penghuniName,
      jenis,
      status: 'HADIR',
      tanggal: today,
      waktu: now(),
      keterangan: '',
      latitude,
      longitude,
    };
    setPresensi((prev) => [newRecord, ...prev]);
    return newRecord;
  }, [presensi]);

  const getMyPresensi = useCallback((penghuniId, params = {}) => {
    let result = presensi.filter((p) => p.penghuniId === penghuniId);
    if (params.jenis) result = result.filter((p) => p.jenis === params.jenis);
    if (params.bulan) result = result.filter((p) => {
      const m = new Date(p.tanggal).getMonth() + 1;
      return m === parseInt(params.bulan);
    });
    if (params.tahun) result = result.filter((p) => {
      const y = new Date(p.tanggal).getFullYear();
      return y === parseInt(params.tahun);
    });
    result = [...result].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [presensi]);

  const getAllPresensi = useCallback((params = {}) => {
    let result = [...presensi];
    if (params.jenis) result = result.filter((p) => p.jenis === params.jenis);
    if (params.tanggal) result = result.filter((p) => p.tanggal === params.tanggal);
    if (params.penghuniId) result = result.filter((p) => p.penghuniId === params.penghuniId);
    result.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [presensi]);

  const updatePresensi = useCallback((id, data) => {
    setPresensi((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
  }, []);

  // ── IZIN ──────────────────────────────────────────────────────────────────

  const ajukanIzin = useCallback((penghuniId, penghuniName, formData) => {
    const newIzin = {
      id: genId(),
      penghuniId,
      penghuniName,
      jenisIzin: formData.jenisIzin,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      alasan: formData.alasan,
      buktiUrl: formData.buktiPreviewUrl || 'https://placehold.co/400x300/6D28D9/FFFFFF?text=Bukti+Izin',
      status: 'MENUNGGU',
      createdAt: now(),
      alasanPenolakan: null,
    };
    setIzin((prev) => [newIzin, ...prev]);
    return newIzin;
  }, []);

  const getMyIzin = useCallback((penghuniId, params = {}) => {
    let result = izin.filter((iz) => iz.penghuniId === penghuniId);
    if (params.status) result = result.filter((iz) => iz.status === params.status);
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [izin]);

  const getAllIzin = useCallback((params = {}) => {
    let result = [...izin];
    if (params.status) result = result.filter((iz) => iz.status === params.status);
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [izin]);

  const approveIzin = useCallback((id) => {
    const target = izin.find((iz) => iz.id === id);
    if (!target) throw new Error('Izin tidak ditemukan');
    setIzin((prev) => prev.map((iz) => iz.id === id ? { ...iz, status: 'DISETUJUI', approvedAt: now() } : iz));
    // Kirim notifikasi ke penghuni
    setNotifikasi((prev) => [{
      id: genId(),
      penghuniId: target.penghuniId,
      type: 'IZIN_DISETUJUI',
      title: 'Izin Disetujui ✅',
      message: `Izin ${target.jenisIzin} Anda (${formatDateNotif(target.tanggalMulai)} – ${formatDateNotif(target.tanggalSelesai)}) telah disetujui oleh fasilitator.`,
      read: false,
      createdAt: now(),
    }, ...prev]);
  }, [izin]);

  const rejectIzin = useCallback((id, alasanPenolakan) => {
    const target = izin.find((iz) => iz.id === id);
    if (!target) throw new Error('Izin tidak ditemukan');
    setIzin((prev) => prev.map((iz) => iz.id === id ? { ...iz, status: 'DITOLAK', alasanPenolakan, rejectedAt: now() } : iz));
    // Kirim notifikasi ke penghuni
    setNotifikasi((prev) => [{
      id: genId(),
      penghuniId: target.penghuniId,
      type: 'IZIN_DITOLAK',
      title: 'Izin Ditolak ❌',
      message: `Izin ${target.jenisIzin} Anda ditolak. Alasan: ${alasanPenolakan}`,
      read: false,
      createdAt: now(),
    }, ...prev]);
  }, [izin]);

  // ── USER (Penghuni & Fasil) ───────────────────────────────────────────────

  const getAllPenghuni = useCallback((params = {}) => {
    let result = [...penghuni];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
    }
    if (params.status) result = result.filter((p) => p.status === params.status);
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [penghuni]);

  const createPenghuni = useCallback((data) => {
    const newP = { ...data, id: genId(), role: 'PENGHUNI', status: data.status || 'AKTIF' };
    setPenghuni((prev) => [...prev, newP]);
    return newP;
  }, []);

  const updatePenghuni = useCallback((id, data) => {
    setPenghuni((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deactivatePenghuni = useCallback((id) => {
    setPenghuni((prev) => prev.map((p) => p.id === id ? { ...p, status: 'NONAKTIF' } : p));
  }, []);

  const deletePenghuni = useCallback((id) => {
    setPenghuni((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const promoteToFasil = useCallback((id) => {
    setPenghuni((prevPenghuni) => {
      const target = prevPenghuni.find((p) => p.id === id);
      if (!target) throw new Error('Penghuni tidak ditemukan');
      
      const updatedTarget = { ...target, role: 'FASIL' };
      
      setFasil((prevFasil) => [...prevFasil, updatedTarget]);
      return prevPenghuni.filter((p) => p.id !== id);
    });
  }, []);

  const getAllFasil = useCallback((params = {}) => {
    let result = [...fasil];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q));
    }
    if (params.status) result = result.filter((f) => f.status === params.status);
    const page = params.page || 0;
    const size = params.size || 10;
    const paged = result.slice(page * size, (page + 1) * size);
    return { content: paged, totalElements: result.length, totalPages: Math.ceil(result.length / size) };
  }, [fasil]);

  const createFasil = useCallback((data) => {
    const newF = { ...data, id: genId(), role: 'FASIL', status: data.status || 'AKTIF' };
    setFasil((prev) => [...prev, newF]);
    return newF;
  }, []);

  const updateFasil = useCallback((id, data) => {
    setFasil((prev) => prev.map((f) => f.id === id ? { ...f, ...data } : f));
  }, []);

  const deactivateFasil = useCallback((id) => {
    setFasil((prev) => prev.map((f) => f.id === id ? { ...f, status: 'NONAKTIF' } : f));
  }, []);

  const demoteFasil = useCallback((id) => {
    setFasil((prevFasil) => {
      const target = prevFasil.find((f) => f.id === id);
      if (!target) throw new Error('Fasil tidak ditemukan');
      
      const updatedTarget = { ...target, role: 'PENGHUNI' };
      setPenghuni((prevPenghuni) => [...prevPenghuni, updatedTarget]);
      
      return prevFasil.filter((f) => f.id !== id);
    });
  }, []);

  const deleteFasil = useCallback((id) => {
    setFasil((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getProfile = useCallback((userId) => {
    return (
      penghuni.find((p) => p.id === userId) ||
      fasil.find((f) => f.id === userId) ||
      { id: 1, name: 'Administrator', username: 'admin', role: 'ADMIN', email: 'admin@unand.ac.id', status: 'AKTIF' }
    );
  }, [penghuni, fasil]);

  const updateProfile = useCallback((userId, data, role) => {
    if (role === 'PENGHUNI') {
      setPenghuni((prev) => prev.map((p) => p.id === userId ? { ...p, ...data } : p));
      return penghuni.find((p) => p.id === userId) || data;
    }
    if (role === 'FASIL') {
      setFasil((prev) => prev.map((f) => f.id === userId ? { ...f, ...data } : f));
      return fasil.find((f) => f.id === userId) || data;
    }
    return data;
  }, [penghuni, fasil]);

  // ── NOTIFIKASI ────────────────────────────────────────────────────────────

  const getNotifikasi = useCallback((penghuniId) => {
    return notifikasi.filter((n) => n.penghuniId === penghuniId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifikasi]);

  const markNotifRead = useCallback((id) => {
    setNotifikasi((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotifRead = useCallback((penghuniId) => {
    setNotifikasi((prev) => prev.map((n) => n.penghuniId === penghuniId ? { ...n, read: true } : n));
  }, []);

  const unreadCount = useCallback((penghuniId) => {
    return notifikasi.filter((n) => n.penghuniId === penghuniId && !n.read).length;
  }, [notifikasi]);

  // ── Reset data (untuk testing ulang) ─────────────────────────────────────
  const resetData = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setPenghuni(SEED_PENGHUNI);
    setFasil(SEED_FASIL);
    setPresensi(SEED_PRESENSI);
    setIzin(SEED_IZIN);
    setNotifikasi(SEED_NOTIFIKASI);
  }, []);

  const value = {
    // Raw data (for direct access if needed)
    penghuni, fasil, presensi, izin, notifikasi,

    // Presensi
    doPresensi, getMyPresensi, getAllPresensi, updatePresensi,

    // Izin
    ajukanIzin, getMyIzin, getAllIzin, approveIzin, rejectIzin,

    // Users
    getAllPenghuni, createPenghuni, updatePenghuni, deactivatePenghuni, deletePenghuni, promoteToFasil,
    getAllFasil, createFasil, updateFasil, deactivateFasil, deleteFasil, demoteFasil,
    getProfile, updateProfile,

    // Notifikasi
    getNotifikasi, markNotifRead, markAllNotifRead, unreadCount,

    // Util
    resetData,
  };

  return <DummyDataContext.Provider value={value}>{children}</DummyDataContext.Provider>;
}

export function useDummyData() {
  const ctx = useContext(DummyDataContext);
  if (!ctx) throw new Error('useDummyData must be used within DummyDataProvider');
  return ctx;
}

// Helper untuk format tanggal di notifikasi
function formatDateNotif(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
