import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (token) return <Navigate to={from} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <main className="page container auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title">Log in</h1>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} />
        </label>
        {error && (
          <p className="notice notice-warn" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
          {sending ? 'Logging in…' : 'Log in'}
        </button>
        <p className="muted small">
          New here?{' '}
          <Link to="/signup" state={{ from }}>
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
