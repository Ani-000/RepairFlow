
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, repairApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import {
  MetricSkeleton,
  TableSkeleton
} from '../../components/LoadingSkeleton';

export default function LeadTechDashboard() {
  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selection, setSelection] = useState({});

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(isMounted = () => true, showSkeleton = false) {
    if (showSkeleton) setLoading(true);

    try {
      const [items, staff] = await Promise.all([
        repairApi.getMine(),
        adminApi.getTechnicians()
      ]);

      if (isMounted()) {
        setRepairs(items);
        setTechnicians(staff);
      }
    } catch (e) {
      if (isMounted()) setError(e.message);
    } finally {
      if (isMounted()) setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      await load(() => mounted, true);
    };

    Promise.resolve().then(loadInitial);

    return () => {
      mounted = false;
    };
  }, []);

  async function assign(id) {
    if (!selection[id]) return;

    try {
      await adminApi.assignTechnician(id, selection[id]);

      setNotice('Technician assigned successfully.');
      setError('');
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const unassigned = repairs.filter(
    r => !r.technicianName && r.status !== 'CANCELLED'
  ).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">LEAD TECHNICIAN</div>
          <h1>Assignment workspace</h1>
          <p>
            Review incoming repairs and assign technicians to
            service requests.
          </p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      {loading ? (
        <MetricSkeleton count={3} />
      ) : (
        <div className="metric-grid three">
          <Metric label="All repairs" value={repairs.length} />
          <Metric label="Unassigned" value={unassigned} />
          <Metric label="Technicians" value={technicians.length} />
        </div>
      )}

      {!loading && technicians.length < 2 && (
        <div className="alert error">
          At least two technician profiles are required.
          Ask ADMIN to create the remaining profiles.
        </div>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Repair assignments</h2>
            <p>
              Assign or reassign a technician to each repair.
            </p>
          </div>

          <span className="count-pill">
            {repairs.length} records
          </span>
        </div>

        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Device</th>
                  <th>Status</th>
                  <th>Assigned technician</th>
                  <th>Assign</th>
                </tr>
              </thead>

              <tbody>
                {repairs.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state compact">
                        No repair requests are available.
                      </div>
                    </td>
                  </tr>
                ) : (
                  repairs.map(r => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/repairs/${r.id}`}>
                          {r.ticketId}
                        </Link>
                      </td>

                      <td>{r.deviceName}</td>

                      <td>
                        <StatusBadge status={r.status} />
                      </td>

                      <td>
                        {r.technicianName || 'Unassigned'}
                      </td>

                      <td>
                        <div className="assign-control">
                          <select
                            aria-label={`Select technician for ${r.ticketId}`}
                            value={selection[r.id] || ''}
                            onChange={e =>
                              setSelection(v => ({
                                ...v,
                                [r.id]: e.target.value
                              }))
                            }
                          >
                            <option value="">
                              Select technician
                            </option>

                            {technicians.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="small-button"
                            disabled={!selection[r.id]}
                            onClick={() => assign(r.id)}
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}
