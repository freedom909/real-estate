'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import client from '@/lib/apolloClient';
import Image from 'next/image';
import Link from 'next/link';

// GraphQL query for fetching listings
export const GET_LISTINGS = `
  query GetListings($filters: ListingFilters) {
    listings(filters: $filters) {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      host {
        id
        name
        avatar
      }
      amenities
      maxGuests
      bedrooms
      bathrooms
      status
      createdAt
      updatedAt
    }
  }
`;

export default function ListingsPage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
    sortBy: 'createdAt'
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // For now, use mock data until GraphQL endpoint is ready
        const mockListings = [
          {
            id: '1',
            title: 'Traditional Kyoto Ryokan',
            description: 'Experience authentic Japanese culture in this beautiful traditional ryokan located in the heart of Kyoto.',
            price: 150,
            location: 'Kyoto, Japan',
            city: 'Kyoto',
            country: 'Japan',
            imageUrl: '/images/kyoto-ryokan.jpg',
            rating: 4.8,
            reviewCount: 124,
            host: {
              id: 'host1',
              name: 'Yuki Tanaka',
              avatar: '/images/host1.jpg'
            },
            amenities: ['WiFi', 'Kitchen', 'Hot Spring', 'Garden'],
            maxGuests: 4,
            bedrooms: 2,
            bathrooms: 1,
            status: 'ACTIVE',
            createdAt: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: 'Modern Osaka Apartment',
            description: 'Stylish modern apartment in downtown Osaka with amazing city views and convenient access to public transportation.',
            price: 120,
            location: 'Osaka, Japan',
            city: 'Osaka',
            country: 'Japan',
            imageUrl: '/images/osaka-apartment.jpg',
            rating: 4.6,
            reviewCount: 89,
            host: {
              id: 'host2',
              name: 'Kenji Sato',
              avatar: '/images/host2.jpg'
            },
            amenities: ['WiFi', 'Air Conditioning', 'Balcony', 'Elevator'],
            maxGuests: 3,
            bedrooms: 1,
            bathrooms: 1,
            status: 'ACTIVE',
            createdAt: '2024-01-20T00:00:00Z'
          },
          {
            id: '3',
            title: 'Fuji Mountain View Cabin',
            description: 'Cozy cabin with breathtaking views of Mount Fuji. Perfect for nature lovers and those seeking tranquility.',
            price: 200,
            location: 'Yamanashi, Japan',
            city: 'Fujiyoshida',
            country: 'Japan',
            imageUrl: '/images/fuji-cabin.jpg',
            rating: 4.9,
            reviewCount: 67,
            host: {
              id: 'host3',
              name: 'Mika Yamamoto',
              avatar: '/images/host3.jpg'
            },
            amenities: ['Fireplace', 'Mountain View', 'Hiking Trails', 'BBQ Area'],
            maxGuests: 6,
            bedrooms: 3,
            bathrooms: 2,
            status: 'ACTIVE',
            createdAt: '2024-01-10T00:00:00Z'
          },
          {
            id: '4',
            title: 'Tokyo City Center Loft',
            description: 'Spacious loft in the heart of Tokyo with modern amenities and easy access to all major attractions.',
            price: 180,
            location: 'Tokyo, Japan',
            city: 'Tokyo',
            country: 'Japan',
            imageUrl: '/images/tokyo-loft.jpg',
            rating: 4.7,
            reviewCount: 156,
            host: {
              id: 'host4',
              name: 'Takeshi Nakamura',
              avatar: '/images/host4.jpg'
            },
            amenities: ['WiFi', 'Workspace', 'City View', 'Concierge'],
            maxGuests: 2,
            bedrooms: 1,
            bathrooms: 1,
            status: 'ACTIVE',
            createdAt: '2024-01-25T00:00:00Z'
          }
        ];
        
        setListings(mockListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</Link>
                <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</Link>
                <Link href="/listings" className="text-blue-600 font-semibold">📋 Listings</Link>
                <Link href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">👤 Profile</Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 All Listings</h1>
          <p className="text-gray-600">Discover amazing places to stay across Japan</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Listing Image */}
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">{listing.title}</span>
                </div>
              </div>
              
              {/* Listing Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                  <span className="text-green-600 font-bold text-lg">¥{listing.price}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span className="mr-3">📍 {listing.location}</span>
                  <span>👥 {listing.maxGuests} guests</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-sm font-medium">{listing.rating}</span>
                    <span className="text-gray-500 text-sm ml-1">({listing.reviewCount} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {listing.bedrooms} bed • {listing.bathrooms} bath
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {listing.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">+{listing.amenities.length - 3} more</span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link 
                    href={`/listings/${listing.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                  >
                    View Details
                  </Link>
                  <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {listings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new listings.</p>
            <button 
              onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', guests: '', sortBy: 'createdAt' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Create Listing CTA */}
        {session && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Want to share your space?</p>
            <Link 
              href="/create-listing"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
            >
              ➕ Create Your Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}