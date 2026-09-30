import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useDummyData } from '../../context/DummyDataContext';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateShort, formatDateTime } from '../../utils/dateUtils';
import presensiService from '../../services/presensiService';
import izinService from '../../services/izinService';

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': bg }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function NotificationPanel({ penghuniId, getNotif, markRead, markAllRead }) {
  const notifs = getNotif(penghuniId);
  const unread = notifs.filter((n) => !n.read).length;
  const [isOpen, setIsOpen] = useState(false);

  if (notifs.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <div className="card" style={{
        border: unread > 0 ? '2px solid #7C3AED' : '1px solid var(--color-gray-200)',
        transition: 'border-color 0.3s',
      }}>
        <div
          className="card-header"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && unread > 0) markAllRead(penghuniId);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="card-title">
              🔔 Notifikasi
            </div>
            {unread > 0 && (
              <span style={{
                background: '#7C3AED',
                color: 'white',
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                animation: 'pulse 2s infinite',
              }}>
                {unread} baru
              </span>
            )}
          </div>
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-400)', userSelect: 'none' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <div style={{ borderTop: '1px solid var(--color-gray-100)' }}>
            {notifs.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: 'var(--space-4)',
                  borderBottom: '1px solid var(--color-gray-100)',
                  background: n.read ? 'transparent' : 'rgba(124, 58, 237, 0.04)',
                  display: 'flex',
                  gap: 'var(--space-3)',
                  cursor: 'pointer',
                }}
                onClick={() => markRead(n.id)}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {n.type === 'IZIN_DISETUJUI' ? '✅' : '❌'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: n.read ? 500 : 700,
                    fontSize: 'var(--text-sm)',
                    color: n.type === 'IZIN_DISETUJUI' ? '#059669' : '#DC2626',
                    marginBottom: 2,
                  }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: '#7C3AED',
                    flexShrink: 0,
                    marginTop: 4,
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PenghuniDashboard() {
  const { user } = useAuth();
  const { getNotifikasi, markNotifRead, markAllNotifRead } = useDummyData();
  const [stats, setStats] = useState({ hadir: 0, alpha: 0, izin: 0, sakit: 0 });
  const [recentPresensi, setRecentPresensi] = useState([]);
  const [recentIzin, setRecentIzin] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [presensiRes, izinRes] = await Promise.all([
          presensiService.getMyPresensi({ page: 0, size: 5 }),
          izinService.getMyIzin({ page: 0, size: 3 }),
        ]);

        const presensiData = presensiRes.data;
        const izinData = izinRes.data;

        setRecentPresensi(presensiData.content || presensiData || []);
        setRecentIzin(izinData.content || izinData || []);

        // Calculate stats from data
        const all = presensiData.content || presensiData || [];
        setStats({
          hadir: all.filter((p) => p.status === 'HADIR').length,
          alpha: all.filter((p) => p.status === 'ALPHA').length,
          izin: all.filter((p) => p.status === 'IZIN').length,
          sakit: all.filter((p) => p.status === 'SAKIT').length,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <AppLayout title="Dashboard" subtitle="Selamat datang di SIAPU">
      {/* Greeting Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
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
            position: 'absolute',
            top: '-30%',
            right: '-5%',
            width: '250px',
            height: '250px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
          }}
        />
        <p style={{ fontSize: 'var(--text-sm)', opacity: 0.75, marginBottom: 'var(--space-2)' }}>
          {greeting()},
        </p>
        <h2
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            marginBottom: 'var(--space-2)',
            letterSpacing: '-0.02em',
          }}
        >
          {user?.name || user?.username} 👋
        </h2>
        <p style={{ opacity: 0.7, fontSize: 'var(--text-sm)' }}>
          Kamar {user?.noKamar || '-'} · {user?.blok || 'Asrama UNAND'}
        </p>
      </div>

      {/* Notifikasi Panel */}
      {user && (
        <NotificationPanel
          penghuniId={user.id}
          getNotif={getNotifikasi}
          markRead={markNotifRead}
          markAllRead={markAllNotifRead}
        />
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="✅" label="Hadir (5 Terakhir)" value={isLoading ? '...' : stats.hadir} color="#059669" bg="#ECFDF5" />
        <StatCard icon="❌" label="Alpha" value={isLoading ? '...' : stats.alpha} color="#DC2626" bg="#FEF2F2" />
        <StatCard icon="📋" label="Izin" value={isLoading ? '...' : stats.izin} color="#D97706" bg="#FFFBEB" />
        <StatCard icon="🏥" label="Sakit" value={isLoading ? '...' : stats.sakit} color="#0284C7" bg="#F0F9FF" />
      </div>

      {/* Recent Presensi */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <div className="card-title">Presensi Terbaru</div>
            <div className="card-subtitle">5 catatan presensi terakhir</div>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : recentPresensi.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <span className="empty-title">Belum ada data presensi</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recentPresensi.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDateShort(p.tanggal)}</td>
                    <td><StatusBadge status={p.jenis} /></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--color-gray-500)' }}>{formatDateTime(p.waktu)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Izin */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Pengajuan Izin Terbaru</div>
            <div className="card-subtitle">Status pengajuan izin terakhir</div>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Jenis Izin</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : recentIzin.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">
                      <span className="empty-icon">📁</span>
                      <span className="empty-title">Belum ada pengajuan izin</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recentIzin.map((iz) => (
                  <tr key={iz.id}>
                    <td style={{ fontWeight: 500 }}>{iz.jenisIzin}</td>
                    <td>
                      {formatDateShort(iz.tanggalMulai)} – {formatDateShort(iz.tanggalSelesai)}
                    </td>
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
