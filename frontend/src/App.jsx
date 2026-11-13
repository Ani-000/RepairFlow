
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { homeForRole } from './auth/roles';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewRepair from './pages/customer/NewRepair';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import LeadTechDashboard from './pages/lead/LeadTechDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RepairDetails from './pages/RepairDetails';
import NotFound from './pages/NotFound';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const THEME_STORAGE_KEY = 'repairflow-theme';
const VALID_THEMES = ['light', 'dark', 'system'];

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function ThemeControl({ theme, setTheme }) {
  return (
    <div className="theme-control">
      <label className="sr-only" htmlFor="repairflow-theme">
        Colour theme
      </label>

      <span className="theme-control-icon" aria-hidden="true">
        {theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}
      </span>

      <select
        id="repairflow-theme"
        value={theme}
        onChange={event => setTheme(event.target.value)}
        aria-label="Choose application colour theme"
      >
        <option value="light">Light mode</option>
        <option value="dark">Dark mode</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();

  return (
    <Navigate
      to={user ? homeForRole(user.role) : '/login'}
      replace
    />
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const nextTheme =
        theme === 'system' ? getSystemTheme() : theme;

      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
    };

    applyTheme();

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The selected theme still works for the current session.
    }

    if (theme !== 'system' || !window.matchMedia) {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => applyTheme();

    if (media.addEventListener) {
      media.addEventListener('change', handleSystemChange);

      return () =>
        media.removeEventListener('change', handleSystemChange);
    }

    media.addListener(handleSystemChange);

    return () =>
      media.removeListener(handleSystemChange);
  }, [theme]);

  return (
    <>
      <ThemeControl theme={theme} setTheme={setTheme} />

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route element={<ProtectedRoute roles={['CUSTOMER', 'ADMIN']} />}>
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/repairs/new" element={<NewRepair />} />
            </Route>

            <Route element={<ProtectedRoute roles={['TECHNICIAN']} />}>
              <Route path="/technician" element={<TechnicianDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['LEAD_TECH']} />}>
              <Route path="/lead-tech" element={<LeadTechDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="/repairs/:id" element={<RepairDetails />} />

          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        limit={3}
      />
    </>
  );
}
