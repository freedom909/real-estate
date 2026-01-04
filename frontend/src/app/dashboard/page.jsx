'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import sendOAuthRequestToSubgraph from '@/userService/oauthService';

export default function Dashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncAuth = async () => {
    
      if (status === 'authenticated' && session?.accessToken) {
        try {
          const result = await sendOAuthRequestToSubgraph('google', session.accessToken);
          console.log('OAuth Subgraph Result:', result); // 🔍 LOG IT
  
          if (!result?.success) {
            console.error('OAuth subgraph auth failed. Logging out...');
            signOut({ callbackUrl: '/login?error=AccessDenied' });
          }
        } catch (err) {
          console.error('Subgraph call failed:', err);
          signOut({ callbackUrl: '/login?error=AccessDenied' });
        }
      }
    };
    syncAuth();
  }, [session, status]);
  

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

 
  let imageSrc = session?.user?.image;
  if (!imageSrc || !imageSrc.startsWith('http')) {
    imageSrc = '/chart.png';
  }
  

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="dashboard-container">
      <div className="user-profile">
   
        <Image
          src={imageSrc}
          alt="User Avatar"
          width={100}
          height={100}
          priority
        />
        <p>{session?.user?.name}</p>
        <div className="user-info">
          <h2>Welcome, {session?.user?.name || ''}</h2>
          <p>Email: {session?.user?.email || ''}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}
