"use client"

import React, { useState, useEffect } from 'react';

export default function HostListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setListings([
        {
          id: 'listing-1',
          title: 'Kyoto Traditional Inn',
          description: 'Traditional Japanese inn in central Kyoto, experience authentic culture',
          price: 150,
          location: 'Kyoto',
          status: 'ACTIVE',
          bookings: 12,
          rating: 4.7,
          images: ['/images/kyoto-inn.jpg']
        },
        {
          id: 'listing-2',
          title: 'Osaka Modern Apartment',
          description: 'Modern apartment in downtown Osaka, convenient transportation',
          price: 120,
          location: 'Osaka',
          status: 'ACTIVE',
          bookings: 8,
          rating: 4.5,
          images: ['/images/osaka-apartment.jpg']
        },
        {
          id: 'listing-3',
          title: 'Mt. Fuji View Cabin',
          description: 'Cabin at the foot of Mt. Fuji, enjoy tranquil nature',
          price: 200,
          location: 'Yamanashi Prefecture',
          status: 'PENDING',
          bookings: 0,
          rating: null,
          images: ['/images/fuji-cabin.jpg']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (listingId) => {
    console.log('Edit listing:', listingId);
  };

  const handleStatusChange = (listingId, newStatus) => {
    console.log('Update status:', listingId, newStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <a 
            href="/create-listing"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Listing
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Listing Image</span>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {listing.status === 'ACTIVE' ? 'Active' : 
                     listing.status === 'PENDING' ? 'Pending Review' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">¥{listing.price}</span>
                    <span className="text-gray-600 text-sm">/night</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {listing.location}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Bookings: {listing.bookings}</span>
                  <span>{listing.rating ? `${listing.rating} ⭐` : 'No rating yet'}</span>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(listing.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleStatusChange(listing.id, 
                      listing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`flex-1 py-2 px-4 rounded ${
                      listing.status === 'ACTIVE' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {listing.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings</h3>
            <p className="text-gray-600 mb-4">Start your hosting journey, create your first listing</p>
            <a 
              href="/create-listing"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Create New Listing
            </a>
          </div>
        )}
      </div>
    </div>
  );
}