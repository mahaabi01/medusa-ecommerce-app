'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { searchProducts } from '@lib/data/search';
import Search from '@modules/common/icons/search';
import Image from 'next/image';
import { HttpTypes } from '@medusajs/types';
import LocalizedClientLink from '@modules/common/components/localized-client-link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const countryCode = params?.countryCode as string || 'dk';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const { products } = await searchProducts({
        query: searchQuery,
        countryCode,
        limit: 8,
      });
      setResults(products);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  const handleSearch = () => {
    if (query.trim()) {
      setShowResults(false);
      router.push(`/${countryCode}/store?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowResults(true)}
          className="border border-gray-300 rounded-full px-4 py-2 w-full pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary opacity-60 hover:bg-[#EC1158]text-white rounded-full transition-colors"
          aria-label="Search"
        >
          <Search size={16} color="white" />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[500px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {results.map((product) => (
                  <li key={product.id}>
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title || 'Product'}
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </h4>
                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                        {product.variants && product.variants.length > 0 && (
                          <p className="text-sm font-semibold text-[#EC1158] mt-1">
                            {product.variants[0].calculated_price?.calculated_amount
                              ? new Intl.NumberFormat('da-DK', {
                                  style: 'currency',
                                  currency: product.variants[0].calculated_price.currency_code || 'DKK',
                                }).format(product.variants[0].calculated_price.calculated_amount / 100)
                              : ''}
                          </p>
                        )}
                      </div>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
              {results.length >= 8 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-[#EC1158]  font-medium"
                  >
                    View all results →
                  </button>
                </div>
              )}
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
