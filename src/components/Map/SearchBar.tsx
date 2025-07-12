import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim());
      // Simulate geocoding - in real implementation, this would call a geocoding service
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (onLocationSelect) {
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              name: 'Current Location'
            });
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </form>
      
      <button
        onClick={handleCurrentLocation}
        className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        disabled={isLoading}
      >
        <MapPin className="h-4 w-4" />
        <span>Use Current Location</span>
      </button>
    </div>
  );
};

export default SearchBar; 