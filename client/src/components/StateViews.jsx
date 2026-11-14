/* © 2026 Eden Jewelry. All rights reserved. */
// Small shared views for the loading / error / empty states.

export function Loader({ label = 'Loading' }) {
  return (
    <div className="loader" role="status">
      <span className="loader-ring" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-box" role="alert">
      <p>{error.message || String(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
