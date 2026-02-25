"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { CREATE_ORDER } from "@/graphql/orders";
import HeaderClient from "@/components/ui/HeaderClient";
import HostNavigation from "@/components/HostNavigation";
import PaymentForm from "@/components/PaymentForm";

// Mock listing data for demonstration
const mockListing = {
  id: "1",
  title: "Traditional Kyoto Ryokan",
  description: "Experience authentic Japanese culture in this beautiful traditional ryokan",
  price: 150,
  location: "Kyoto, Japan",
  city: "Kyoto",
  country: "Japan",
  imageUrl: "/images/kyoto-ryokan.jpg",
  host: {
    id: "host1",
    name: "Yuki Tanaka",
    avatar: "/images/host1.jpg"
  },
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 1
};

export default function CreateOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  
  // Order form state
  const [orderData, setOrderData] = useState({
    listingId: searchParams.get("listingId") || "",
    checkInDate: searchParams.get("checkIn") || "",
    checkOutDate: searchParams.get("checkOut") || "",
    guests: parseInt(searchParams.get("guests")) || 1,
    specialRequests: ""
  });

  const [createOrder] = useMutation(CREATE_ORDER);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!orderData.checkInDate || !orderData.checkOutDate) return 0;
    
    const checkIn = new Date(orderData.checkInDate);
    const checkOut = new Date(orderData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights * mockListing.price;
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError("You must be logged in to create an order");
      return;
    }

    if (!orderData.listingId || !orderData.checkInDate || !orderData.checkOutDate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createOrder({
        variables: {
          input: {
            listingId: orderData.listingId,
            guestId: session.user.id,
            checkInDate: orderData.checkInDate,
            checkOutDate: orderData.checkOutDate,
            totalPrice: calculateTotalPrice()
          }
        }
      });

      if (result.data?.createOrder?.success) {
        setCreatedOrder(result.data.createOrder.order);
        setShowPayment(true);
      } else {
        setError(result.data?.createOrder?.message || "Failed to create order");
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating the order");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    setSuccess(true);
    // Redirect to orders page after 2 seconds
    setTimeout(() => {
      router.push("/orders");
    }, 2000);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCreatedOrder(null);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">You must be logged in to create an order.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const nights = totalPrice / mockListing.price;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-900 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex space-x-4">
          <span>trusted</span>
          <span>unforgotten</span>
        </div>
        <div className="flex space-x-4">
          <HeaderClient />
          <HostNavigation />
        </div>
      </div>

      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">🏠 MINSHUKU</div>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/listings" className="hover:underline">Listings</Link>
          <Link href="/search" className="hover:underline">Search</Link>
          <Link href="/bookings" className="hover:underline">Bookings</Link>
          <Link href="/orders" className="hover:underline">Orders</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </nav>
        <div className="text-sm">
          Welcome, {session.user?.name || session.user?.email}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Order</h1>
          <p className="text-gray-600">Complete your booking by creating an order</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-green-700 font-semibold">Success!</div>
            <div className="text-green-600">Order created successfully. Redirecting to orders page...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 font-semibold">Error</div>
            <div className="text-red-600">{error}</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={orderData.checkInDate}
                    onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={orderData.checkOutDate}
                    onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={orderData.checkInDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests *
                  </label>
                  <select
                    value={orderData.guests}
                    onChange={(e) => handleInputChange("guests", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: mockListing.maxGuests }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={orderData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    placeholder="Any special requests or requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors"
                >
                  {loading ? "Creating Order..." : "Create Order"}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Listing Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{mockListing.title}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  {mockListing.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">🏠 {mockListing.bedrooms} bedrooms</span>
                  <span>🛁 {mockListing.bathrooms} bathrooms</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ¥{mockListing.price} × {nights || 0} nights
                  </span>
                  <span className="font-medium">
                    ¥{totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">¥{(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">¥{(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>¥{(totalPrice * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Host Information</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {mockListing.host.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{mockListing.host.name}</div>
                    <div className="text-sm text-gray-600">Superhost</div>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900 mb-1">Cancellation Policy</h4>
                <p className="text-blue-800 text-sm">
                  Flexible: Full refund up to 7 days before check-in
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link 
            href={`/listings/${orderData.listingId}`}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
          >
            ← Back to Listing
          </Link>
          
          <Link 
            href="/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            View My Orders →
          </Link>
        </div>
      </div>
    </div>
  );
}