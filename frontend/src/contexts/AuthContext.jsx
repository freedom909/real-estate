

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext();

function normalizeUser(rawUser) {
  return {
    id: rawUser.id,
    email: rawUser.email,
    firstName: rawUser.firstName || null,
    name: rawUser.name || rawUser.firstName || rawUser.email,
    role: rawUser.role || 'User',
  };
}
export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(status === 'loading');
    if (status === 'authenticated') {
      setUser(session.user);
      if (sessionUser) {
    setUser(normalizeUser(sessionUser));
  }
    } else {
      setUser(null);
    }
  }, [status, session, sessionUser]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
