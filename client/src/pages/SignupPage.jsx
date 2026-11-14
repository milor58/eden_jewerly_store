import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

// Same rules as the server (the server checks again).
export function validateSignup(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (form.password !== form.confirm) errors.confirm = 'Passwords do not match';
  if (form.phone && !/^[+\d][\d\s()-]{5,19}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  return errors;
}

export default function SignupPage() {
  const { token, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);

  if (token) return <Navigate to={from} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateSignup(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSending(true);
    setServerError('');
    try {
      const { confirm: _confirm, ...body } = form;
      await signup({ ...body, name: body.name.trim(), email: body.email.trim(), phone: body.phone.trim() });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSending(false);
    }
  };

  const field = (name, label, type = 'text', autoComplete) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} value={form[name]} onChange={onChange} aria-invalid={Boolean(errors[name])} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <main className="page container auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="eyebrow">Join Eden</p>
        <h1 className="page-title">Create an account</h1>
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('phone', 'Phone (optional)', 'tel', 'tel')}
        {field('password', 'Password (8+ characters)', 'password', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'new-password')}
        {serverError && (
          <p className="notice notice-warn" role="alert">
            {serverError}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
          {sending ? 'Creating…' : 'Create account'}
        </button>
        <p className="muted small">
          Already have an account?{' '}
          <Link to="/login" state={{ from }}>
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
