import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm(current => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await authApi.register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/login', { replace: true, state: { email: form.email.trim() } });
    } catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page register-page"><section className="auth-visual"><div className="auth-brand"><span className="brand-mark">R</span> Repair<span className="brand-accent">Flow</span></div><div className="visual-content"><div className="eyebrow light">CUSTOMER PORTAL</div><h1>Service that<br /><span>keeps moving.</span></h1><p>Create a customer account to submit repair requests and follow every stage of the service process.</p></div><div className="visual-footer">REPAIRFLOW SERVICE MANAGEMENT</div></section><section className="auth-panel"><form className="auth-card" onSubmit={handleSubmit}><div className="eyebrow">GET STARTED</div><h2>Create your account</h2><p className="form-subtitle">Customer accounts can be created here.</p>{error && <div className="alert error">{error}</div>}<label>Full name<input value={form.name} onChange={update('name')} minLength="2" maxLength="100" autoComplete="name" required /></label><label>Email address<input type="email" value={form.email} onChange={update('email')} maxLength="254" autoComplete="email" required /></label><label>Password<input type="password" value={form.password} onChange={update('password')} minLength="8" maxLength="72" autoComplete="new-password" required /><small>Use at least 8 characters.</small></label><button className="primary-button full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>→</span></button><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></form><div className="auth-legal">Technician and admin accounts are provisioned separately.</div></section></div>;
}
