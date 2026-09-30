import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navConfig = {
  PENGHUNI: [
    { to: '/penghuni/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/penghuni/presensi', icon: '📍', label: 'Presensi' },
    { to: '/penghuni/riwayat-presensi', icon: '📋', label: 'Riwayat Presensi' },
    { to: '/penghuni/ajukan-izin', icon: '📝', label: 'Ajukan Izin' },
    { to: '/penghuni/riwayat-izin', icon: '📁', label: 'Riwayat Izin' },
    { to: '/penghuni/profil', icon: '👤', label: 'Profil' },
  ],
  FASIL: [
    { to: '/fasil/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/fasil/riwayat-presensi', icon: '📋', label: 'Riwayat Presensi' },
    { to: '/fasil/pengajuan-izin', icon: '📁', label: 'Pengajuan Izin' },
    { to: '/fasil/profil', icon: '👤', label: 'Profil' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/penghuni', icon: '👥', label: 'Data Penghuni' },
    { to: '/admin/fasil', icon: '🎓', label: 'Data Fasil' },
    { to: '/admin/profil', icon: '👤', label: 'Profil' },
  ],
};

const roleMeta = {
  PENGHUNI: { label: 'Penghuni', color: '#2563EB' },
  FASIL: { label: 'Fasilitator', color: '#7C3AED' },
  ADMIN: { label: 'Administrator', color: '#059669' },
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const navItems = navConfig[role] || [];
  const meta = roleMeta[role] || {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏛️</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">SIAPU</span>
          <span className="sidebar-logo-subtitle">Asrama UNAND</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => setShowLogout(!showLogout)}
          style={{ position: 'relative' }}
        >
          <div className="sidebar-user-avatar">{getInitials(user?.name || user?.username)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || user?.username}</div>
            <div className="sidebar-user-role">{meta.label}</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>▲</span>
        </div>

        {showLogout && (
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-lg)',
              marginTop: 'var(--space-2)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: '#F87171',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              🚪 Keluar
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
