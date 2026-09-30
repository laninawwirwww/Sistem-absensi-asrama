export default function LoadingPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        gap: 'var(--space-4)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid var(--color-gray-200)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
        Memuat...
      </p>
    </div>
  );
}
