import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, repairApi } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { name: '', email: '', password: '', role: 'TECHNICIAN' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load(isMounted = () => true) {
    setLoading(true); setError('');
    try {
      const [allRepairs, staff, allUsers] = await Promise.all([
        repairApi.getMine(), adminApi.getTechnicians(), adminApi.getUsers()
      ]);
      if (isMounted()) {
        setRepairs(allRepairs); setTechnicians(staff); setUsers(allUsers);
      }
    } catch (e) { if (isMounted()) setError(e.message || 'Could not load admin workspace.'); }
    finally { if (isMounted()) setLoading(false); }
  }
  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      await load(() => mounted);
    };
    Promise.resolve().then(loadInitial);
    return () => { mounted = false; };
  }, []);

  async function assign(repairId) {
    try { await adminApi.assignTechnician(repairId, assignments[repairId]); setNotice('Technician assigned.'); await load(); }
    catch (e) { setError(e.message); }
  }
  async function createStaff(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await adminApi.createStaff(form);
      setForm(emptyForm); setNotice(`${form.role === 'LEAD_TECH' ? 'Lead technician' : 'Technician'} profile created.`);
      await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function updateRole(id, role) {
    try { await adminApi.updateRole(id, role); setNotice('User role updated.'); await load(); }
    catch (e) { setError(e.message); }
  }
  async function deleteUser(id) {
    if (!window.confirm('Delete this user? Their associated repair records and history will also be deleted.')) return;
    try { await adminApi.deleteUser(id); setNotice('User deleted.'); await load(); }
    catch (e) { setError(e.message); }
  }
  async function deleteRepair(id) {
    if (!window.confirm('Permanently delete this repair and its history?')) return;
    try { await adminApi.deleteRepair(id); setNotice('Repair deleted.'); await load(); }
    catch (e) { setError(e.message); }
  }

  const active = repairs.filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const unassigned = repairs.filter(r => !r.technicianName && r.status !== 'CANCELLED').length;

  return <>
    <div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Operations overview</h1><p>Full control of users, repair requests and technician assignments.</p></div><div className="admin-greeting">Signed in as <strong>{user.name}</strong></div></div>
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <div className="metric-grid"><Metric label="Total repairs" value={repairs.length}/><Metric label="Active repairs" value={active}/><Metric label="Unassigned" value={unassigned}/><Metric label="Technicians" value={technicians.length}/></div>

    <section className="panel"><div className="panel-heading"><div><h2>Create staff profile</h2><p>Create lead technician and technician accounts. Customer accounts self-register; the predefined admin account is not created here.</p></div></div>
      <form className="form-grid" onSubmit={createStaff}>
        <label>Full name<input required minLength="2" maxLength="100" value={form.name} onChange={e => setForm(v => ({...v,name:e.target.value}))}/></label>
        <label>Email<input required type="email" value={form.email} onChange={e => setForm(v => ({...v,email:e.target.value}))}/></label>
        <label>Temporary password<input required type="password" minLength="8" maxLength="72" value={form.password} onChange={e => setForm(v => ({...v,password:e.target.value}))}/></label>
        <label>Role<select value={form.role} onChange={e => setForm(v => ({...v,role:e.target.value}))}><option value="TECHNICIAN">Technician</option><option value="LEAD_TECH">Lead Technician</option></select></label>
        <button className="primary-button" disabled={saving}>{saving ? 'Creating…' : 'Create profile'}</button>
      </form>
      <p className="muted">Technicians currently registered: {technicians.length}. Minimum required: 2.</p>
    </section>

    <section className="panel"><div className="panel-heading"><div><h2>Repair operations</h2><p>Assign technicians, inspect and delete repair records.</p></div><span className="count-pill">{repairs.length} records</span></div>
      {loading ? <div className="loading-state">Loading operations…</div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Ticket / Device</th><th>Customer</th><th>Status</th><th>Technician</th><th>Assignment</th><th>Actions</th></tr></thead><tbody>{repairs.map(r => <tr key={r.id}><td><Link to={`/repairs/${r.id}`}>{r.ticketId}</Link><div className="muted table-subtext">{r.deviceName}</div></td><td>{r.customerName || '—'}</td><td><StatusBadge status={r.status}/></td><td>{r.technicianName || 'Unassigned'}</td><td><div className="assign-control"><select value={assignments[r.id] || ''} onChange={e => setAssignments(v => ({...v,[r.id]:e.target.value}))}><option value="">Select technician</option>{technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select><button className="small-button" disabled={!assignments[r.id]} onClick={() => assign(r.id)}>Assign</button></div></td><td><Link className="table-action" to={`/repairs/${r.id}`}>View</Link> <button className="danger-button" onClick={() => deleteRepair(r.id)}>Delete</button></td></tr>)}</tbody></table></div>}
    </section>

    <section className="panel"><div className="panel-heading"><div><h2>User management</h2><p>Manage staff accounts. The predefined administrator cannot be deleted.</p></div><span className="count-pill">{users.length} users</span></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role === 'ADMIN' ? 'ADMIN' : <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}><option value="CUSTOMER">Customer</option><option value="LEAD_TECH">Lead technician</option><option value="TECHNICIAN">Technician</option></select>}</td><td>{u.role !== 'ADMIN' && <button className="danger-button" onClick={() => deleteUser(u.id)}>Delete</button>}</td></tr>)}</tbody></table></div>
    </section>
  </>;
}
function Metric({label,value}) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon">▦</span></div><strong>{value}</strong><small>Live database data</small></div>; }
