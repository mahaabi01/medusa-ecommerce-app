'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Search from '@modules/common/icons/search';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="border rounded-full px-4 py-2 w-full"
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-blue-500 text-white rounded-full"
      >
        <Search size={16} color="white"/> 
      </button>
    </div>
  );
}
