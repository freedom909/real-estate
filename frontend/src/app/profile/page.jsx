'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import client from '@/lib/apolloClient';
import { GET_USER_DASHBOARD } from '@/graphql/users';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setLoading(true);
          const result = await client.query({
            query: GET_USER_DASHBOARD,
            variables: { userId: session.user.id }
          });

          if (result.data?.userDashboard) {
            setProfileData(result.data.userDashboard);
          } else {
            setError('Profile data not found');
          }
        } catch (err) {
          console.error('Error fetching profile data:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [session, status]);

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Get user picture from profile data or session
  const userPicture = profileData?.user?.avatar || session?.user?.image;
  
  // Function to get avatar display
  const getAvatarDisplay = (size = 80) => {
    if (userPicture && userPicture.startsWith('http')) {
      return (
        <Image
          src={userPicture}
          alt="User Avatar"
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      );
    } else {
      // Fallback to icon with user's initial
      const initial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U';
      return (
        <div className={`bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-2xl`} style={{ width: size, height: size }}>
          {initial}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation Menu */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</a>
              <div className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</a>
                <a href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</a>
                <a href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</a>
                <a href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</a>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">📊 Dashboard</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getAvatarDisplay(32)}
                <span className="text-sm font-medium text-gray-700">{session?.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg">
                  {getAvatarDisplay(120)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{session?.user?.name}</h1>
                    <p className="text-gray-600 mt-1">{session?.user?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {profileData?.user?.role || 'GUEST'}
                      </span>
                      {profileData?.user?.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          ✅ Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      onClick={() => setActiveTab('settings')}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'bookings', 'listings', 'reviews', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'bookings' && '📅 Bookings'}
                  {tab === 'listings' && '🏠 Listings'}
                  {tab === 'reviews' && '⭐ Reviews'}
                  {tab === 'settings' && '⚙️ Settings'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <span className="text-xl">🏠</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Listings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData?.totalListings || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData?.totalBookings || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{session?.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium capitalize">{profileData?.user?.role?.toLowerCase() || 'guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🔒 Change Password
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      📧 Email Preferences
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🔔 Notification Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
              {profileData?.recentBookings?.length > 0 ? (
                <div className="space-y-4">
                  {profileData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.listingTitle}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">¥{booking.totalPrice}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found</p>
                  <a href="/search" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Start exploring listings
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Listings</h2>
              {profileData?.recentListings?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.recentListings.slice(0, 4).map((listing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {listing.imageUrl && (
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{listing.title}</h3>
                        <p className="text-green-600 font-semibold mt-1">¥{listing.price} per night</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Created {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No listings found</p>
                  <a href="/create-listing" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Create your first listing
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              <p className="text-gray-500">Reviews feature coming soon</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🔒 Change Password
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🔐 Two-Factor Authentication
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      📱 Connected Devices
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🌍 Language & Region
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🔔 Notifications
                    </button>
                    <button className="w-full text-left bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors">
                      🎨 Theme & Appearance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}