const labels = {
  RECEIVED: 'Received',
  DIAGNOSING: 'Diagnosing',
  AWAITING_APPROVAL: 'Awaiting approval',
  IN_REPAIR: 'In repair',
  READY_FOR_PICKUP: 'Ready for pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status }) {
  const className = String(status || 'unknown').toLowerCase().replaceAll('_', '-');
  return <span className={`status-badge status-${className}`}>{labels[status] || status || 'Unknown'}</span>;
}
