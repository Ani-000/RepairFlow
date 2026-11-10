export function homeForRole(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TECHNICIAN') return '/technician';
  if (role === 'LEAD_TECH') return '/lead-tech';
  if (role === 'CUSTOMER') return '/customer';

  return '/customer';
}
