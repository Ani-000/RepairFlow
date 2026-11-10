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

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeForRole(user.role) : '/login'} replace />;
}

export default function App() {
  return <Routes>
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
  </Routes>;
}
