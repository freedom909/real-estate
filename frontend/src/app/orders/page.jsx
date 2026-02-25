"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { 
  GET_ORDERS_BY_GUEST, 
  GET_ORDERS_BY_HOST, 
  UPDATE_ORDER_STATUS, 
  CANCEL_ORDER,
  CONFIRM_ORDER 
} from "@/graphql/orders";
import HeaderClient from "@/components/ui/HeaderClient";
import HostNavigation from "@/components/HostNavigation";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("guest");
  const [error, setError] = useState("");

  // Guest orders query
  const { 
    data: guestOrdersData, 
    loading: guestLoading, 
    refetch: refetchGuestOrders 
  } = useQuery(GET_ORDERS_BY_GUEST, {
    variables: { guestId: session?.user?.id || "" },
    skip: !session?.user?.id || activeTab !== "guest"
  });

  // Host orders query
  const { 
    data: hostOrdersData, 
    loading: hostLoading, 
    refetch: refetchHostOrders 
  } = useQuery(GET_ORDERS_BY_HOST, {
    variables: { hostId: session?.user?.id || "" },
    skip: !session?.user?.id || activeTab !== "host"
  });

  // Order mutations
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [cancelOrder] = useMutation(CANCEL_ORDER);
  const [confirmOrder] = useMutation(CONFIRM_ORDER);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      if (newStatus === "CANCELLED") {
        await cancelOrder({ variables: { orderId } });
      } else if (newStatus === "CONFIRMED") {
        await confirmOrder({ variables: { orderId } });
      } else {
        await updateOrderStatus({ 
          variables: { 
            input: { orderId, status: newStatus } 
          } 
        });
      }
      
      // Refetch orders after update
      if (activeTab === "guest") {
        refetchGuestOrders();
      } else {
        refetchHostOrders();
      }
    } catch (err) {
      setError(err.message);
    }
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
            <p className="text-gray-600 mb-4">You must be logged in to view orders.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const guestOrders = guestOrdersData?.ordersByGuest || [];
  const hostOrders = hostOrdersData?.ordersByHost || [];
  const loading = activeTab === "guest" ? guestLoading : hostLoading;
  const orders = activeTab === "guest" ? guestOrders : hostOrders;

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
          <Link href="/orders" className="bg-white text-blue-800 px-3 py-1 rounded font-semibold">Orders</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </nav>
        <div className="text-sm">
          Welcome, {session.user?.name || session.user?.email}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage your orders as a guest or host</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "guest"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("guest")}
          >
            My Orders as Guest
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "host"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("host")}
          >
            My Orders as Host
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 font-semibold">Error</div>
            <div className="text-red-600">{error}</div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading orders...</div>
          </div>
        )}

        {!loading && (
          <div className="grid gap-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-500 text-lg mb-4">
                  No {activeTab} orders found
                </div>
                {activeTab === "guest" ? (
                  <Link href="/search" className="text-blue-600 hover:text-blue-800 font-medium">
                    Browse available listings
                  </Link>
                ) : (
                  <Link href="/listings" className="text-blue-600 hover:text-blue-800 font-medium">
                    View your listings
                  </Link>
                )}
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  isHostView={activeTab === "host"}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, isHostView, onStatusUpdate }) {
  const {
    id,
    orderNumber,
    guest,
    listing,
    checkInDate,
    checkOutDate,
    totalPrice,
    status,
    createdAt
  } = order;

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const fmtDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canConfirm = isHostView && status === "PENDING";

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{orderNumber}</h3>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
            <span className="text-sm text-gray-500">
              Created: {fmtDate(createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ${typeof totalPrice === "number" ? totalPrice.toFixed(2) : totalPrice}
          </div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {/* Listing Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Listing</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold">{listing?.title || "Unknown Listing"}</div>
            <div className="text-sm text-gray-600">
              {listing?.location}, {listing?.city}, {listing?.country}
            </div>
            {listing?.host && (
              <div className="text-xs text-gray-500 mt-1">
                Host: {listing.host.name}
              </div>
            )}
          </div>
        </div>

        {/* Guest/Host Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            {isHostView ? "Guest" : "Host"}
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            {isHostView ? (
              <>
                <div className="font-semibold">{guest?.name || "Unknown Guest"}</div>
                <div className="text-sm text-gray-600">{guest?.email}</div>
              </>
            ) : (
              <>
                <div className="font-semibold">{listing?.host?.name || "Unknown Host"}</div>
                <div className="text-sm text-gray-600">{listing?.host?.email}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <div className="text-gray-500">Check-in</div>
          <div className="font-medium">{fmtDate(checkInDate)}</div>
        </div>
        <div>
          <div className="text-gray-500">Check-out</div>
          <div className="font-medium">{fmtDate(checkOutDate)}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          View Details
        </button>
        
        {canCancel && (
          <button 
            className="border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm hover:bg-red-50"
            onClick={() => onStatusUpdate(id, "CANCELLED")}
          >
            Cancel Order
          </button>
        )}
        
        {canConfirm && (
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            onClick={() => onStatusUpdate(id, "CONFIRMED")}
          >
            Confirm Order
          </button>
        )}
        
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
          Contact {isHostView ? "Guest" : "Host"}
        </button>
      </div>
    </div>
  );
}