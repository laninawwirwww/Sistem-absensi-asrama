import Modal from './Modal';

/**
 * Confirmation dialog modal
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  type = 'danger',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            className={`btn btn-${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner spinner-sm" />
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
