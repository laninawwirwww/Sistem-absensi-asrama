import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Toast, confirmAction } from '../../utils/sweetalert';
import { getInitials, getErrorMessage } from '../../utils/dateUtils';
import userService from '../../services/userService';

const emptyForm = {
  name: '', username: '', email: '', password: '',
  noTelp: '', nip: '', bidang: '', status: 'AKTIF',
};

export default function AdminFasilPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);



  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAllFasil({
        page, size: 10,
        search: search || undefined,
        status: filterStatus || undefined,
      });
      const d = res.data;
      setData(d.content || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, filterStatus]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setForm({ ...emptyForm, ...row, password: '' });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!form.username.trim()) errs.username = 'Username wajib diisi';
    if (!form.email.trim()) errs.email = 'Email wajib diisi';
    if (!editTarget && !form.password) errs.password = 'Password wajib diisi untuk fasil baru';
    if (form.password && form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editTarget) {
        await userService.updateFasil(editTarget.id, payload);
        Toast.fire({ icon: 'success', title: 'Data fasil diperbarui.' });
      } else {
        await userService.createFasil(payload);
        Toast.fire({ icon: 'success', title: 'Fasil ditambahkan.' });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      Toast.fire({ icon: 'error', title: getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDemote = async (row) => {
    const confirmed = await confirmAction(
      'Berhentikan Fasil?',
      `Apakah Anda yakin ingin memberhentikan fasil ${row.name} dan mengembalikannya menjadi Penghuni?`,
      'Ya, Berhentikan',
      'warning'
    );
    if (!confirmed) return;
    try {
      await userService.demoteFasil(row.id);
      Toast.fire({ icon: 'success', title: `Fasil ${row.name} diberhentikan.` });
      fetchData();
    } catch (err) {
      Toast.fire({ icon: 'error', title: getErrorMessage(err) });
    }
  };

  const handleDelete = async (row) => {
    const confirmed = await confirmAction(
      'Hapus Permanen?',
      `Apakah Anda yakin ingin menghapus fasil ${row.name} secara permanen dari sistem?`,
      'Ya, Hapus',
      'danger'
    );
    if (!confirmed) return;
    try {
      await userService.deleteFasil(row.id);
      Toast.fire({ icon: 'success', title: `Fasil ${row.name} dihapus.` });
      fetchData();
    } catch (err) {
      Toast.fire({ icon: 'error', title: getErrorMessage(err) });
    }
  };

  const columns = [
    {
      header: 'Fasil',
      key: 'name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}>
            {getInitials(row.name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{row.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>@{row.username}</div>
          </div>
        </div>
      ),
    },
    { header: 'NIP', key: 'nip', render: (v) => v || '-' },
    { header: 'Email', key: 'email', render: (v) => v || '-' },
    { header: 'Bidang', key: 'bidang', render: (v) => v || '-' },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v || 'AKTIF'} /> },
    {
      header: 'Aksi',
      key: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} title="Edit">✏️</button>
          <button className="btn btn-outline btn-sm" style={{ color: '#D97706', borderColor: '#D97706' }} onClick={() => handleDemote(row)} title="Berhentikan (Kembali ke Penghuni)">⬇️</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(row)} title="Hapus Permanen">🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Data Fasil" subtitle="Manajemen data fasilitator asrama">


      <div className="card">
        <div className="card-header">
          <div className="card-title">Daftar Fasilitator</div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="filter-bar">
              <input
                type="search"
                className="form-control"
                placeholder="Cari nama / username..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                id="search-fasil"
                style={{ minWidth: 200 }}
              />
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                id="filter-status-fasil"
              >
                <option value="">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={openCreate} id="btn-tambah-fasil">
              ➕ Tambah Fasil
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Belum ada data fasil" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Data Fasil' : 'Tambah Fasil Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={isSaving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} id="btn-save-fasil">
              {isSaving ? <><div className="spinner spinner-sm" /> Menyimpan...</> : '💾 Simpan'}
            </button>
          </>
        }
      >
        <div className="form-row">
          {[
            { key: 'name', label: 'Nama Lengkap', type: 'text', required: true },
            { key: 'username', label: 'Username', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'password', label: editTarget ? 'Password Baru (kosong = tidak diubah)' : 'Password', type: 'password', required: !editTarget },
            { key: 'nip', label: 'NIP', type: 'text', required: false },
            { key: 'noTelp', label: 'No. Telepon', type: 'tel', required: false },
            { key: 'bidang', label: 'Bidang/Divisi', type: 'text', required: false },
          ].map(({ key, label, type, required }) => (
            <div className="form-group" key={key}>
              <label className="form-label" htmlFor={`fasil-${key}`}>
                {label} {required && <span className="required">*</span>}
              </label>
              <input
                id={`fasil-${key}`}
                type={type}
                className={`form-control ${errors[key] ? 'error' : ''}`}
                value={form[key] || ''}
                onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' })); }}
                placeholder={`Masukkan ${label.toLowerCase()}`}
              />
              {errors[key] && <div className="form-error">⚠ {errors[key]}</div>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label" htmlFor="fasil-status">Status</label>
            <select
              id="fasil-status"
              className="form-control"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Nonaktif</option>
            </select>
          </div>
        </div>
      </Modal>


    </AppLayout>
  );
}
