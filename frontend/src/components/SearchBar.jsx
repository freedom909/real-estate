'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Search places..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="px-3 py-2 rounded-md bg-blue-700 text-white placeholder-blue-200 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <Button 
        size="sm" 
        onClick={handleSearch}
        className="bg-blue-600 text-white hover:bg-blue-500 border border-blue-400"
      >
        Search
      </Button>
    </div>
  );
}