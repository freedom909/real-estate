'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import client from '@/lib/apolloClient';
import Image from 'next/image';
import Link from 'next/link';

// GraphQL query for searching listings
export const SEARCH_LISTINGS = `
  query SearchListings($input: SearchListingsInput!) {
    searchListings(input: $input) {
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

export default function SearchPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    query: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    guests: searchParams.get('guests') || '',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  // Mock search results for demonstration
  const mockSearchResults = [
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

  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        
        // Filter mock results based on search criteria
        let filteredResults = mockSearchResults;
        
        if (searchFilters.query) {
          const query = searchFilters.query.toLowerCase();
          filteredResults = filteredResults.filter(listing => 
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query) ||
            listing.city.toLowerCase().includes(query)
          );
        }
        
        if (searchFilters.city) {
          filteredResults = filteredResults.filter(listing => 
            listing.city.toLowerCase().includes(searchFilters.city.toLowerCase())
          );
        }
        
        if (searchFilters.minPrice) {
          filteredResults = filteredResults.filter(listing => 
            listing.price >= parseInt(searchFilters.minPrice)
          );
        }
        
        if (searchFilters.maxPrice) {
          filteredResults = filteredResults.filter(listing => 
            listing.price <= parseInt(searchFilters.maxPrice)
          );
        }
        
        if (searchFilters.guests) {
          filteredResults = filteredResults.filter(listing => 
            listing.maxGuests >= parseInt(searchFilters.guests)
          );
        }
        
        // Sort results
        switch (searchFilters.sortBy) {
          case 'price':
            filteredResults.sort((a, b) => a.price - b.price);
            break;
          case '-price':
            filteredResults.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredResults.sort((a, b) => b.rating - a.rating);
            break;
          case 'reviews':
            filteredResults.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          default:
            // Default sort by relevance/date
            filteredResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error performing search:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchFilters]);

  const handleSearch = (newFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleFilterChange = (key, value) => {
    handleSearch({ [key]: value });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
                <Link href="/search" className="text-blue-600 font-semibold">🔍 Search</Link>
                <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</Link>
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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Search Listings</h1>
          <p className="text-gray-600">Find your perfect stay across Japan</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={searchFilters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 Location</label>
                  <input
                    type="text"
                    placeholder="City or region"
                    value={searchFilters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💰 Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={searchFilters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={searchFilters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">👥 Guests</label>
                  <select
                    value={searchFilters.guests}
                    onChange={(e) => handleFilterChange('guests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any number</option>
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                    <option value="5">5+ guests</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📊 Sort By</label>
                  <select
                    value={searchFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setSearchFilters({
                    query: '',
                    city: '',
                    minPrice: '',
                    maxPrice: '',
                    guests: '',
                    sortBy: 'relevance'
                  })}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchResults.length} {searchResults.length === 1 ? 'listing' : 'listings'} found
                  </h2>
                  {searchFilters.query && (
                    <p className="text-gray-600">for "{searchFilters.query}"</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Sorted by {searchFilters.sortBy === 'relevance' ? 'relevance' : searchFilters.sortBy}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching listings...</p>
              </div>
            )}

            {/* Search Results Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Listing Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
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
            )}

            {/* Empty State */}
            {!loading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all listings.</p>
                <Link 
                  href="/listings"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Browse All Listings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}