'use client';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  
  if (!session) {
    
    window.location.href = '/login';
    return null;
  }
const handleLogout = async () => {
  // 清除 localStorage 中的自定义 token 或用户信息
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  // 或者更彻底地清除所有本地存储
  // localStorage.clear();

  // 调用 next-auth 的 signOut，它会清除相关的 cookie 和会话
  await signOut({ redirect: true, callbackUrl: '/' }); 
};
  const user = session.user;

  return (
    <div>
      <div>
      <p>Signed in as {session.user.email}</p>
      
      <img src={session.user.image} alt="User Avatar" />
      {session?.user?.picture ? (
        <img src={session.user.picture} alt="User Avatar" width={48} height={48} />
      ) : (
        <p>No profile picture available</p>
      )}
      <p>Signed in as {session.user.name}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
    </div>
  );
}