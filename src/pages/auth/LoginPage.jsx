import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/dateUtils';
import Alert from '../../components/common/Alert';

const roleRedirect = {
  PENGHUNI: '/penghuni/dashboard',
  FASIL: '/fasil/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username wajib diisi';
    if (!form.password) errs.password = 'Password wajib diisi';
    else if (form.password.length < 4) errs.password = 'Password minimal 4 karakter';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const user = await login(form.username, form.password);
      navigate(roleRedirect[user.role] || '/', { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🏛️</div>
          <div>
            <div className="login-logo-title">SIAPU</div>
            <div className="login-logo-sub">Universitas Andalas</div>
          </div>
        </div>

        <h1 className="login-heading">Selamat Datang</h1>
        <p className="login-subheading">
          Masuk untuk mengakses Sistem Informasi Absensi Penghuni Asrama
        </p>

        {apiError && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Alert type="danger" message={apiError} onClose={() => setApiError('')} />
          </div>
        )}

        {location.state?.message && !apiError && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Alert type="success" title="Sukses" message={location.state.message} />
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              name="username"
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
            {errors.username && (
              <div className="form-error">⚠ {errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '16px',
                }}
                aria-label="Toggle visibility password"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">⚠ {errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
            id="btn-login"
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Masuk...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: 'var(--space-5)',
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'white', fontWeight: 'bold' }}>
            Daftar di sini
          </Link>
        </p>

        <p
          style={{
            marginTop: 'var(--space-4)',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          © 2026 SIAPU · Asrama Universitas Andalas
        </p>
      </div>
    </div>
  );
}
