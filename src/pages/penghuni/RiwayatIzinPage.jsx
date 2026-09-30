import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort, formatDateTime } from '../../utils/dateUtils';
import izinService from '../../services/izinService';

export default function RiwayatIzinPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIzin, setSelectedIzin] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await izinService.getMyIzin({ page, size: 10, status: filterStatus || undefined });
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

  const columns = [
    { header: 'Jenis Izin', key: 'jenisIzin', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { header: 'Tanggal Mulai', key: 'tanggalMulai', render: (v) => formatDateShort(v) },
    { header: 'Tanggal Selesai', key: 'tanggalSelesai', render: (v) => formatDateShort(v) },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    { header: 'Diajukan', key: 'createdAt', render: (v) => formatDateTime(v) },
    {
      header: 'Aksi',
      key: 'id',
      render: (_, row) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setSelectedIzin(row)}
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Riwayat Izin" subtitle="Status pengajuan izin Anda">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pengajuan Izin Saya</div>
          <select
            className="form-control"
            style={{ maxWidth: 180 }}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            id="filter-status-izin"
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedIzin}
        onClose={() => setSelectedIzin(null)}
        title="Detail Pengajuan Izin"
        size="lg"
      >
        {selectedIzin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Jenis Izin</div>
                <div className="profile-info-value">{selectedIzin.jenisIzin}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Status</div>
                <div className="profile-info-value"><StatusBadge status={selectedIzin.status} /></div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Tanggal Mulai</div>
                <div className="profile-info-value">{formatDateShort(selectedIzin.tanggalMulai)}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Tanggal Selesai</div>
                <div className="profile-info-value">{formatDateShort(selectedIzin.tanggalSelesai)}</div>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">Alasan</div>
              <div className="profile-info-value" style={{ fontWeight: 400, lineHeight: 1.6 }}>{selectedIzin.alasan}</div>
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
    </AppLayout>
  );
}
