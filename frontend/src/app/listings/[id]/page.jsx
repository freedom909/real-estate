'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for listing details
const mockListingDetails = {
  '1': {
    id: '1',
    title: 'Traditional Kyoto Ryokan',
    description: 'Experience authentic Japanese culture in this beautiful traditional ryokan located in the heart of Kyoto. This historic property has been carefully maintained for over 100 years, offering guests a unique opportunity to immerse themselves in traditional Japanese hospitality.',
    detailedDescription: 'Nestled in the historic Gion district, our ryokan offers a perfect blend of traditional architecture and modern comforts. Each room features tatami mat flooring, futon bedding, and beautiful garden views. Guests can enjoy our private onsen (hot spring), traditional kaiseki meals, and tea ceremony experiences.',
    price: 150,
    location: 'Kyoto, Japan',
    city: 'Kyoto',
    country: 'Japan',
    imageUrl: '/images/kyoto-ryokan.jpg',
    images: [
      '/images/kyoto-ryokan-1.jpg',
      '/images/kyoto-ryokan-2.jpg',
      '/images/kyoto-ryokan-3.jpg',
      '/images/kyoto-ryokan-4.jpg'
    ],
    rating: 4.8,
    reviewCount: 124,
    host: {
      id: 'host1',
      name: 'Yuki Tanaka',
      avatar: '/images/host1.jpg',
      joinedDate: '2020-03-15',
      verified: true,
      responseRate: 98,
      responseTime: 'within an hour',
      description: 'I have been running this family ryokan for over 20 years. I love sharing Japanese culture with international guests and ensuring they have an unforgettable experience.'
    },
    amenities: ['WiFi', 'Kitchen', 'Hot Spring', 'Garden', 'Traditional Tea Room', 'Yukata Rental', 'Airport Transfer', 'Breakfast Included'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    beds: 4,
    propertyType: 'Traditional Ryokan',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00Z',
    houseRules: [
      'No smoking inside the property',
      'No pets allowed',
      'Quiet hours from 22:00 to 07:00',
      'Shoes must be removed at entrance',
      'Traditional Japanese customs respected'
    ],
    cancellationPolicy: 'Flexible: Full refund up to 7 days before check-in',
    availability: {
      available: true,
      nextAvailable: '2024-02-01'
    }
  },
  '2': {
    id: '2',
    title: 'Modern Osaka Apartment',
    description: 'Stylish modern apartment in downtown Osaka with amazing city views and convenient access to public transportation.',
    detailedDescription: 'Located in the vibrant Namba district, this contemporary apartment offers stunning views of Osaka city. Perfect for business travelers and tourists alike, with easy access to shopping, dining, and entertainment. The apartment features modern amenities, high-speed internet, and a fully equipped kitchen.',
    price: 120,
    location: 'Osaka, Japan',
    city: 'Osaka',
    country: 'Japan',
    imageUrl: '/images/osaka-apartment.jpg',
    images: [
      '/images/osaka-apartment-1.jpg',
      '/images/osaka-apartment-2.jpg',
      '/images/osaka-apartment-3.jpg',
      '/images/osaka-apartment-4.jpg'
    ],
    rating: 4.6,
    reviewCount: 89,
    host: {
      id: 'host2',
      name: 'Kenji Sato',
      avatar: '/images/host2.jpg',
      joinedDate: '2021-06-10',
      verified: true,
      responseRate: 95,
      responseTime: 'within 2 hours',
      description: 'As a local Osaka resident, I love helping visitors discover the best of our city. My apartment is designed for comfort and convenience.'
    },
    amenities: ['WiFi', 'Air Conditioning', 'Balcony', 'Elevator', 'Smart TV', 'Washing Machine', 'Kitchenette', 'Concierge Service'],
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    beds: 2,
    propertyType: 'Apartment',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    status: 'ACTIVE',
    createdAt: '2024-01-20T00:00:00Z',
    houseRules: [
      'No parties or events',
      'No smoking',
      'Pets considered with prior approval',
      'Respect neighbors with noise levels'
    ],
    cancellationPolicy: 'Moderate: Full refund up to 5 days before check-in',
    availability: {
      available: true,
      nextAvailable: '2024-01-28'
    }
  },
  '3': {
    id: '3',
    title: 'Fuji Mountain View Cabin',
    description: 'Cozy cabin with breathtaking views of Mount Fuji. Perfect for nature lovers and those seeking tranquility.',
    detailedDescription: 'Escape to this charming cabin nestled in the foothills of Mount Fuji. Wake up to stunning mountain views and enjoy the peaceful surroundings. The cabin features a wood-burning fireplace, outdoor BBQ area, and direct access to hiking trails. Perfect for families and groups looking for a nature retreat.',
    price: 200,
    location: 'Yamanashi, Japan',
    city: 'Fujiyoshida',
    country: 'Japan',
    imageUrl: '/images/fuji-cabin.jpg',
    images: [
      '/images/fuji-cabin-1.jpg',
      '/images/fuji-cabin-2.jpg',
      '/images/fuji-cabin-3.jpg',
      '/images/fuji-cabin-4.jpg'
    ],
    rating: 4.9,
    reviewCount: 67,
    host: {
      id: 'host3',
      name: 'Mika Yamamoto',
      avatar: '/images/host3.jpg',
      joinedDate: '2019-11-20',
      verified: true,
      responseRate: 99,
      responseTime: 'within an hour',
      description: 'I grew up in this area and have always loved sharing the beauty of Mount Fuji with visitors. My cabin is my passion project.'
    },
    amenities: ['Fireplace', 'Mountain View', 'Hiking Trails', 'BBQ Area', 'Outdoor Deck', 'Parking', 'Kitchen', 'Hot Tub'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    beds: 5,
    propertyType: 'Cabin',
    checkInTime: '16:00',
    checkOutTime: '10:00',
    status: 'ACTIVE',
    createdAt: '2024-01-10T00:00:00Z',
    houseRules: [
      'No loud music after 21:00',
      'Firewood provided for fireplace',
      'BBQ area must be cleaned after use',
      'Respect wildlife and nature'
    ],
    cancellationPolicy: 'Strict: Full refund up to 14 days before check-in',
    availability: {
      available: true,
      nextAvailable: '2024-02-05'
    }
  },
  '4': {
    id: '4',
    title: 'Tokyo City Center Loft',
    description: 'Spacious loft in the heart of Tokyo with modern amenities and easy access to all major attractions.',
    detailedDescription: 'This stunning loft apartment is located in the trendy Shibuya district, offering panoramic views of Tokyo. The open-plan design features high ceilings, large windows, and contemporary furnishings. Perfect for couples or solo travelers wanting to experience Tokyo\'s vibrant city life.',
    price: 180,
    location: 'Tokyo, Japan',
    city: 'Tokyo',
    country: 'Japan',
    imageUrl: '/images/tokyo-loft.jpg',
    images: [
      '/images/tokyo-loft-1.jpg',
      '/images/tokyo-loft-2.jpg',
      '/images/tokyo-loft-3.jpg',
      '/images/tokyo-loft-4.jpg'
    ],
    rating: 4.7,
    reviewCount: 156,
    host: {
      id: 'host4',
      name: 'Takeshi Nakamura',
      avatar: '/images/host4.jpg',
      joinedDate: '2022-01-08',
      verified: true,
      responseRate: 96,
      responseTime: 'within an hour',
      description: 'I\'m an architect who designed this loft to showcase modern Tokyo living. I enjoy helping guests discover hidden gems in the city.'
    },
    amenities: ['WiFi', 'Workspace', 'City View', 'Concierge', 'Smart Home System', 'Coffee Machine', 'Sound System', '24/7 Security'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    propertyType: 'Loft',
    checkInTime: '15:00',
    checkOutTime: '12:00',
    status: 'ACTIVE',
    createdAt: '2024-01-25T00:00:00Z',
    houseRules: [
      'No smoking',
      'No additional guests without approval',
      'Quiet building - respect neighbors',
      'Use coasters for drinks'
    ],
    cancellationPolicy: 'Flexible: Full refund up to 7 days before check-in',
    availability: {
      available: true,
      nextAvailable: '2024-01-30'
    }
  }
};

export default function ListingDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingDates, setBookingDates] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const listingId = params.id;
        const listingData = mockListingDetails[listingId];
        
        if (listingData) {
          setListing(listingData);
        } else {
          // Redirect to listings page if listing not found
          router.push('/listings');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        router.push('/listings');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id, router]);

  const handleBooking = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    // For now, show alert. In production, this would redirect to booking page
    alert(`Booking initiated for ${listing.title}\nCheck-in: ${bookingDates.checkIn}\nCheck-out: ${bookingDates.checkOut}\nGuests: ${bookingDates.guests}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Listing not found</h3>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist.</p>
          <Link 
            href="/listings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Back to Listings
          </Link>
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
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>→</li>
            <li><Link href="/listings" className="hover:text-blue-600">Listings</Link></li>
            <li>→</li>
            <li className="text-gray-900 font-medium">{listing.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Listing Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{listing.title}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 bg-gradient-to-r from-blue-300 to-purple-400 rounded ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <span className="text-white text-xs">Image {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listing Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-medium">{listing.rating}</span>
                  <span className="text-gray-500 ml-1">({listing.reviewCount} reviews)</span>
                </div>
                <span className="text-gray-500">📍 {listing.location}</span>
                <span className="text-gray-500">🏠 {listing.propertyType}</span>
              </div>
              
              <p className="text-gray-700 text-lg mb-4">{listing.description}</p>
              <p className="text-gray-600">{listing.detailedDescription}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🏠 Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{listing.bedrooms}</div>
                  <div className="text-gray-600">Bedrooms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{listing.bathrooms}</div>
                  <div className="text-gray-600">Bathrooms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{listing.beds}</div>
                  <div className="text-gray-600">Beds</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{listing.maxGuests}</div>
                  <div className="text-gray-600">Max Guests</div>
                </div>
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📜 House Rules</h2>
              <ul className="space-y-2">
                {listing.houseRules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Cancellation Policy</h3>
                <p className="text-blue-800">{listing.cancellationPolicy}</p>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 About the Host</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-semibold">
                  {listing.host.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{listing.host.name}</h3>
                    {listing.host.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{listing.host.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Response rate:</span> {listing.host.responseRate}%
                    </div>
                    <div>
                      <span className="font-medium">Response time:</span> {listing.host.responseTime}
                    </div>
                    <div>
                      <span className="font-medium">Joined:</span> {new Date(listing.host.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">¥{listing.price}</div>
                <div className="text-gray-600">per night</div>
              </div>
              
              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={bookingDates.checkIn}
                    onChange={(e) => setBookingDates(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={bookingDates.checkOut}
                    onChange={(e) => setBookingDates(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={bookingDates.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    value={bookingDates.guests}
                    onChange={(e) => setBookingDates(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: listing.maxGuests }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleBooking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-semibold transition-colors"
                >
                  {session ? 'Book Now' : 'Login to Book'}
                </button>
                
                <div className="text-center text-sm text-gray-500">
                  You won't be charged yet
                </div>
              </div>
              
              {/* Availability Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Availability</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    listing.availability.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.availability.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
                {listing.availability.nextAvailable && (
                  <p className="text-blue-800 text-sm">
                    Next available: {new Date(listing.availability.nextAvailable).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {/* Check-in/Check-out Times */}
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Check-in:</span>
                  <span className="font-medium">{listing.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium">{listing.checkOutTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}