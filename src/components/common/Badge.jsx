/**
 * Reusable Badge component for status display
 * @param {'success'|'danger'|'warning'|'info'|'gray'|'primary'} variant
 * @param {string} children
 */
export default function Badge({ variant = 'gray', children, dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Map status string to badge variant
 */
export function StatusBadge({ status }) {
  const map = {
    HADIR: { variant: 'success', label: 'Hadir' },
    ALPHA: { variant: 'danger', label: 'Alpha' },
    IZIN: { variant: 'warning', label: 'Izin' },
    SAKIT: { variant: 'info', label: 'Sakit' },
    MENUNGGU: { variant: 'warning', label: 'Menunggu' },
    DISETUJUI: { variant: 'success', label: 'Disetujui' },
    DITOLAK: { variant: 'danger', label: 'Ditolak' },
    AKTIF: { variant: 'success', label: 'Aktif' },
    NONAKTIF: { variant: 'gray', label: 'Nonaktif' },
    SUBUH: { variant: 'primary', label: 'Subuh' },
    MALAM: { variant: 'info', label: 'Malam' },
  };

  const config = map[status] || { variant: 'gray', label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
