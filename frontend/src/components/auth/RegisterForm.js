// File: frontend/src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterForm() {
  const [passwordErrors, setPasswordErrors] = useState([]);
  //const { register } = useAuth();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('8+ characters');
    if (!/[A-Z]/.test(password)) errors.push('1 uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('1 lowercase letter');
    if (!/\d/.test(password)) errors.push('1 number');
    if (!/[@$!%*?&]/.test(password)) errors.push('1 special character');
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    
    if (!validatePassword(password)) {
      return;
    }

    try {
      await register(formData);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <input type="password" name="password" 
             onChange={(e) => validatePassword(e.target.value)} />
      
      {passwordErrors.length > 0 && (
        <div className="password-requirements">
          <p>Password must contain:</p>
          <ul>
            {passwordErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button type="submit">Register</button>
    </form>
  );
}