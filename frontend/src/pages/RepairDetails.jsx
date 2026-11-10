import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repairApi } from '../api/client';
import { useAuth } from '../auth/useAuth';
import StatusBadge from '../components/StatusBadge';

const dateTime = (value) => value ? new Date(value).toLocaleString() : '—';

export default function RepairDetails() {
  const { id } = useParams(); const { user } = useAuth();
  const [repair, setRepair] = useState(null); const [history, setHistory] = useState([]); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [remarks, setRemarks] = useState(''); const [estimate, setEstimate] = useState('');
  const load = useCallback(async (isMounted = () => true) => {
    const [record, events] = await Promise.all([repairApi.getById(id), repairApi.getHistory(id)]);
    if (!isMounted()) return;
    setRepair(record); setHistory(events || []); setEstimate(record.estimatedCost ?? '');
  }, [id]);
  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      try {
        await load(() => mounted);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    Promise.resolve().then(loadInitial);
    return () => { mounted = false; };
  }, [load]);

  async function perform(action, successMessage) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); await load(); setNotice(successMessage); setRemarks(''); }
    catch (err) { setError(err.message || 'The operation failed.'); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="loading-state">Loading repair record…</div>;
  if (error && !repair) return <><div className="alert error">{error}</div><Link className="secondary-button" to="-1">Go back</Link></>;
  if (!repair) return <div className="empty-state">Repair record not found.</div>;

  const isTechnician = user.role === 'TECHNICIAN' || user.role === 'LEAD_TECH'; const isAdmin = user.role === 'ADMIN'; const isCustomer = user.role === 'CUSTOMER';
  const nextStatus = { RECEIVED: 'DIAGNOSING', IN_REPAIR: 'READY_FOR_PICKUP', READY_FOR_PICKUP: 'COMPLETED' }[repair.status];
  const nextLabel = { DIAGNOSING: 'Start diagnosis', READY_FOR_PICKUP: 'Mark ready for pickup', COMPLETED: 'Mark completed' }[nextStatus];

  return <><div className="page-heading"><div><div className="eyebrow">REPAIR RECORD / {repair.ticketId}</div><h1>{repair.deviceName}</h1><p>{repair.deviceType} · Created {dateTime(repair.createdAt)}</p></div><div className="heading-actions"><StatusBadge status={repair.status} /><Link className="secondary-button" to={user.role === 'ADMIN' ? '/admin' : user.role === 'TECHNICIAN' ? '/technician' : user.role === 'LEAD_TECH' ? '/lead-tech' : '/customer'}>← Dashboard</Link></div></div>
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <div className="detail-grid"><section className="panel detail-main"><div className="panel-heading"><div><h2>Repair information</h2><p>Request details and service actions.</p></div></div><div className="detail-fields"><Field label="Ticket ID" value={repair.ticketId} /><Field label="Customer" value={repair.customerName} /><Field label="Assigned technician" value={repair.technicianName || 'Not assigned'} /><Field label="Estimated cost" value={repair.estimatedCost == null ? 'Not yet estimated' : `₹${Number(repair.estimatedCost).toLocaleString('en-IN')}`} /><Field label="Created" value={dateTime(repair.createdAt)} /><Field label="Last updated" value={dateTime(repair.updatedAt)} /></div><div className="description-block"><span className="field-label">Problem description</span><p>{repair.problemDescription}</p></div>
      {(isTechnician || isAdmin) && <div className="action-section"><h3>Technician workflow</h3>{repair.status === 'DIAGNOSING' && (isTechnician || isAdmin) && <form className="inline-action" onSubmit={e => { e.preventDefault(); if (Number(estimate) <= 0) return setError('Enter an estimate greater than zero.'); perform(() => repairApi.submitEstimate(id, estimate), 'Estimate submitted for customer approval.'); }}><label>Estimated cost (INR)<input type="number" min="0.01" step="0.01" value={estimate} onChange={e => setEstimate(e.target.value)} required /></label><label>Diagnosis remarks<textarea rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Diagnosis and recommended repair…" /></label><button className="primary-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit estimate'}</button></form>}
        {nextStatus && (isAdmin || isTechnician) && repair.status !== 'RECEIVED' || (nextStatus && repair.status === 'RECEIVED' && (isTechnician || isAdmin)) ? <div className="inline-action"><label>Work remarks<textarea rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add an optional update for the service history…" /></label><button className="primary-button" disabled={busy} onClick={() => perform(() => repairApi.updateStatus(id, nextStatus, remarks), `Status updated to ${nextStatus.replaceAll('_', ' ').toLowerCase()}.`)}>{busy ? 'Updating…' : (nextLabel || `Move to ${nextStatus}`)}</button></div> : null}
        {repair.status === 'DIAGNOSING' && isAdmin && <p className="muted">The assigned technician must submit the estimate.</p>}</div>}
      {(isCustomer || isAdmin) && repair.status === 'AWAITING_APPROVAL' && <div className="action-section approval-box"><h3>Estimate approval required</h3><p>The proposed repair estimate is <strong>₹{Number(repair.estimatedCost || 0).toLocaleString('en-IN')}</strong>. Approving moves the request into repair; rejecting cancels it.</p><div className="button-row"><button className="primary-button" disabled={busy} onClick={() => perform(() => repairApi.approveEstimate(id, true), 'Estimate approved. The repair can now proceed.')}>Approve estimate</button><button className="danger-button" disabled={busy} onClick={() => perform(() => repairApi.approveEstimate(id, false), 'Estimate rejected. The request has been cancelled.')}>Reject estimate</button></div></div>}
    </section><section className="panel history-panel"><div className="panel-heading"><div><h2>Service history</h2><p>Recorded status changes and remarks.</p></div></div>{history.length ? <div className="timeline">{history.map(item => <div className="timeline-item" key={item.id}><span className="timeline-dot" /><div><StatusBadge status={item.status} /><time>{dateTime(item.createdAt)}</time><p>{item.remarks || 'Status updated'}</p><small>{item.updatedBy || 'System'}</small></div></div>)}</div> : <div className="empty-state compact">No history entries available.</div>}</section></div>
  </>;
}
function Field({ label, value }) { return <div className="detail-field"><span className="field-label">{label}</span><strong>{value || '—'}</strong></div>; }
