import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Next.js 受保护的路由组件
 * 如果用户未认证，将重定向到登录页面
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {Array<string>} [props.requiredRoles] - 访问该路由所需的角色列表
 * @returns {React.ReactNode} - 如果用户已认证且拥有所需角色，则渲染子组件；否则重定向到登录页面
 */
export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && requiredRoles.length > 0) {
      const userRoles = session.user?.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [status, session, requiredRoles, router]);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTop: '4px solid #3498db',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (status === 'authenticated') {
    if (requiredRoles.length === 0) {
      return children;
    }
    
    const userRoles = session.user?.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (hasRequiredRole) {
      return children;
    }
  }

  return null;
}