import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, repairApi } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import StatusBadge from '../../components/StatusBadge';
import {
  MetricSkeleton,
  TableSkeleton
} from '../../components/LoadingSkeleton';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'TECHNICIAN'
};

const EMPLOYEE_ROLES = ['TECHNICIAN', 'LEAD_TECH'];

function roleLabel(role) {
  if (role === 'LEAD_TECH') return 'Lead technician';
  if (role === 'TECHNICIAN') return 'Technician';
  if (role === 'ADMIN') return 'Administrator';
  return 'Customer';
}

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

  async function load(isMounted = () => true, showSkeleton = false) {
    if (showSkeleton) setLoading(true);
    setError('');

    try {
      const [allRepairs, staff, allUsers] = await Promise.all([
        repairApi.getMine(),
        adminApi.getTechnicians(),
        adminApi.getUsers()
      ]);

      if (isMounted()) {
        setRepairs(allRepairs);
        setTechnicians(staff);
        setUsers(allUsers);
      }
    } catch (e) {
      if (isMounted()) {
        setError(e.message || 'Could not load admin workspace.');
      }
    } finally {
      if (isMounted()) setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    Promise.resolve().then(() => load(() => mounted, true));

    return () => {
      mounted = false;
    };
  }, []);

  const employees = useMemo(
    () => users.filter(account => EMPLOYEE_ROLES.includes(account.role)),
    [users]
  );

  const customers = useMemo(
    () => users.filter(account => account.role === 'CUSTOMER'),
    [users]
  );

  const administrators = useMemo(
    () => users.filter(account => account.role === 'ADMIN'),
    [users]
  );

  async function assign(repairId) {
    if (!assignments[repairId]) return;

    try {
      await adminApi.assignTechnician(repairId, assignments[repairId]);
      setNotice('Technician assigned.');
      setError('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not assign technician.');
    }
  }

  async function createStaff(event) {
    event.preventDefault();

    if (!EMPLOYEE_ROLES.includes(form.role)) {
      setError('Only Technician and Lead Technician accounts can be created here.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await adminApi.createStaff(form);
      setForm(emptyForm);
      setNotice(
        `${form.role === 'LEAD_TECH' ? 'Lead technician' : 'Technician'} profile created.`
      );
      await load();
    } catch (e) {
      setError(e.message || 'Could not create staff profile.');
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(id, role) {
    if (!EMPLOYEE_ROLES.includes(role)) {
      setError('Employees can only be assigned Technician or Lead Technician roles.');
      return;
    }

    const target = employees.find(employee => employee.id === id);
    if (!target) {
      setError('Only existing employee accounts can have their roles changed.');
      return;
    }

    try {
      await adminApi.updateRole(id, role);
      setNotice('Employee role updated.');
      setError('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not update employee role.');
    }
  }

  async function deleteUser(id, accountType) {
    const message = accountType === 'customer'
      ? 'Delete this customer? Their associated repair records and history will also be deleted.'
      : 'Delete this employee? Their associated repair records and history will also be deleted.';

    if (!window.confirm(message)) return;

    try {
      await adminApi.deleteUser(id);
      setNotice(`${accountType === 'customer' ? 'Customer' : 'Employee'} deleted.`);
      setError('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not delete user.');
    }
  }

  async function deleteRepair(id) {
    if (!window.confirm('Permanently delete this repair and its history?')) return;

    try {
      await adminApi.deleteRepair(id);
      setNotice('Repair deleted.');
      setError('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not delete repair.');
    }
  }

  const active = repairs.filter(
    repair => !['COMPLETED', 'CANCELLED'].includes(repair.status)
  ).length;

  const unassigned = repairs.filter(
    repair => !repair.technicianName && repair.status !== 'CANCELLED'
  ).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION</div>
          <h1>Operations overview</h1>
          <p>Full control of users, repair requests and technician assignments.</p>
        </div>
        <div className="admin-greeting">
          Signed in as <strong>{user.name}</strong>
        </div>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}

      {loading ? (
        <MetricSkeleton count={4} />
      ) : (
        <div className="metric-grid">
          <Metric label="Total repairs" value={repairs.length} />
          <Metric label="Active repairs" value={active} />
          <Metric label="Unassigned" value={unassigned} />
          <Metric label="Technicians" value={technicians.length} />
        </div>
      )}

      <section className="panel staff-panel">
        <div className="panel-heading">
          <div>
            <h2>Create staff profile</h2>
            <p>
              Create Technician and Lead Technician accounts. Customers self-register
              and administrator accounts are protected.
            </p>
          </div>
        </div>

        <form className="form-grid staff-form" onSubmit={createStaff}>
          <label>
            <span>Full name</span>
            <input
              type="text"
              placeholder="Enter full name"
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label>
            <span>Email address</span>
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={form.email}
              onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label>
            <span>Temporary password</span>
            <input
              type="password"
              placeholder="Enter a temporary password"
              required
              minLength={8}
              maxLength={72}
              value={form.password}
              onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label>
            <span>Employee role</span>
            <select
              value={form.role}
              onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
            >
              <option value="TECHNICIAN">Technician</option>
              <option value="LEAD_TECH">Lead Technician</option>
            </select>
          </label>

          <button type="submit" className="primary-button staff-submit" disabled={saving}>
            {saving ? 'Creating profile…' : 'Create profile'}
          </button>
        </form>

        <p className="muted staff-requirement">
          Technicians currently registered: {technicians.length}. Minimum required: 2.
        </p>
      </section>

      <section className="panel repair-operations-panel">
        <div className="panel-heading">
          <div>
            <h2>Repair operations</h2>
            <p>Assign technicians, inspect and delete repair records.</p>
          </div>
          <span className="count-pill">{repairs.length} records</span>
        </div>

        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : (
          <div className="table-wrap">
            <table className="data-table repair-operations-table">
              <thead>
                <tr>
                  <th>Ticket / Device</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Assignment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {repairs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state compact">No repair records found.</div>
                    </td>
                  </tr>
                ) : repairs.map(repair => (
                  <tr key={repair.id}>
                    <td>
                      <Link className="ticket-link" to={`/repairs/${repair.id}`}>
                        {repair.ticketId}
                      </Link>
                      <div className="muted table-subtext">{repair.deviceName}</div>
                    </td>
                    <td>{repair.customerName || '—'}</td>
                    <td><StatusBadge status={repair.status} /></td>
                    <td>{repair.technicianName || 'Unassigned'}</td>
                    <td>
                      <div className="assign-control">
                        <select
                          aria-label={`Select technician for ${repair.ticketId}`}
                          value={assignments[repair.id] || ''}
                          onChange={event => setAssignments(current => ({
                            ...current,
                            [repair.id]: event.target.value
                          }))}
                        >
                          <option value="">Select technician</option>
                          {technicians.map(technician => (
                            <option key={technician.id} value={technician.id}>
                              {technician.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="small-button"
                          disabled={!assignments[repair.id]}
                          onClick={() => assign(repair.id)}
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="repair-row-actions">
                        <Link className="table-action" to={`/repairs/${repair.id}`}>View</Link>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => deleteRepair(repair.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel user-management-panel">
        <div className="panel-heading">
          <div>
            <h2>Employee management</h2>
            <p>Only employee accounts can be switched between Technician and Lead Technician.</p>
          </div>
          <span className="count-pill">{employees.length} employees</span>
        </div>

        {loading ? (
          <TableSkeleton columns={4} rows={4} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Employee role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state compact">No employee accounts found.</div>
                    </td>
                  </tr>
                ) : employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>
                      <select
                        aria-label={`Change employee role for ${employee.name}`}
                        value={employee.role}
                        onChange={event => updateRole(employee.id, event.target.value)}
                      >
                        <option value="TECHNICIAN">Technician</option>
                        <option value="LEAD_TECH">Lead Technician</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => deleteUser(employee.id, 'employee')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel customer-management-panel">
        <div className="panel-heading">
          <div>
            <h2>Customer details</h2>
            <p>Customer accounts are read-only here. Customers cannot be converted into employees.</p>
          </div>
          <span className="count-pill">{customers.length} customers</span>
        </div>

        {loading ? (
          <TableSkeleton columns={3} rows={4} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Account type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state compact">No customer accounts found.</div>
                    </td>
                  </tr>
                ) : customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td><span className="role-label customer-role">Customer</span></td>
                    <td>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => deleteUser(customer.id, 'customer')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {administrators.length > 0 && (
        <section className="panel protected-admin-panel">
          <div className="panel-heading">
            <div>
              <h2>Protected administrator account</h2>
              <p>Administrator role changes and deletion are disabled.</p>
            </div>
            <span className="count-pill">Protected</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Account status</th></tr>
              </thead>
              <tbody>
                {administrators.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td><span className="role-label admin-role">{roleLabel(admin.role)}</span></td>
                    <td>Protected account</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon" aria-hidden="true">▦</span>
      </div>
      <strong>{value}</strong>
      <small>Live database data</small>
    </div>
  );
}
