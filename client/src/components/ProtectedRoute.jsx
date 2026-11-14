import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Loader } from './StateViews.jsx';

// <ProtectedRoute>            -> must be logged in
// <ProtectedRoute adminOnly>  -> must be the workshop owner (admin)
// The API checks this again on every request; this only hides the page.
export default function ProtectedRoute({ adminOnly = false, children }) {
  const { token, user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (loading || (adminOnly && !user)) {
    return (
      <main className="page container">
        <Loader label="Checking your account" />
      </main>
    );
  }
  if (adminOnly && !isAdmin) {
    return (
      <main className="page container">
        <h1 className="page-title">Not allowed</h1>
        <p className="muted">This page is only for the workshop owner.</p>
      </main>
    );
  }
  return children;
}
