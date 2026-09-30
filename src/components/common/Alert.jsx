/**
 * Reusable Alert/Notification component
 * @param {'success'|'danger'|'warning'|'info'} type
 * @param {string} title
 * @param {string} message
 * @param {function} onClose - optional dismiss handler
 */

const icons = {
  success: '✅',
  danger: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function Alert({ type = 'info', title, message, onClose }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div>{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            opacity: 0.6,
            padding: '0 4px',
          }}
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      )}
    </div>
  );
}
