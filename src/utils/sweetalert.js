import Swal from 'sweetalert2';

// Toast Notification (Floating di pojok kanan atas)
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Feedback Berhasil (Popup)
export const showSuccess = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#059669',
  });
};

// Feedback Error (Popup)
export const showError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#DC2626',
  });
};

// Konfirmasi Delete/Aksi Berbahaya
export const confirmAction = async (title, text, confirmText = 'Ya', type = 'warning') => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: type,
    showCancelButton: true,
    confirmButtonColor: type === 'danger' || type === 'error' ? '#DC2626' : '#2563EB',
    cancelButtonColor: '#6B7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal'
  });
  return result.isConfirmed;
};
