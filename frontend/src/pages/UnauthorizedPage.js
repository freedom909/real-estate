import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 未授权页面组件
 * 当用户尝试访问没有权限的页面时显示
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>访问被拒绝</h1>
        <div style={styles.icon}>🔒</div>
        <p style={styles.message}>
          抱歉，您没有权限访问此页面。
        </p>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate(-1)}
            style={styles.button}
          >
            返回上一页
          </button>
          <button
            onClick={() => navigate('/')}
            style={{...styles.button, ...styles.homeButton}}
          >
            返回首页
          </button>
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
  content: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    color: '#d32f2f',
    fontSize: '24px',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  message: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  homeButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    ':hover': {
      backgroundColor: '#1565c0',
    },
  },
};

export default UnauthorizedPage;