import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Alert from '../../components/common/Alert';
import izinService from '../../services/izinService';

const JENIS_IZIN = [
  'Pulang Kampung',
  'Acara Keluarga',
  'Keperluan Akademik',
  'Sakit',
  'Kegiatan Organisasi',
  'Lainnya',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function AjukanIzinPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    jenisIzin: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    alasan: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '', title: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.jenisIzin) errs.jenisIzin = 'Jenis izin wajib dipilih';
    if (!form.tanggalMulai) errs.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!form.tanggalSelesai) errs.tanggalSelesai = 'Tanggal selesai wajib diisi';
    if (form.tanggalMulai && form.tanggalSelesai && form.tanggalSelesai < form.tanggalMulai) {
      errs.tanggalSelesai = 'Tanggal selesai harus setelah tanggal mulai';
    }
    if (!form.alasan.trim()) errs.alasan = 'Alasan wajib diisi';
    if (form.alasan.trim().length < 10) errs.alasan = 'Alasan minimal 10 karakter';
    // File tidak wajib di mode demo, tapi kalau ada, validasi formatnya
    if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      errs.bukti = 'File harus berformat JPG atau PNG';
    }
    if (file && file.size > MAX_FILE_SIZE) {
      errs.bukti = 'Ukuran file maksimal 5 MB';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      setErrors((prev) => ({ ...prev, bukti: 'File harus berformat JPG atau PNG' }));
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, bukti: 'Ukuran file maksimal 5 MB' }));
      return;
    }

    setFile(f);
    setErrors((prev) => ({ ...prev, bukti: '' }));
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setAlert({ type: '', message: '', title: '' });

    try {
      const formData = new FormData();
      formData.append('jenisIzin', form.jenisIzin);
      formData.append('tanggalMulai', form.tanggalMulai);
      formData.append('tanggalSelesai', form.tanggalSelesai);
      formData.append('alasan', form.alasan);
      if (file) {
        formData.append('bukti', file);
      }

      await izinService.ajukanIzin(formData);

      setAlert({
        type: 'success',
        title: 'Pengajuan Berhasil! 🎉',
        message: 'Izin Anda telah berhasil diajukan dan sedang menunggu persetujuan fasilitator. Anda akan mendapat notifikasi saat izin diproses.',
      });

      // Reset form
      setForm({ jenisIzin: '', tanggalMulai: '', tanggalSelesai: '', alasan: '' });
      setFile(null);
      setPreview(null);

      setTimeout(() => navigate('/penghuni/riwayat-izin'), 2500);
    } catch (err) {
      setAlert({ type: 'danger', title: 'Pengajuan Gagal', message: err.message || 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout title="Ajukan Izin" subtitle="Isi formulir pengajuan izin tidak hadir">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {alert.type && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ type: '', message: '', title: '' })} />
          </div>
        )}



        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Formulir Pengajuan Izin</div>
              <div className="card-subtitle">Pastikan data yang diisi sudah benar sebelum mengirim</div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Jenis Izin */}
              <div className="form-group">
                <label className="form-label" htmlFor="izin-jenis">
                  Jenis Izin <span className="required">*</span>
                </label>
                <select
                  id="izin-jenis"
                  name="jenisIzin"
                  className={`form-control ${errors.jenisIzin ? 'error' : ''}`}
                  value={form.jenisIzin}
                  onChange={handleChange}
                >
                  <option value="">-- Pilih Jenis Izin --</option>
                  {JENIS_IZIN.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                {errors.jenisIzin && <div className="form-error">⚠ {errors.jenisIzin}</div>}
              </div>

              {/* Tanggal */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="izin-mulai">
                    Tanggal Mulai <span className="required">*</span>
                  </label>
                  <input
                    id="izin-mulai"
                    type="date"
                    name="tanggalMulai"
                    className={`form-control ${errors.tanggalMulai ? 'error' : ''}`}
                    value={form.tanggalMulai}
                    onChange={handleChange}
                  />
                  {errors.tanggalMulai && <div className="form-error">⚠ {errors.tanggalMulai}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="izin-selesai">
                    Tanggal Selesai <span className="required">*</span>
                  </label>
                  <input
                    id="izin-selesai"
                    type="date"
                    name="tanggalSelesai"
                    className={`form-control ${errors.tanggalSelesai ? 'error' : ''}`}
                    value={form.tanggalSelesai}
                    onChange={handleChange}
                    min={form.tanggalMulai || undefined}
                  />
                  {errors.tanggalSelesai && <div className="form-error">⚠ {errors.tanggalSelesai}</div>}
                </div>
              </div>

              {/* Alasan */}
              <div className="form-group">
                <label className="form-label" htmlFor="izin-alasan">
                  Alasan Izin <span className="required">*</span>
                </label>
                <textarea
                  id="izin-alasan"
                  name="alasan"
                  className={`form-control ${errors.alasan ? 'error' : ''}`}
                  value={form.alasan}
                  onChange={handleChange}
                  placeholder="Jelaskan alasan pengajuan izin secara detail..."
                  rows={4}
                />
                <div className="form-hint">{form.alasan.length} karakter (minimal 10)</div>
                {errors.alasan && <div className="form-error">⚠ {errors.alasan}</div>}
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">
                  Bukti Izin (JPG/PNG)
                </label>
                <div className={`file-upload ${errors.bukti ? 'error' : ''}`} style={{ borderColor: errors.bukti ? 'var(--color-danger)' : undefined }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    id="izin-bukti"
                  />
                  {preview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <img
                        src={preview}
                        alt="Preview bukti"
                        style={{ maxHeight: 160, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
                        {file?.name}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                        Klik untuk mengganti file
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="file-upload-icon">📎</div>
                      <div className="file-upload-text">
                        <strong>Klik atau seret file ke sini</strong>
                      </div>
                      <div className="file-upload-hint">JPG atau PNG, maksimal 5 MB</div>
                    </>
                  )}
                </div>
                {errors.bukti && <div className="form-error">⚠ {errors.bukti}</div>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/penghuni/riwayat-izin')}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  id="btn-submit-izin"
                >
                  {isLoading ? (
                    <><div className="spinner spinner-sm" /> Mengirim...</>
                  ) : (
                    '📝 Kirim Pengajuan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
