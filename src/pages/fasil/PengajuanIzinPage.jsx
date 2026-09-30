import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort, formatDateTime, getErrorMessage } from '../../utils/dateUtils';
import izinService from '../../services/izinService';

export default function FasilPengajuanIzinPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIzin, setSelectedIzin] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '', title: '' });
  const [isActing, setIsActing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await izinService.getAllIzin({ page, size: 10, status: filterStatus || undefined });
      const d = res.data;
      setData(d.content || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterStatus]);

  const handleApprove = async () => {
    setIsActing(true);
    try {
      await izinService.approveIzin(confirmApprove.id);
      setAlert({ type: 'success', title: 'Izin Disetujui!', message: `Izin dari ${confirmApprove.penghuni?.name || confirmApprove.penghuniName} berhasil disetujui.` });
      setConfirmApprove(null);
      setSelectedIzin(null);
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    if (!alasanPenolakan.trim()) { setRejectError('Alasan penolakan wajib diisi'); return; }
    setIsActing(true);
    try {
      await izinService.rejectIzin(rejectTarget.id, alasanPenolakan);
      setAlert({ type: 'info', title: 'Izin Ditolak', message: `Izin dari ${rejectTarget.penghuni?.name || rejectTarget.penghuniName} telah ditolak.` });
      setRejectTarget(null);
      setAlasanPenolakan('');
      setSelectedIzin(null);
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsActing(false);
    }
  };

  const columns = [
    { header: 'Penghuni', key: 'penghuni', render: (_, row) => <span style={{ fontWeight: 500 }}>{row.penghuni?.name || row.penghuniName || '-'}</span> },
    { header: 'Jenis Izin', key: 'jenisIzin' },
    { header: 'Tanggal', key: 'tanggalMulai', render: (_, row) => `${formatDateShort(row.tanggalMulai)} – ${formatDateShort(row.tanggalSelesai)}` },
    { header: 'Diajukan', key: 'createdAt', render: (v) => formatDateTime(v) },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    {
      header: 'Aksi',
      key: 'id',
      render: (_, row) => (
        <button className="btn btn-outline btn-sm" onClick={() => setSelectedIzin(row)} id={`btn-detail-izin-${row.id}`}>
          👁 Detail
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Pengajuan Izin" subtitle="Review dan approval pengajuan izin penghuni">
      {alert.type && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ type: '', message: '', title: '' })} />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Daftar Pengajuan Izin</div>
          <select
            className="form-control"
            style={{ maxWidth: 180 }}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            id="filter-status-fasil-izin"
          >
            <option value="">Semua Status</option>
            <option value="MENUNGGU">Menunggu</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>

        <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Belum ada pengajuan izin" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Detail / Approval Modal */}
      <Modal
        isOpen={!!selectedIzin}
        onClose={() => setSelectedIzin(null)}
        title="Detail Pengajuan Izin"
        size="lg"
        footer={
          selectedIzin?.status === 'MENUNGGU' ? (
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedIzin(null)}>Tutup</button>
              <button
                className="btn btn-danger"
                onClick={() => { setRejectTarget(selectedIzin); setAlasanPenolakan(''); setRejectError(''); }}
                id="btn-reject-izin"
              >
                ❌ Tolak
              </button>
              <button
                className="btn btn-success"
                onClick={() => setConfirmApprove(selectedIzin)}
                id="btn-approve-izin"
              >
                ✅ Setujui
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setSelectedIzin(null)}>Tutup</button>
          )
        }
      >
        {selectedIzin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Penghuni</div>
                <div className="profile-info-value">{selectedIzin.penghuni?.name || selectedIzin.penghuniName}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Jenis Izin</div>
                <div className="profile-info-value">{selectedIzin.jenisIzin}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Tanggal Mulai</div>
                <div className="profile-info-value">{formatDateShort(selectedIzin.tanggalMulai)}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Tanggal Selesai</div>
                <div className="profile-info-value">{formatDateShort(selectedIzin.tanggalSelesai)}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Status</div>
                <div className="profile-info-value"><StatusBadge status={selectedIzin.status} /></div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Diajukan</div>
                <div className="profile-info-value">{formatDateTime(selectedIzin.createdAt)}</div>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">Alasan Izin</div>
              <div className="profile-info-value" style={{ fontWeight: 400, lineHeight: 1.7 }}>{selectedIzin.alasan}</div>
            </div>

            {selectedIzin.alasanPenolakan && (
              <div className="alert alert-danger">
                <span className="alert-icon">❌</span>
                <div className="alert-content">
                  <div className="alert-title">Alasan Penolakan</div>
                  <div>{selectedIzin.alasanPenolakan}</div>
                </div>
              </div>
            )}

            {selectedIzin.buktiUrl && (
              <div>
                <div className="profile-info-label" style={{ marginBottom: 'var(--space-2)' }}>Bukti Izin</div>
                <img
                  src={selectedIzin.buktiUrl}
                  alt="Bukti izin"
                  style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Tolak Pengajuan Izin"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRejectTarget(null)} disabled={isActing}>Batal</button>
            <button className="btn btn-danger" onClick={handleReject} disabled={isActing} id="btn-confirm-reject">
              {isActing ? <><div className="spinner spinner-sm" /> Memproses...</> : '❌ Tolak Izin'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="reject-alasan">
            Alasan Penolakan <span className="required">*</span>
          </label>
          <textarea
            id="reject-alasan"
            className={`form-control ${rejectError ? 'error' : ''}`}
            placeholder="Masukkan alasan penolakan yang jelas..."
            value={alasanPenolakan}
            onChange={(e) => { setAlasanPenolakan(e.target.value); setRejectError(''); }}
            rows={4}
          />
          {rejectError && <div className="form-error">⚠ {rejectError}</div>}
        </div>
      </Modal>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={!!confirmApprove}
        onClose={() => setConfirmApprove(null)}
        onConfirm={handleApprove}
        title="Setujui Pengajuan Izin"
        message={`Apakah Anda yakin ingin menyetujui pengajuan izin dari ${confirmApprove?.penghuni?.name || confirmApprove?.penghuniName}?`}
        confirmLabel="✅ Ya, Setujui"
        type="success"
        isLoading={isActing}
      />
    </AppLayout>
  );
}
