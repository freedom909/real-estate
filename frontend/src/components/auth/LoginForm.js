'use client';
import React, { useState } from 'react';

import styles from './LoginForm.module.css';

export default function LoginForm() {
  const { login, loading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');

      if (!email || !password) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsSubmitting(false);
        return;
      }

      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Incorrect email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed, please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 显示来自 AuthContext 的错误或本地错误
  const displayError = error || authError;

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Sign In</h2>
      
      {displayError && (
        <div className={styles.errorMessage}>
          {displayError}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          required
          className={displayError ? styles.inputError : ''}
          disabled={loading || isSubmitting}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          required
          className={displayError ? styles.inputError : ''}
          disabled={loading || isSubmitting}
          minLength={8}
        />
      </div>

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={loading || isSubmitting}
      >
        {loading || isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>

      <div className={styles.formLinks}>
        <a href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </a>
        <p className={styles.registerLink}>
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </form>
  );
}