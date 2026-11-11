
export function MetricSkeleton({ count = 4 }) {
  return (
    <div
      className={`metric-grid${count === 3 ? ' three' : ''}`}
      role="status"
      aria-label="Loading dashboard metrics"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="metric-card skeleton-card" key={index}>
          <div className="skeleton skeleton-label" />
          <div className="skeleton skeleton-value" />
          <div className="skeleton skeleton-note" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div
      className="table-wrap skeleton-table-wrap"
      role="status"
      aria-label="Loading table data"
    >
      <div
        className="skeleton-table"
        style={{ '--skeleton-columns': columns }}
      >
        <div className="skeleton-table-header">
          {Array.from({ length: columns }, (_, index) => (
            <div className="skeleton skeleton-cell" key={index} />
          ))}
        </div>

        {Array.from({ length: rows }, (_, row) => (
          <div className="skeleton-table-row" key={row}>
            {Array.from({ length: columns }, (_, column) => (
              <div className="skeleton skeleton-cell" key={column} />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading data</span>
    </div>
  );
}
