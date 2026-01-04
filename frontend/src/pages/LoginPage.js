import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLoginButton } from '../components/auth';

/**
 * 登录页面组件
 */
const LoginPage = () => {
  const { isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向URL，如果没有则默认为首页
  const from = location.state?.from?.pathname || '/';

  // 如果用户已认证，重定向到之前的页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // 处理登录成功
  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting...');
  };

  // 处理登录失败
  const handleLoginError = (error) => {
    console.error('Login failed:', error);
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>欢迎登录</h1>
        <p style={styles.subtitle}>请选择以下方式登录：</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.buttonContainer}>
          <GoogleLoginButton
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            buttonStyle={styles.loginButton}
          />
        </div>
      </div>
    </div>
  );
};

// 组件样式
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#333',
    fontSize: '24px',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#666',
    fontSize: '16px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  loginButton: {
    width: '100%',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
};

export default LoginPage;