import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getErrorMessage } from '../../utils/dateUtils';
import userService from '../../services/userService';

export default function ProfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '', title: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('profil');

  useEffect(() => {
    userService.getProfile()
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch((err) => {
        // Fallback ke user dari context
        setProfile(user);
        setForm(user || {});
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userService.updateProfile(form);
      setProfile(res.data);
      setIsEditing(false);
      setAlert({ type: 'success', title: 'Profil Disimpan ✅', message: 'Data profil berhasil diperbarui.' });
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = 'Password lama wajib diisi';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Password baru minimal 6 karakter';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Konfirmasi password tidak cocok';
    return errs;
  };

  const handleChangePassword = async () => {
    const errs = validatePw();
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setIsSaving(true);
    try {
      await userService.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setAlert({ type: 'success', title: 'Password Diubah ✅', message: 'Password berhasil diperbarui. Hint: password dummy adalah 123456' });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      setAlert({ type: 'danger', title: 'Gagal', message: err.message || getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const displayData = profile || user;

  // Tentukan fields berdasarkan role
  const profileFields = [
    { key: 'name', label: 'Nama Lengkap', type: 'text' },
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'noTelp', label: 'No. Telepon', type: 'tel' },
    ...(displayData?.role === 'PENGHUNI' ? [
      { key: 'noKamar', label: 'No. Kamar', type: 'text' },
      { key: 'blok', label: 'Blok', type: 'text' },
      { key: 'nim', label: 'NIM', type: 'text' },
      { key: 'fakultas', label: 'Fakultas', type: 'text' },
    ] : []),
  ];

  return (
    <AppLayout title="Profil" subtitle="Informasi akun dan data diri Anda">
      {alert.type && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ type: '', message: '', title: '' })} />
        </div>
      )}

      {/* Profile Header Card */}
      <div className="profile-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="avatar avatar-xl">{getInitials(displayData?.name || displayData?.username)}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="profile-name">{displayData?.name || displayData?.username}</div>
          <div className="profile-role-badge">
            {displayData?.role === 'PENGHUNI' ? '🏠' : displayData?.role === 'FASIL' ? '🎓' : '⚙️'}
            {displayData?.role}
          </div>
          <p style={{ opacity: 0.7, fontSize: 'var(--text-sm)' }}>
            {displayData?.email || '-'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {['profil', 'keamanan'].map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)}
            id={`tab-${t}`}
          >
            {t === 'profil' ? '👤 Data Profil' : '🔒 Keamanan'}
          </button>
        ))}
      </div>

      {tab === 'profil' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Data Diri</div>
            {!isEditing ? (
              <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)} id="btn-edit-profil">
                ✏️ Edit Profil
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setForm(profile); }}>
                  Batal
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving} id="btn-save-profil">
                  {isSaving ? <><div className="spinner spinner-sm" /> Menyimpan...</> : '💾 Simpan'}
                </button>
              </div>
            )}
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : (
              <div className="profile-info-grid">
                {profileFields.map(({ key, label, type }) => (
                  <div key={key} className="profile-info-item">
                    <div className="profile-info-label">{label}</div>
                    {isEditing ? (
                      <input
                        type={type}
                        className="form-control"
                        value={form[key] || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        id={`profil-${key}`}
                        style={{ marginTop: 4 }}
                      />
                    ) : (
                      <div className="profile-info-value">{displayData?.[key] || '-'}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'keamanan' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Ubah Password</div>
          </div>
          <div className="card-body" style={{ maxWidth: 420 }}>
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="alert-icon">💡</span>
              <div className="alert-content">
                <div>Password dummy untuk testing adalah <strong>123456</strong></div>
              </div>
            </div>
            {[
              { key: 'oldPassword', label: 'Password Lama', placeholder: 'Masukkan password lama (123456)' },
              { key: 'newPassword', label: 'Password Baru', placeholder: 'Minimal 6 karakter' },
              { key: 'confirmPassword', label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
            ].map(({ key, label, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label" htmlFor={`pw-${key}`}>{label}</label>
                <input
                  id={`pw-${key}`}
                  type="password"
                  className={`form-control ${pwErrors[key] ? 'error' : ''}`}
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={(e) => { setPwForm((prev) => ({ ...prev, [key]: e.target.value })); if (pwErrors[key]) setPwErrors((prev) => ({ ...prev, [key]: '' })); }}
                />
                {pwErrors[key] && <div className="form-error">⚠ {pwErrors[key]}</div>}
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleChangePassword} disabled={isSaving} id="btn-change-password">
              {isSaving ? <><div className="spinner spinner-sm" /> Menyimpan...</> : '🔒 Ubah Password'}
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
