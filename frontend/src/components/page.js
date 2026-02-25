"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql';

export default function GuestDashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        const token = session.accessToken || '';

        try {
          // Define queries
          const userQuery = {
            query: `
              query GetUser($userId: ID!) {
                user(id: $userId) {
                  id
                  name
                  email
                  role
                }
              }
            `,
            variables: { userId: session.user.id },
          };

          const bookingsQuery = {
            query: `
              query GetMyBookings {
                myBookings {
                  id
                  checkInDate
                  checkOutDate
                  listing {
                    id
                    title
                    pictures
                  }
                }
              }
            `,
          };

          // Fetch user and bookings data in parallel
          const [userRes, bookingsRes] = await Promise.all([
            fetch(GATEWAY_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(userQuery),
            }),
            fetch(GATEWAY_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(bookingsQuery),
            }),
          ]);

          const userJson = await userRes.json();
          const bookingsJson = await bookingsRes.json();

          if (userJson.errors || bookingsJson.errors) {
            throw new Error(userJson.errors?.[0]?.message || bookingsJson.errors?.[0]?.message || 'Error fetching data.');
          }

          setUserData(userJson.data.user);
          setBookings(bookingsJson.data.myBookings || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, session]);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center">Loading dashboard...</div>;
    }

    if (status === 'unauthenticated') {
      return <div className="text-center">Please <Link href="/api/auth/signin" className="text-blue-600 hover:underline">sign in</Link> to view your dashboard.</div>;
    }

    if (error) {
      return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
    }

    return (
      <>
        {userData && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> <span className="capitalize">{userData.role?.toLowerCase()}</span></p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="flex items-center border-b pb-4">
                  <img src={booking.listing.pictures[0]} alt={booking.listing.title} className="w-32 h-24 object-cover rounded-md mr-4" />
                  <div>
                    <h3 className="text-lg font-bold">{booking.listing.title}</h3>
                    <p className="text-sm text-gray-600">Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no bookings yet.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Guest Dashboard</h1>
        {renderContent()}
      </main>
    </div>
  );
}