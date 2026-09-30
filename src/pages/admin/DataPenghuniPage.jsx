import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';
import { getInitials, getErrorMessage } from '../../utils/dateUtils';
import userService from '../../services/userService';

const emptyForm = {
  name: '', username: '', email: '', password: '',
  noTelp: '', noKamar: '', blok: '', nim: '', fakultas: '', status: 'AKTIF',
};

export default function AdminPenghuniPage() {
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

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const [alert, setAlert] = useState({ type: '', message: '', title: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAllPenghuni({
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
    if (!editTarget && !form.password) errs.password = 'Password wajib diisi untuk penghuni baru';
    if (form.password && form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (!form.noKamar.trim()) errs.noKamar = 'No. Kamar wajib diisi';
    if (!form.nim.trim()) errs.nim = 'NIM wajib diisi';
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
        await userService.updatePenghuni(editTarget.id, payload);
        setAlert({ type: 'success', title: 'Berhasil!', message: 'Data penghuni berhasil diperbarui.' });
      } else {
        await userService.createPenghuni(payload);
        setAlert({ type: 'success', title: 'Berhasil!', message: 'Penghuni baru berhasil ditambahkan.' });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await userService.deactivatePenghuni(deactivateTarget.id);
      setAlert({ type: 'info', title: 'Dinonaktifkan', message: `Penghuni ${deactivateTarget.name} telah dinonaktifkan.` });
      setDeactivateTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsDeactivating(false);
    }
  };

  const columns = [
    {
      header: 'Penghuni',
      key: 'name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="avatar avatar-sm">{getInitials(row.name)}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{row.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>@{row.username}</div>
          </div>
        </div>
      ),
    },
    { header: 'NIM', key: 'nim', render: (v) => v || '-' },
    { header: 'Kamar', key: 'noKamar', render: (_, row) => `${row.blok || ''} ${row.noKamar || '-'}`.trim() },
    { header: 'Fakultas', key: 'fakultas', render: (v) => v || '-' },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v || 'AKTIF'} /> },
    {
      header: 'Aksi',
      key: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} id={`btn-edit-penghuni-${row.id}`}>✏️</button>
          {row.status !== 'NONAKTIF' && (
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeactivateTarget(row)} id={`btn-deaktif-penghuni-${row.id}`}>🚫</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Data Penghuni" subtitle="Manajemen data penghuni asrama">
      {alert.type && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ type: '', message: '', title: '' })} />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Daftar Penghuni</div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="filter-bar">
              <input
                type="search"
                className="form-control"
                placeholder="Cari nama / username..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                id="search-penghuni"
                style={{ minWidth: 200 }}
              />
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                id="filter-status-penghuni"
              >
                <option value="">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={openCreate} id="btn-tambah-penghuni">
              ➕ Tambah Penghuni
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Belum ada data penghuni" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Data Penghuni' : 'Tambah Penghuni Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={isSaving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} id="btn-save-penghuni">
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
            { key: 'nim', label: 'NIM', type: 'text', required: true },
            { key: 'noTelp', label: 'No. Telepon', type: 'tel', required: false },
            { key: 'blok', label: 'Blok', type: 'text', required: false },
            { key: 'noKamar', label: 'No. Kamar', type: 'text', required: true },
            { key: 'fakultas', label: 'Fakultas', type: 'text', required: false },
          ].map(({ key, label, type, required }) => (
            <div className="form-group" key={key}>
              <label className="form-label" htmlFor={`penghuni-${key}`}>
                {label} {required && <span className="required">*</span>}
              </label>
              <input
                id={`penghuni-${key}`}
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
            <label className="form-label" htmlFor="penghuni-status">Status</label>
            <select
              id="penghuni-status"
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

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Nonaktifkan Penghuni"
        message={`Apakah Anda yakin ingin menonaktifkan penghuni ${deactivateTarget?.name}? Penghuni tidak dapat login setelah dinonaktifkan.`}
        confirmLabel="🚫 Ya, Nonaktifkan"
        type="danger"
        isLoading={isDeactivating}
      />
    </AppLayout>
  );
}
