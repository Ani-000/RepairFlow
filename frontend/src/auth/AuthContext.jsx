import { useMemo, useState } from 'react';
import { AuthContext } from './context';
import { authApi } from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('repairflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      sessionStorage.removeItem('repairflow_user');
      return null;
    }
  });

  async function login(email, password) {
    const result = await authApi.login({ email, password });

    if (!result?.token || !result?.role) {
      throw new Error('The login response did not contain a token and role.');
    }

    const account = {
      id: result.id,
      name: result.name,
      email: result.email,
      role: String(result.role).toUpperCase(),
    };

    sessionStorage.setItem('repairflow_token', result.token);
    sessionStorage.setItem('repairflow_user', JSON.stringify(account));

    setUser(account);

    return account;
  }

  function logout() {
    sessionStorage.removeItem('repairflow_token');
    sessionStorage.removeItem('repairflow_user');
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, login, logout }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
