
// // frontend/src/context/AuthContext.jsx
// import { createContext, useContext, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [authState, setAuthState] = useState({
//     token: localStorage.getItem('token'),
//     userId: localStorage.getItem('userId'),
//     userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
//     loading: false,
//     error: null
//   });
//   const navigate = useNavigate();

//   const login = async (email, password) => {
//     setAuthState(prev => ({ ...prev, loading: true, error: null }));
//     try {
//       const response = await axios.post('http://localhost:4010/graphql', {
//         query: `
//           mutation SignIn($input: SignInInput!) {
//             signIn(input: $input) {
//               code
//               auth {
//                 token
//                 userId
//                 role
//               }
//               success
//               message
//             }
//           }
//         `,
//         variables: {
//           input: { email, password }
//         }
//       });

//       const result = response.data?.data?.signIn;
//       const { auth, success, message } = result;

//       if (!success || !auth?.token || !auth?.userId) {
//         throw new Error(message || 'Authentication failed');
//       }

//       localStorage.setItem('token', auth.token);
//       localStorage.setItem('userId', auth.userId);
//       localStorage.setItem('userInfo', JSON.stringify({ role: auth.role }));
//       setAuthState({
//         token: auth.token,
//         userId: auth.userId,
//         userInfo: { role: auth.role },
//         loading: false,
//         error: null
//       });
//       navigate('/dashboard');
//     } catch (error) {
//       setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('userInfo');
//     setAuthState({ token: null, userId: null, userInfo: null, loading: false, error: null });
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ ...authState, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

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
