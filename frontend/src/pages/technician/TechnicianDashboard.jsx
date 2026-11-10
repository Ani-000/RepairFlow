import { useEffect, useState } from 'react';
import { repairApi } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import RepairTable from '../../components/RepairTable';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { repairApi.getMine().then(setRepairs).catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);
  const active = repairs.filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const diagnosis = repairs.filter(r => r.status === 'RECEIVED' || r.status === 'DIAGNOSING').length;
  const approval = repairs.filter(r => r.status === 'AWAITING_APPROVAL').length;
  return <><div className="page-heading"><div><div className="eyebrow">TECHNICIAN WORKSPACE</div><h1>Work queue</h1><p>Welcome, {user.name}. Review assignments and move repairs through the service process.</p></div></div>{error && <div className="alert error">{error}</div>}<div className="metric-grid three"><Metric label="Assigned repairs" value={repairs.length} /><Metric label="Active work" value={active} /><Metric label="Diagnosis required" value={diagnosis} /></div><section className="panel"><div className="panel-heading"><div><h2>Assigned to me</h2><p>Only repairs assigned to your technician account are listed.</p></div><span className="count-pill">{approval} awaiting customer approval</span></div>{loading ? <div className="loading-state">Loading assignments…</div> : <RepairTable repairs={repairs} role="TECHNICIAN" emptyMessage="No repairs have been assigned to you." />}</section></>;
}
function Metric({ label, value }) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon">▦</span></div><strong>{value}</strong><small>Current workload</small></div>; }
