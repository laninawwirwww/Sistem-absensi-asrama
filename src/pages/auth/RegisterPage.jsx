import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../../services/userService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    nim: '',
    noKamar: '',
    blok: '',
    fakultas: '',
    noTelp: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!form.username.trim()) errs.username = 'Username wajib diisi';
    if (!form.password) errs.password = 'Password wajib diisi';
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (!form.nim.trim()) errs.nim = 'NIM wajib diisi';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setServerError('');
    
    try {
      await userService.register(form);
      // Sukses daftar, langsung diarahkan ke login
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login dengan akun Anda.' } });
    } catch (err) {
      setServerError(err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 'var(--space-4)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        padding: 'var(--space-8)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto var(--space-4)'
          }}>
            🏛️
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
            Daftar SIAPU
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
            Buat akun untuk penghuni asrama UNAND
          </p>
        </div>

        {serverError && (
          <div style={{
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger-dark)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-5)',
            border: '1px solid var(--color-danger-border)'
          }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap <span className="required">*</span></label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <div className="form-error">⚠ {errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username <span className="required">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'error' : ''}`}
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
              />
              {errors.username && <div className="form-error">⚠ {errors.username}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">NIM <span className="required">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.nim ? 'error' : ''}`}
                placeholder="Nomor BP"
                value={form.nim}
                onChange={(e) => setForm(f => ({ ...f, nim: e.target.value }))}
              />
              {errors.nim && <div className="form-error">⚠ {errors.nim}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Fakultas</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Teknik"
                value={form.fakultas}
                onChange={(e) => setForm(f => ({ ...f, fakultas: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">No. Kamar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: 101"
                value={form.noKamar}
                onChange={(e) => setForm(f => ({ ...f, noKamar: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blok</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: A"
                value={form.blok}
                onChange={(e) => setForm(f => ({ ...f, blok: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? <><div className="spinner spinner-sm"/> Memproses...</> : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
