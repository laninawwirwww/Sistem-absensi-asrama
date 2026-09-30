import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Alert from '../../components/common/Alert';
import { isPresensiWindowOpen, getErrorMessage } from '../../utils/dateUtils';
import presensiService from '../../services/presensiService';

const JENIS_PRESENSI = [
  {
    id: 'SUBUH',
    icon: '🌅',
    label: 'Subuh',
    time: '04.00 – 06.00',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    id: 'MALAM',
    icon: '🌙',
    label: 'Malam',
    time: '18.00 – 20.30',
    color: '#6D28D9',
    bg: '#F5F3FF',
  },
];

function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser tidak mendukung Geolocation API.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.',
          2: 'Lokasi tidak tersedia. Coba lagi.',
          3: 'Permintaan lokasi timeout. Coba lagi.',
        };
        reject(new Error(messages[err.code] || 'Gagal mendapatkan lokasi.'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function PresensiPage() {
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '', title: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePresensi = useCallback(async () => {
    if (!selectedJenis) {
      setStatus({ type: 'warning', title: 'Pilih Jenis Presensi', message: 'Silakan pilih jenis presensi (Subuh atau Malam) terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '', title: '' });

    try {
      // Get coordinates from browser
      const coords = await getGeolocation();

      // Send to backend — backend validates time window, radius, duplicate
      const response = await presensiService.doPresensi({
        jenis: selectedJenis,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setStatus({
        type: 'success',
        title: 'Presensi Berhasil! ✅',
        message: `Presensi ${selectedJenis.toLowerCase()} Anda telah berhasil dicatat. Koordinat: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
      });
      setSelectedJenis(null);
    } catch (err) {
      // Distinguish geolocation errors vs API errors
      const msg = err.message || '';
      if (msg.includes('lokasi') || msg.includes('Izin') || msg.includes('Lokasi')) {
        setStatus({ type: 'danger', title: 'Izin Lokasi Bermasalah', message: msg });
      } else {
        setStatus({ type: 'danger', title: 'Presensi Gagal', message: getErrorMessage(err) });
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedJenis]);

  const formatClock = (d) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDateDisplay = (d) =>
    d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const subuhOpen = isPresensiWindowOpen('SUBUH');
  const malamOpen = isPresensiWindowOpen('MALAM');
  const anyWindowOpen = subuhOpen || malamOpen;

  return (
    <AppLayout title="Presensi" subtitle="Lakukan presensi harian Anda">
      {/* Clock Card */}
      <div className="presensi-clock-card">
        <div className="presensi-big-clock">{formatClock(now)}</div>
        <div className="presensi-date-display">{formatDateDisplay(now)}</div>

        <div className="presensi-window-info">
          <div className="presensi-window-item">
            <div className="presensi-window-label">🌅 Subuh</div>
            <div className="presensi-window-time">04.00 – 06.00</div>
            <div style={{ fontSize: '10px', marginTop: 3 }}>
              {subuhOpen ? (
                <span style={{ color: '#6EE7B7', fontWeight: 700 }}>● Terbuka</span>
              ) : (
                <span style={{ opacity: 0.5 }}>○ Ditutup</span>
              )}
            </div>
          </div>
          <div
            style={{ width: 1, background: 'rgba(255,255,255,0.2)', margin: '0 var(--space-2)' }}
          />
          <div className="presensi-window-item">
            <div className="presensi-window-label">🌙 Malam</div>
            <div className="presensi-window-time">18.00 – 20.30</div>
            <div style={{ fontSize: '10px', marginTop: 3 }}>
              {malamOpen ? (
                <span style={{ color: '#6EE7B7', fontWeight: 700 }}>● Terbuka</span>
              ) : (
                <span style={{ opacity: 0.5 }}>○ Ditutup</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {status.type && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Alert
            type={status.type}
            title={status.title}
            message={status.message}
            onClose={() => setStatus({ type: '', message: '', title: '' })}
          />
        </div>
      )}

      {/* Jenis Presensi Selection */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div className="card-title">Pilih Jenis Presensi</div>
        </div>
        <div className="card-body">
          <div className="presensi-type-grid">
            {JENIS_PRESENSI.map((jenis) => {
              const isOpen = isPresensiWindowOpen(jenis.id);
              const isSelected = selectedJenis === jenis.id;
              return (
                <button
                  key={jenis.id}
                  className={`presensi-type-card ${isSelected ? 'selected' : ''} ${!isOpen ? 'disabled' : ''}`}
                  onClick={() => isOpen && setSelectedJenis(jenis.id)}
                  disabled={!isOpen}
                  id={`btn-presensi-${jenis.id.toLowerCase()}`}
                  style={{
                    '--card-color': jenis.color,
                    borderColor: isSelected ? jenis.color : undefined,
                    background: isSelected ? jenis.bg : undefined,
                  }}
                >
                  <div className="presensi-type-icon">{jenis.icon}</div>
                  <div className="presensi-type-name">{jenis.label}</div>
                  <div className="presensi-type-time">{jenis.time}</div>
                  {!isOpen && (
                    <div
                      style={{
                        marginTop: 'var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-gray-400)',
                      }}
                    >
                      Di luar waktu presensi
                    </div>
                  )}
                  {isSelected && (
                    <div
                      style={{
                        marginTop: 'var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        color: jenis.color,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Dipilih
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-body">
          <div className="alert alert-info">
            <span className="alert-icon">📍</span>
            <div className="alert-content">
              <div className="alert-title">Informasi Presensi</div>
              <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)', lineHeight: 2 }}>
                <li>Presensi menggunakan lokasi GPS perangkat Anda</li>
                <li>Pastikan Anda berada di area asrama saat melakukan presensi</li>
                <li>Validasi waktu dan lokasi dilakukan oleh server</li>
                <li>Presensi hanya dapat dilakukan sekali per sesi (subuh/malam)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="btn btn-primary btn-lg w-full"
        onClick={handlePresensi}
        disabled={isLoading || !selectedJenis}
        id="btn-submit-presensi"
        style={{ fontSize: 'var(--text-base)', padding: '16px' }}
      >
        {isLoading ? (
          <>
            <div className="spinner spinner-sm" />
            Memproses Presensi...
          </>
        ) : (
          <>📍 Lakukan Presensi {selectedJenis || ''}</>
        )}
      </button>

      {!anyWindowOpen && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-gray-400)',
            fontSize: 'var(--text-sm)',
            marginTop: 'var(--space-3)',
          }}
        >
          Presensi saat ini di luar jam yang ditentukan. Presensi tersedia pukul 04.00–06.00 dan 18.00–20.30.
        </p>
      )}
    </AppLayout>
  );
}
