"use client"

import React, { useState, useEffect } from 'react';

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBookings([
        {
          id: 'booking-1',
          guestName: 'Li Xiaoming',
          guestEmail: 'liming@example.com',
          listingTitle: 'Kyoto Traditional Inn',
          checkIn: '2024-02-01',
          checkOut: '2024-02-05',
          guests: 2,
          totalAmount: 600,
          status: 'CONFIRMED',
          createdAt: '2024-01-10'
        },
        {
          id: 'booking-2',
          guestName: 'Wang Xiaohong',
          guestEmail: 'wanghong@example.com',
          listingTitle: 'Osaka Modern Apartment',
          checkIn: '2024-02-10',
          checkOut: '2024-02-12',
          guests: 1,
          totalAmount: 240,
          status: 'PENDING',
          createdAt: '2024-01-15'
        },
        {
          id: 'booking-3',
          guestName: 'Zhang Wei',
          guestEmail: 'zhangwei@example.com',
          listingTitle: 'Kyoto Traditional Inn',
          checkIn: '2024-03-01',
          checkOut: '2024-03-07',
          guests: 3,
          totalAmount: 900,
          status: 'CANCELLED',
          createdAt: '2024-01-05'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleBookingAction = (bookingId, action) => {
    console.log('Handle booking:', bookingId, action);
    // 这里可以调用API处理预订
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bookings</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            {[
              { value: 'all', label: 'All', count: bookings.length },
              { value: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
              { value: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
              { value: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                      <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                      <div className="text-sm text-gray-600">{booking.listingTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Check-in: {booking.checkIn}</div>
                        <div>Check-out: {booking.checkOut}</div>
                        <div>Guests: {booking.guests}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'cancel')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings</h3>
            <p className="text-gray-600">No bookings under current filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}