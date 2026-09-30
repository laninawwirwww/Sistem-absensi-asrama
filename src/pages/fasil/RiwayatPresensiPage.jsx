import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort, formatDateTime, getErrorMessage } from '../../utils/dateUtils';
import presensiService from '../../services/presensiService';

const STATUS_OPTIONS = ['HADIR', 'ALPHA', 'IZIN', 'SAKIT'];

export default function FasilRiwayatPresensiPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ jenis: '', tanggal: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '', title: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await presensiService.getAllPresensi({
        page, size: 10,
        jenis: filters.jenis || undefined,
        tanggal: filters.tanggal || undefined,
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

  useEffect(() => { fetchData(); }, [page, filters]);

  const openEdit = (row) => {
    setEditTarget(row);
    setEditForm({
      jenis: row.jenis,
      status: row.status,
      keterangan: row.keterangan || '',
      alasanPerubahan: '',
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.status) errs.status = 'Status wajib dipilih';
    if (!editForm.alasanPerubahan?.trim()) errs.alasanPerubahan = 'Alasan perubahan wajib diisi';
    return errs;
  };

  const handleSaveEdit = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setIsSaving(true);
    try {
      await presensiService.updatePresensi(editTarget.id, editForm);
      setAlert({ type: 'success', title: 'Berhasil!', message: 'Data presensi berhasil diperbarui.' });
      setEditTarget(null);
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Penghuni', key: 'penghuni', render: (_, row) => <span style={{ fontWeight: 500 }}>{row.penghuni?.name || row.penghuniName || '-'}</span> },
    { header: 'Tanggal', key: 'tanggal', render: (v) => formatDateShort(v) },
    { header: 'Jenis', key: 'jenis', render: (v) => <StatusBadge status={v} /> },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    { header: 'Waktu', key: 'waktu', render: (v) => formatDateTime(v) },
    { header: 'Keterangan', key: 'keterangan', render: (v) => v || '-' },
    {
      header: 'Aksi',
      key: 'id',
      render: (_, row) => (
        <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} id={`btn-edit-presensi-${row.id}`}>
          ✏️ Edit
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Riwayat Presensi" subtitle="Kelola data presensi seluruh penghuni">
      {alert.type && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ type: '', message: '', title: '' })} />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Data Presensi Penghuni</div>
          <div className="filter-bar">
            <select
              className="form-control"
              value={filters.jenis}
              onChange={(e) => { setFilters((f) => ({ ...f, jenis: e.target.value })); setPage(0); }}
              id="filter-jenis-fasil"
            >
              <option value="">Semua Jenis</option>
              <option value="SUBUH">Subuh</option>
              <option value="MALAM">Malam</option>
            </select>
            <input
              type="date"
              className="form-control"
              value={filters.tanggal}
              onChange={(e) => { setFilters((f) => ({ ...f, tanggal: e.target.value })); setPage(0); }}
              id="filter-tanggal-fasil"
            />
          </div>
        </div>

        <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Belum ada data presensi" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Data Presensi"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditTarget(null)} disabled={isSaving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSaving} id="btn-save-edit-presensi">
              {isSaving ? <><div className="spinner spinner-sm" /> Menyimpan...</> : '💾 Simpan Perubahan'}
            </button>
          </>
        }
      >
        {editTarget && (
          <div>
            {/* Info */}
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="alert-icon">ℹ️</span>
              <div className="alert-content">
                <div className="alert-title">{editTarget.penghuni?.name || editTarget.penghuniName}</div>
                <div>{formatDateShort(editTarget.tanggal)} — Presensi {editTarget.jenis}</div>
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-status">Status <span className="required">*</span></label>
              <select
                id="edit-status"
                className={`form-control ${editErrors.status ? 'error' : ''}`}
                value={editForm.status}
                onChange={(e) => { setEditForm((f) => ({ ...f, status: e.target.value })); if (editErrors.status) setEditErrors((prev) => ({ ...prev, status: '' })); }}
              >
                <option value="">-- Pilih Status --</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {editErrors.status && <div className="form-error">⚠ {editErrors.status}</div>}
            </div>

            {/* Keterangan */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-keterangan">Keterangan</label>
              <input
                id="edit-keterangan"
                type="text"
                className="form-control"
                placeholder="Keterangan tambahan (opsional)"
                value={editForm.keterangan}
                onChange={(e) => setEditForm((f) => ({ ...f, keterangan: e.target.value }))}
              />
            </div>

            {/* Alasan Perubahan */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-alasan">
                Alasan Perubahan <span className="required">*</span>
              </label>
              <textarea
                id="edit-alasan"
                className={`form-control ${editErrors.alasanPerubahan ? 'error' : ''}`}
                placeholder="Jelaskan alasan perubahan data presensi ini..."
                value={editForm.alasanPerubahan}
                onChange={(e) => { setEditForm((f) => ({ ...f, alasanPerubahan: e.target.value })); if (editErrors.alasanPerubahan) setEditErrors((prev) => ({ ...prev, alasanPerubahan: '' })); }}
                rows={3}
              />
              {editErrors.alasanPerubahan && <div className="form-error">⚠ {editErrors.alasanPerubahan}</div>}
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
