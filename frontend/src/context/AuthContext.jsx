// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  });

  const login = (token, userId, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setAuthState({ token, userId, userInfo });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    setAuthState({ token: null, userId: null, userInfo: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}