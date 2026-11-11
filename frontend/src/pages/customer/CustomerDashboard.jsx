
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { repairApi } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import RepairTable from '../../components/RepairTable';
import {
  MetricSkeleton,
  TableSkeleton
} from '../../components/LoadingSkeleton';

export default function CustomerDashboard() {
  const { user } = useAuth();

  const [repairs, setRepairs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    repairApi.getMine()
      .then(items => {
        if (mounted) setRepairs(items);
      })
      .catch(err => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const active = repairs.filter(
    r => !['COMPLETED', 'CANCELLED'].includes(r.status)
  ).length;

  const awaiting = repairs.filter(
    r => r.status === 'AWAITING_APPROVAL'
  ).length;

  const completed = repairs.filter(
    r => r.status === 'COMPLETED'
  ).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CUSTOMER WORKSPACE</div>
          <h1>
            Welcome, {user.name?.split(' ')[0] || 'back'}
          </h1>
          <p>
            Track your service requests and review repair updates.
          </p>
        </div>

        <Link className="primary-button" to="/repairs/new">
          <span>＋</span>
          New repair request
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <MetricSkeleton count={4} />
      ) : (
        <div className="metric-grid">
          <Metric
            label="Total requests"
            value={repairs.length}
            note="All time"
            icon="▤"
          />

          <Metric
            label="In progress"
            value={active}
            note="Active service requests"
            icon="◷"
          />

          <Metric
            label="Awaiting approval"
            value={awaiting}
            note="Your action may be needed"
            icon="⌁"
          />

          <Metric
            label="Completed"
            value={completed}
            note="Successfully returned"
            icon="✓"
          />
        </div>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Your repair requests</h2>
            <p>
              Recent service activity and current status.
            </p>
          </div>

          <span className="count-pill">
            {repairs.length} total
          </span>
        </div>

        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          <RepairTable
            repairs={repairs}
            role="CUSTOMER"
            emptyMessage="Create your first repair request to see it tracked here."
          />
        )}
      </section>
    </>
  );
}

function Metric({ label, value, note, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
