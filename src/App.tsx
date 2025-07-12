import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';
import FilterPanel from './components/FilterPanel';
import StatisticsDashboard from './components/StatisticsDashboard';
import ExportPanel from './components/ExportPanel';
import type { DataPoint } from './components/DataUpload';
import type { FilterOptions } from './components/FilterPanel';

interface Boundary {
  id: string;
  name: string;
  coordinates: any[];
  color: string;
}

function App() {
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    showVisitFrequency: false
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);

  const handleBoundariesChange = (newBoundaries: Boundary[]) => {
    setBoundaries(newBoundaries);
  };

  const handleDataPointsChange = (newDataPoints: DataPoint[]) => {
    setDataPoints(newDataPoints);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Get unique categories from data points
  const availableCategories = [...new Set(dataPoints.map(p => p.category).filter(Boolean))] as string[];

  return (
    <AppLayout 
      boundaries={boundaries}
      onBoundariesChange={handleBoundariesChange}
      dataPoints={dataPoints}
      onDataPointsChange={handleDataPointsChange}
    >
      <MapComponent 
        onBoundariesChange={handleBoundariesChange}
        dataPoints={dataPoints}
        filters={filters}
        onToggleFilterPanel={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      />
      
      {/* Phase 5 Components */}
      <FilterPanel
        onFiltersChange={handleFiltersChange}
        availableCategories={availableCategories}
        isOpen={isFilterPanelOpen}
        onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      />
      
      <StatisticsDashboard
        dataPoints={dataPoints}
        isOpen={isStatsPanelOpen}
        onToggle={() => setIsStatsPanelOpen(!isStatsPanelOpen)}
      />
      
      <ExportPanel
        dataPoints={dataPoints}
        filters={filters}
        isOpen={isExportPanelOpen}
        onToggle={() => setIsExportPanelOpen(!isExportPanelOpen)}
      />
    </AppLayout>
  );
}

export default App;
