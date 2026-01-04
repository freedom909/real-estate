'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

      // 基本验证
      if (!email || !password) {
        setError('请填写所有必填字段');
        setIsSubmitting(false);
        return;
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('请输入有效的邮箱地址');
        setIsSubmitting(false);
        return;
      }

      // 密码长度验证
      if (password.length < 8) {
        setError('密码长度不能少于8个字符');
        setIsSubmitting(false);
        return;
      }

      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || '邮箱或密码错误');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 显示来自 AuthContext 的错误或本地错误
  const displayError = error || authError;

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>登录</h2>
      
      {displayError && (
        <div className={styles.errorMessage}>
          {displayError}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="email">邮箱</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="请输入邮箱地址"
          required
          className={displayError ? styles.inputError : ''}
          disabled={loading || isSubmitting}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">密码</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="请输入密码"
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
        {loading || isSubmitting ? '登录中...' : '登录'}
      </button>

      <div className={styles.formLinks}>
        <a href="/forgot-password" className={styles.forgotPassword}>
          忘记密码？
        </a>
        <p className={styles.registerLink}>
          还没有账号？ <a href="/register">注册</a>
        </p>
      </div>
    </form>
  );
}