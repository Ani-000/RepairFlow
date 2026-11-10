import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { homeForRole } from '../auth/roles';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const account = await login(email.trim(), password);
      navigate(location.state?.from || homeForRole(account.role), { replace: true });
    } catch (err) { setError(err.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="brand-mark">R</span> Repair<span className="brand-accent">Flow</span></div>
        <div className="visual-content"><div className="eyebrow light">REPAIR OPERATIONS, SIMPLIFIED</div><h1>Every repair.<br /><span>Under control.</span></h1><p>A single workspace to manage service requests, track progress and keep customers informed.</p><div className="visual-stats"><div><strong>01</strong><span>One repair workspace</span></div><div><strong>03</strong><span>Role-based portals</span></div><div><strong>∞</strong><span>Clear service history</span></div></div></div>
        <div className="visual-footer">REPAIRFLOW SERVICE MANAGEMENT</div>
      </section>
      <section className="auth-panel"><form className="auth-card" onSubmit={handleSubmit}>
        <div className="eyebrow">WELCOME BACK</div><h2>Sign in to RepairFlow</h2><p className="form-subtitle">Enter your account credentials to continue.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required /></label>
        <button className="primary-button full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>→</span></button>
        <p className="auth-switch">New to RepairFlow? <Link to="/register">Create an account</Link></p>
      </form><div className="auth-legal">Secure access · Role-based permissions</div></section>
    </div>
  );
}
