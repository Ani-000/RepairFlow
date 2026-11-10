import { useAuth } from '../auth/useAuth';
import { homeForRole } from '../auth/roles';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const home = homeForRole(user.role);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to={home} className="brand">
          <span className="brand-mark">R</span>
          <span>Repair<span className="brand-accent">Flow</span></span>
        </NavLink>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to={home} end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">▦</span> Overview
          </NavLink>
          {(user.role === 'CUSTOMER' || user.role === 'ADMIN') && <NavLink to="/repairs/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><span className="nav-icon">＋</span> New repair</NavLink>}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-chip">
            <div className="avatar">{(user.name || user.email || 'U').slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><strong>{user.name || 'User'}</strong><span>{user.role}</span></div>
          </div>
          <button className="logout-button" onClick={signOut}>↪ <span>Sign out</span></button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {user.role.charAt(0) + user.role.slice(1).toLowerCase()}</div>
          <div className="topbar-right"><span className="online-dot" /> System operational</div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
