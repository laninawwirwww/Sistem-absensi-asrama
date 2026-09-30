/**
 * ServiceConnector.jsx
 * 
 * Komponen yang menghubungkan DummyDataContext dengan semua service modules.
 * Dipanggil sekali di root App.jsx setelah kedua context provider berjalan.
 */

import { useEffect } from 'react';
import { useDummyData } from '../../context/DummyDataContext';
import { useAuth } from '../../context/AuthContext';
import { setIzinServiceContext } from '../../services/izinService';
import { setPresensiServiceContext } from '../../services/presensiService';
import { setUserServiceContext } from '../../services/userService';

export default function ServiceConnector() {
  const dummyData = useDummyData();
  const { user } = useAuth();

  useEffect(() => {
    // Hubungkan semua service dengan context dan user yang sedang login
    setIzinServiceContext(dummyData, user);
    setPresensiServiceContext(dummyData, user);
    setUserServiceContext(dummyData, user);
  }, [dummyData, user]);

  return null; // Tidak merender apapun
}
