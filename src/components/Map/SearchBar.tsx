import React, { useState, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch for suggestions
  const fetchSuggestions = debounce(async (q: string) => {
    if (!q.trim() || q.length < 4) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      setSuggestions([]);
    }
    setIsLoading(false);
  }, 600);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    fetchSuggestions(e.target.value);
  };

  const handleSuggestionClick = (s: any) => {
    setQuery(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    if (onLocationSelect) {
      onLocationSelect({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), name: s.display_name });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlighted((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && highlighted < suggestions.length) {
        handleSuggestionClick(suggestions[highlighted]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          {showSuggestions && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {query.length < 4 ? (
                <li className="px-4 py-2 text-gray-400 select-none">Type more to search</li>
              ) : suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <li
                    key={s.place_id}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${i === highlighted ? 'bg-blue-100' : ''}`}
                    onMouseDown={() => handleSuggestionClick(s)}
                    onMouseEnter={() => setHighlighted(i)}
                  >
                    {s.display_name}
                  </li>
                ))
              ) : (
                !isLoading && (
                  <li className="px-4 py-2 text-gray-400 select-none">No matches found</li>
                )
              )}
            </ul>
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