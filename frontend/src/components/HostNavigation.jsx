"use client"

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function HostNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Check if user is a host (HOST or PENDING_HOST)
  const userRole = session?.user?.role;
  const isHost = userRole === 'HOST' || userRole === 'PENDING_HOST';
  const hostName = session?.user?.name || 'Host';

  if (!isHost) {
    return null;
  }

  return (
    <div className="relative">
      {/* 房东菜单按钮 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-2 rounded-md hover:bg-orange-200 transition-colors"
      >
        <span className="text-sm font-medium">🏠 {hostName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <a
            href="/host/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            📊 Host Management Center
          </a>
          <a
            href="/create-listing"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            ➕ Create New Listing
          </a>
          <a
            href="/host/listings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            🏠 My Listings
          </a>
          <a
            href="/host/bookings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            📅 Bookings
          </a>
          <div className="border-t my-1"></div>
          <a
            href="/host/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            ⚙️ Host Settings
          </a>
        </div>
      )}
    </div>
  );
}