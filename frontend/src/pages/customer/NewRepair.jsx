import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { repairApi } from '../../api/client';
import { useAuth } from '../../auth/useAuth';

export default function NewRepair() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const home = user?.role === 'ADMIN' ? '/admin' : '/customer';
  const [form, setForm] = useState({ deviceType: 'Laptop', deviceName: '', problemDescription: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm(current => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const repair = await repairApi.create({ ...form, deviceName: form.deviceName.trim(), problemDescription: form.problemDescription.trim() });
      navigate(`/repairs/${repair.id}`, { replace: true, state: { created: true } });
    } catch (err) { setError(err.message || 'Could not create repair request.'); }
    finally { setBusy(false); }
  }

  return <><div className="page-heading"><div><div className="eyebrow">CUSTOMER WORKSPACE / NEW REQUEST</div><h1>New repair request</h1><p>Provide the device details and describe the issue.</p></div><Link className="secondary-button" to={home}>← Back to dashboard</Link></div><section className="form-panel"><form onSubmit={submit}><div className="section-title"><span className="step-number">01</span><div><h2>Device information</h2><p>Identify the device that needs service.</p></div></div>{error && <div className="alert error">{error}</div>}<div className="form-grid"><label>Device type<select value={form.deviceType} onChange={update('deviceType')} required><option>Laptop</option><option>Desktop</option><option>Mobile phone</option><option>Tablet</option><option>Monitor</option><option>Printer</option><option>Other</option></select></label><label>Device name / model<input value={form.deviceName} onChange={update('deviceName')} placeholder="e.g. HP Pavilion 15" maxLength="120" required /></label></div><div className="section-title section-gap"><span className="step-number">02</span><div><h2>Problem description</h2><p>Describe the symptoms and any relevant details.</p></div></div><label>What seems to be wrong?<textarea value={form.problemDescription} onChange={update('problemDescription')} rows="5" maxLength="2000" placeholder="Describe the issue, when it started, and any troubleshooting already attempted…" required /></label><div className="form-footer"><span>You'll receive a unique ticket ID after submission.</span><button className="primary-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit repair request'} <span>→</span></button></div></form></section></>;
}
