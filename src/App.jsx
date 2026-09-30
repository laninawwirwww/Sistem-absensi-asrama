import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DummyDataProvider } from './context/DummyDataContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import ServiceConnector from './components/common/ServiceConnector';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Penghuni Pages
import PenghuniDashboard from './pages/penghuni/DashboardPage';
import PresensiPage from './pages/penghuni/PresensiPage';
import RiwayatPresensiPage from './pages/penghuni/RiwayatPresensiPage';
import AjukanIzinPage from './pages/penghuni/AjukanIzinPage';
import RiwayatIzinPage from './pages/penghuni/RiwayatIzinPage';
import PenghuniProfilPage from './pages/penghuni/ProfilPage';

// Fasil Pages
import FasilDashboard from './pages/fasil/DashboardPage';
import FasilRiwayatPresensi from './pages/fasil/RiwayatPresensiPage';
import FasilPengajuanIzin from './pages/fasil/PengajuanIzinPage';
import FasilProfil from './pages/fasil/ProfilPage';

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage';
import DataPenghuniPage from './pages/admin/DataPenghuniPage';
import DataFasilPage from './pages/admin/DataFasilPage';
import AdminProfil from './pages/admin/ProfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <DummyDataProvider>
        <AuthProvider>
          {/* ServiceConnector menghubungkan services dengan DummyDataContext */}
          <ServiceConnector />
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes — redirect if already logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Unauthorized page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ── PENGHUNI routes ── */}
            <Route element={<ProtectedRoute allowedRoles={['PENGHUNI']} />}>
              <Route path="/penghuni/dashboard" element={<PenghuniDashboard />} />
              <Route path="/penghuni/presensi" element={<PresensiPage />} />
              <Route path="/penghuni/riwayat-presensi" element={<RiwayatPresensiPage />} />
              <Route path="/penghuni/ajukan-izin" element={<AjukanIzinPage />} />
              <Route path="/penghuni/riwayat-izin" element={<RiwayatIzinPage />} />
              <Route path="/penghuni/profil" element={<PenghuniProfilPage />} />
            </Route>

            {/* ── FASIL routes ── */}
            <Route element={<ProtectedRoute allowedRoles={['FASIL']} />}>
              <Route path="/fasil/dashboard" element={<FasilDashboard />} />
              <Route path="/fasil/riwayat-presensi" element={<FasilRiwayatPresensi />} />
              <Route path="/fasil/pengajuan-izin" element={<FasilPengajuanIzin />} />
              <Route path="/fasil/profil" element={<FasilProfil />} />
            </Route>

            {/* ── ADMIN routes ── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/penghuni" element={<DataPenghuniPage />} />
              <Route path="/admin/fasil" element={<DataFasilPage />} />
              <Route path="/admin/profil" element={<AdminProfil />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </DummyDataProvider>
    </BrowserRouter>
  );
}
