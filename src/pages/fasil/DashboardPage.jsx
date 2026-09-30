import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort } from '../../utils/dateUtils';
import presensiService from '../../services/presensiService';
import izinService from '../../services/izinService';

function StatCard({ icon, label, value, color, bg, badge }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': bg, position: 'relative' }}>
      {badge > 0 && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          background: '#DC2626', color: 'white',
          borderRadius: '999px', padding: '2px 8px',
          fontSize: 11, fontWeight: 800, zIndex: 1,
          animation: 'pulse 2s infinite',
        }}>{badge}</div>
      )}
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function FasilDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalHadir: 0, totalAlpha: 0, izinMenunggu: 0, totalPresensi: 0 });
  const [recentPresensi, setRecentPresensi] = useState([]);
  const [pendingIzin, setPendingIzin] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      presensiService.getAllPresensi({ page: 0, size: 5 }),
      izinService.getAllIzin({ page: 0, size: 5, status: 'MENUNGGU' }),
    ]).then(([presRes, izinRes]) => {
      const pData = presRes.data?.content || presRes.data || [];
      const iData = izinRes.data?.content || izinRes.data || [];
      setRecentPresensi(pData);
      setPendingIzin(iData);
      setStats({
        totalHadir: pData.filter((p) => p.status === 'HADIR').length,
        totalAlpha: pData.filter((p) => p.status === 'ALPHA').length,
        izinMenunggu: iData.length,
        totalPresensi: presRes.data?.totalElements || pData.length,
      });
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <AppLayout title="Dashboard Fasil" subtitle="Pantau presensi dan izin penghuni">
      {/* Greeting */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8)',
          color: 'white',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '-30%', right: '-5%',
            width: 250, height: 250, background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
          }}
        />
        <p style={{ opacity: 0.75, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
          Fasilitator,
        </p>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {user?.name || user?.username} 🎓
        </h2>
        <p style={{ opacity: 0.7, fontSize: 'var(--text-sm)' }}>
          Kelola dan pantau kehadiran penghuni asrama
        </p>
      </div>

      {/* Notif Banner jika ada izin menunggu */}
      {!isLoading && stats.izinMenunggu > 0 && (
        <Link to="/fasil/pengajuan-izin" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(90deg, #D97706, #F59E0B)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            color: 'white',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <span style={{ fontSize: 22 }}>⏳</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                {stats.izinMenunggu} Pengajuan Izin Menunggu Persetujuan
              </div>
              <div style={{ fontSize: 'var(--text-xs)', opacity: 0.9 }}>
                Klik untuk review dan setujui / tolak pengajuan izin penghuni
              </div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="✅" label="Hadir (Terbaru)" value={isLoading ? '...' : stats.totalHadir} color="#059669" bg="#ECFDF5" />
        <StatCard icon="❌" label="Alpha (Terbaru)" value={isLoading ? '...' : stats.totalAlpha} color="#DC2626" bg="#FEF2F2" />
        <StatCard icon="⏳" label="Izin Menunggu" value={isLoading ? '...' : stats.izinMenunggu} color="#D97706" bg="#FFFBEB" badge={stats.izinMenunggu} />
        <StatCard icon="📋" label="Total Presensi" value={isLoading ? '...' : stats.totalPresensi} color="#2563EB" bg="#EFF6FF" />
      </div>

      {/* Recent Presensi */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="card-title">Presensi Terbaru</div>
          <Link to="/fasil/riwayat-presensi" className="btn btn-outline btn-sm">Lihat Semua →</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Penghuni</th><th>Tanggal</th><th>Jenis</th><th>Status</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : recentPresensi.length === 0 ? (
                <tr><td colSpan={4}><div className="empty-state"><span className="empty-icon">📋</span><span className="empty-title">Belum ada data</span></div></td></tr>
              ) : (
                recentPresensi.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.penghuni?.name || p.penghuniName || '-'}</td>
                    <td>{formatDateShort(p.tanggal)}</td>
                    <td><StatusBadge status={p.jenis} /></td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Izin */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Izin Menunggu Approval</div>
          <Link to="/fasil/pengajuan-izin" className="btn btn-primary btn-sm">Review Izin →</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Penghuni</th><th>Jenis Izin</th><th>Tanggal</th><th>Status</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : pendingIzin.length === 0 ? (
                <tr><td colSpan={4}><div className="empty-state"><span className="empty-icon">✅</span><span className="empty-title">Tidak ada izin yang menunggu</span></div></td></tr>
              ) : (
                pendingIzin.map((iz) => (
                  <tr key={iz.id}>
                    <td style={{ fontWeight: 500 }}>{iz.penghuni?.name || iz.penghuniName || '-'}</td>
                    <td>{iz.jenisIzin}</td>
                    <td>{formatDateShort(iz.tanggalMulai)} – {formatDateShort(iz.tanggalSelesai)}</td>
                    <td><StatusBadge status={iz.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
