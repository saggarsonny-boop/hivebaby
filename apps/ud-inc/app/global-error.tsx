'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#fafaf8',
          color: '#1e2d3d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          margin: 0,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            border: '1px solid #e0ddd6',
            borderRadius: '12px',
            maxWidth: '440px',
            background: '#f2f1ee',
          }}
        >
          <h2
            style={{
              color: '#c8960a',
              marginBottom: '1rem',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Something went wrong
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>
            The page hit an error. Try again, or head back to the Universal Document™ home.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#c8960a',
              color: '#fafaf8',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
