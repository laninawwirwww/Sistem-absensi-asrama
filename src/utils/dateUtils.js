/**
 * Utility helpers for date and time formatting
 */

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Format ISO date string to Indonesian date
 * @param {string} dateStr - ISO string or date string
 * @returns {string} e.g. "Senin, 29 September 2026"
 */
export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format ISO date string to short date
 * @returns {string} e.g. "29 Sep 2026"
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

/**
 * Format ISO date string to date only (YYYY-MM-DD)
 */
export function toDateString(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

/**
 * Format date with time
 * @returns {string} e.g. "29 Sep 2026, 05:30"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}, ${time}`;
}

/**
 * Get current time as HH:MM
 */
export function getCurrentTimeStr() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Check if current time is within presensi window
 * @param {'SUBUH'|'MALAM'} jenis
 * @returns {boolean}
 */
export function isPresensiWindowOpen(jenis) {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;

  if (jenis === 'SUBUH') {
    // 04:00 - 06:00
    return totalMinutes >= 4 * 60 && totalMinutes <= 6 * 60;
  }
  if (jenis === 'MALAM') {
    // 18:00 - 20:30
    return totalMinutes >= 18 * 60 && totalMinutes <= 20 * 60 + 30;
  }
  return false;
}

/**
 * Get initials from full name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Extract error message from Axios error
 */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Terjadi kesalahan. Silakan coba lagi.'
  );
}
