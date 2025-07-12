import React, { useState } from 'react';
import { Filter, Calendar, BarChart3, X } from 'lucide-react';

export interface FilterOptions {
  timeRange?: {
    start: Date;
    end: Date;
  };
  minVisitCount?: number;
  maxVisitCount?: number;
  categories?: string[];
  showVisitFrequency: boolean;
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  availableCategories,
  isOpen,
  onToggle
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    showVisitFrequency: false
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleFilterChange({ categories: newCategories });
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      showVisitFrequency: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string) => {
    return new Date(dateString);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-[1001] bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Open Filters"
      >
        <Filter className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-[1001] bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Visit Frequency Toggle */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BarChart3 className="h-4 w-4" />
            Show Visit Frequency
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="visit-frequency"
              checked={filters.showVisitFrequency}
              onChange={(e) => handleFilterChange({ showVisitFrequency: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="visit-frequency" className="ml-2 text-sm text-gray-600">
              Color and size markers by visit frequency
            </label>
          </div>
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4" />
            Time Range
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.timeRange?.start ? formatDate(filters.timeRange.start) : ''}
                onChange={(e) => {
                  const startDate = e.target.value ? parseDate(e.target.value) : undefined;
                  handleFilterChange({
                    timeRange: {
                      start: startDate || new Date(),
                      end: filters.timeRange?.end || new Date()
                    }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.timeRange?.end ? formatDate(filters.timeRange.end) : ''}
                onChange={(e) => {
                  const endDate = e.target.value ? parseDate(e.target.value) : undefined;
                  handleFilterChange({
                    timeRange: {
                      start: filters.timeRange?.start || new Date(),
                      end: endDate || new Date()
                    }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Visit Count Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BarChart3 className="h-4 w-4" />
            Visit Count Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                min="0"
                value={filters.minVisitCount || ''}
                onChange={(e) => handleFilterChange({ 
                  minVisitCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max</label>
              <input
                type="number"
                min="0"
                value={filters.maxVisitCount || ''}
                onChange={(e) => handleFilterChange({ 
                  maxVisitCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!filters.categories || filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 capitalize">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 