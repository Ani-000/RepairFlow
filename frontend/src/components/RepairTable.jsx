import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function RepairTable({ repairs = [], role = 'CUSTOMER', emptyMessage = 'No repair requests found.' }) {
  if (!repairs.length) return <div className="empty-state"><div className="empty-icon">▤</div><strong>Nothing here yet</strong><p>{emptyMessage}</p></div>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Ticket</th><th>Device</th>{role !== 'CUSTOMER' && <th>Customer</th>}{role !== 'TECHNICIAN' && <th>Technician</th>}<th>Status</th><th>Last updated</th><th /></tr></thead>
        <tbody>{repairs.map((repair) => (
          <tr key={repair.id}>
            <td><Link className="ticket-link" to={`/repairs/${repair.id}`}>{repair.ticketId}</Link></td>
            <td><div className="device-cell"><strong>{repair.deviceName}</strong><span>{repair.deviceType}</span></div></td>
            {role !== 'CUSTOMER' && <td>{repair.customerName || '—'}</td>}
            {role !== 'TECHNICIAN' && <td>{repair.technicianName || <span className="muted">Unassigned</span>}</td>}
            <td><StatusBadge status={repair.status} /></td>
            <td className="muted">{repair.updatedAt ? new Date(repair.updatedAt).toLocaleDateString() : '—'}</td>
            <td><Link className="table-action" to={`/repairs/${repair.id}`}>View →</Link></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
