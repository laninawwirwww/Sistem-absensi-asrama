import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort, formatDateTime } from '../../utils/dateUtils';
import presensiService from '../../services/presensiService';

export default function RiwayatPresensiPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ jenis: '', bulan: '', tahun: new Date().getFullYear() });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await presensiService.getMyPresensi({
        page,
        size: 10,
        jenis: filters.jenis || undefined,
        bulan: filters.bulan || undefined,
        tahun: filters.tahun || undefined,
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

  const columns = [
    { header: 'No', key: 'no', width: 50, render: (_, __, i) => page * 10 + (i || 0) + 1 },
    { header: 'Tanggal', key: 'tanggal', render: (v) => formatDateShort(v) },
    { header: 'Jenis', key: 'jenis', render: (v) => <StatusBadge status={v} /> },
    { header: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    { header: 'Waktu Check-in', key: 'waktu', render: (v) => formatDateTime(v) },
    { header: 'Keterangan', key: 'keterangan', render: (v) => v || '-' },
  ];

  const months = [
    { v: '1', l: 'Januari' }, { v: '2', l: 'Februari' }, { v: '3', l: 'Maret' },
    { v: '4', l: 'April' }, { v: '5', l: 'Mei' }, { v: '6', l: 'Juni' },
    { v: '7', l: 'Juli' }, { v: '8', l: 'Agustus' }, { v: '9', l: 'September' },
    { v: '10', l: 'Oktober' }, { v: '11', l: 'November' }, { v: '12', l: 'Desember' },
  ];

  return (
    <AppLayout title="Riwayat Presensi" subtitle="Histori kehadiran Anda">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Data Presensi Saya</div>
          <div className="filter-bar">
            <select
              className="form-control"
              value={filters.jenis}
              onChange={(e) => { setFilters((f) => ({ ...f, jenis: e.target.value })); setPage(0); }}
              id="filter-jenis"
            >
              <option value="">Semua Jenis</option>
              <option value="SUBUH">Subuh</option>
              <option value="MALAM">Malam</option>
            </select>
            <select
              className="form-control"
              value={filters.bulan}
              onChange={(e) => { setFilters((f) => ({ ...f, bulan: e.target.value })); setPage(0); }}
              id="filter-bulan"
            >
              <option value="">Semua Bulan</option>
              {months.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select
              className="form-control"
              value={filters.tahun}
              onChange={(e) => { setFilters((f) => ({ ...f, tahun: e.target.value })); setPage(0); }}
              id="filter-tahun"
            >
              {[2026, 2025, 2024].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Belum ada data presensi" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
