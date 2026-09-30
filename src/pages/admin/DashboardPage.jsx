import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useDummyData } from '../../context/DummyDataContext';
import userService from '../../services/userService';

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const { izin, presensi } = useDummyData();
  const [stats, setStats] = useState({ totalPenghuni: 0, aktivePenghuni: 0, totalFasil: 0, aktiveFasil: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAllPenghuni({ page: 0, size: 1000 }),
      userService.getAllFasil({ page: 0, size: 1000 }),
    ]).then(([pRes, fRes]) => {
      const penghuniData = pRes.data?.content || pRes.data || [];
      const fasilData = fRes.data?.content || fRes.data || [];
      setStats({
        totalPenghuni: penghuniData.length,
        aktivePenghuni: penghuniData.filter((p) => p.status === 'AKTIF').length,
        totalFasil: fasilData.length,
        aktiveFasil: fasilData.filter((f) => f.status === 'AKTIF').length,
      });
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  // Statistik dari dummy data
  const izinMenunggu = izin.filter((iz) => iz.status === 'MENUNGGU').length;
  const hadirHariIni = presensi.filter((p) => {
    const today = new Date().toISOString().split('T')[0];
    return p.tanggal === today && p.status === 'HADIR';
  }).length;

  return (
    <AppLayout title="Dashboard Admin" subtitle="Kelola data pengguna sistem">
      {/* Greeting */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B, #059669)',
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
          Administrator,
        </p>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {user?.name || user?.username} ⚙️
        </h2>
        <p style={{ opacity: 0.7, fontSize: 'var(--text-sm)' }}>
          Kelola penghuni dan fasilitator asrama UNAND
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard icon="🏠" label="Total Penghuni" value={isLoading ? '...' : stats.totalPenghuni} color="#2563EB" bg="#EFF6FF" />
        <StatCard icon="✅" label="Penghuni Aktif" value={isLoading ? '...' : stats.aktivePenghuni} color="#059669" bg="#ECFDF5" />
        <StatCard icon="🎓" label="Total Fasil" value={isLoading ? '...' : stats.totalFasil} color="#7C3AED" bg="#F5F3FF" />
        <StatCard icon="✅" label="Fasil Aktif" value={isLoading ? '...' : stats.aktiveFasil} color="#059669" bg="#ECFDF5" />
        <StatCard icon="📋" label="Presensi Hadir (Hari Ini)" value={hadirHariIni} color="#0284C7" bg="#F0F9FF" />
        <StatCard icon="⏳" label="Izin Pending" value={izinMenunggu} color="#D97706" bg="#FFFBEB" />
      </div>

      {/* Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
        {[
          { icon: '👥', title: 'Manajemen Penghuni', desc: 'Tambah, edit, dan nonaktifkan data penghuni asrama', link: '/admin/penghuni', color: '#2563EB' },
          { icon: '🎓', title: 'Manajemen Fasil', desc: 'Tambah, edit, dan nonaktifkan data fasilitator', link: '/admin/fasil', color: '#7C3AED' },
        ].map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className="card"
            style={{ padding: 'var(--space-6)', textDecoration: 'none', display: 'block', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ fontSize: 36, marginBottom: 'var(--space-3)' }}>{card.icon}</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
              {card.title}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', lineHeight: 1.5 }}>{card.desc}</div>
          </Link>
        ))}
      </div>


    </AppLayout>
  );
}
