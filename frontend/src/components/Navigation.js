"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchUserRole = async () => {
        const token = session.accessToken || '';
        const query = {
          query: `query GetUserRole($userId: ID!) { user(id: $userId) { role } }`,
          variables: { userId: session.user.id },
        };

        try {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            cache: 'no-store', // Added cache: 'no-store' to bypass browser cache
            body: JSON.stringify(query),
          });
          const json = await res.json();
          if (json.data?.user?.role) {
            setUserRole(json.data.user.role);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      };
      fetchUserRole();
    }
  }, [status, session]);

  return (
    <nav className="bg-blue-100 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</Link>
              <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</Link>
              <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</Link>
              <Link href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">👤 Profile</Link>
              <Link href="/guest/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userRole === 'HOST' && (
              <Link href="/host/dashboard" className="text-sm font-medium text-blue-700 hover:text-blue-800">Host Dashboard →</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}