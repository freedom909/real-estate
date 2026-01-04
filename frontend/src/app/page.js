
import React from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image';
import Button from '@/components/ui/button';
import Link from 'next/link';
import JoinNowButton from '@/components/ui/JoinNowButton';
import ProfileMenu from '@/components/ui/ProfilesMenu';
import HeaderClient from '../components/ui/HeaderClient';
export default function Home() {


  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-900 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex space-x-4">
          <span>trusted</span>
          <span>unforgotten</span>
        </div>
        <div className="flex space-x-4">
          {/* <a href="#" className="underline">Get the Minshuku App</a> */}
          {/* Client-side header */}
          <HeaderClient />
        </div>

      </div>

      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">🏠 MINSHUKU</div>
        <nav className="space-x-4">
          <a href="#" className="hover:underline">Top Listings</a>
          <a href="#" className="hover:underline">Recommended</a>
          <a href="#" className="hover:underline">Search</a>
          <a href="#" className="hover:underline">Categories</a>
        </nav>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search places..."
            className="px-2 py-1 rounded-md text-black"
          />
          <Button size="sm">Search</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-100 py-8 text-center">
        <h1 className="text-3xl font-bold mb-2">FIND YOUR NEXT STAY</h1>
        <p className="text-xl">Explore amazing listings with <span className="text-orange-500 font-bold">AI-powered suggestions</span></p>
        <Button className="mt-4">Start Exploring</Button>
      </section>

      {/* Notice Bar */}
      <section className="bg-green-600 text-white text-center p-3">
        <p>✅ Trusted reviews | ✅ Secure payments | ✅ Instant bookings</p>
        <p className="text-sm">Minshuku will never request fees outside of the platform.</p>
      </section>

      {/* Featured Listings */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">🌟 Featured Listings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['Kyoto Inn', 'Beach House', 'Mountain Cabin', 'City Loft'].map((item, i) => (
            <div key={i} className="border rounded-md p-2 text-center">
              <div className="h-32 bg-gray-100 mb-2 flex items-center justify-center">
                <span className="text-sm text-gray-500">{item}</span>
              </div>
              <p className="text-xs text-gray-700">{Math.floor(Math.random() * 1000)}+ Booked</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-4">🗂️ Explore by Category</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {['Traditional', 'Modern', 'Nature', 'Luxury'].map((cat, i) => (
            <div
              key={i}
              className="flex-none w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-sm text-center text-gray-700"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-blue-900 text-white text-center py-4">
        <h2 className="text-lg font-semibold">🧠 Personalized AI Suggestions – Powered by aiService</h2>
      </section>
    </div>
  );
}
