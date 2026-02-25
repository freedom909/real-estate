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
 const handleLogout = () => {
    signOut(); // This function is provided by next-auth/react
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