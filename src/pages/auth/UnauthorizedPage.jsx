import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { role } = useAuth();

  const homeMap = {
    PENGHUNI: '/penghuni/dashboard',
    FASIL: '/fasil/dashboard',
    ADMIN: '/admin/dashboard',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ fontSize: '64px' }}>🚫</div>
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          color: 'var(--color-gray-900)',
        }}
      >
        Akses Ditolak
      </h1>
      <p style={{ color: 'var(--color-gray-500)', textAlign: 'center', maxWidth: 400 }}>
        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard.
      </p>
      <Link
        to={homeMap[role] || '/login'}
        className="btn btn-primary"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
