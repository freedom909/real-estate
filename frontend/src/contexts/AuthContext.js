import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // GraphQL mutation for registration
      const operations = {
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                name
                email
                bio
                location
                phone
                profilePicture
              }
            }
          }
        `,
        variables: {
          input: {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            phone: formData.get('phone'),
            profilePicture: formData.get('profilePicture') || null
          }
        }
      };

      const response = await axios.post('/graphql', operations, config);
      
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const { token, user } = response.data.data.register;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      setUser(user);
      
      // Redirect after successful registration
      navigate('/dashboard');
      
      return user;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function would go here
  // Logout function would go here
  // Check auth status function would go here

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      // Other auth functions would be added here
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};