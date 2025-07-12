import React, { useState } from 'react';
import { Map, Search, Upload, Settings } from 'lucide-react';
import BoundaryList from '../BoundaryDrawer/BoundaryList';
import DataUpload from '../DataUpload';
import type { DataPoint } from '../DataUpload';

interface Boundary {
  id: string;
  name: string;
  coordinates: any[];
  color: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  boundaries?: Boundary[];
  onBoundariesChange?: (boundaries: Boundary[]) => void;
  dataPoints?: DataPoint[];
  onDataPointsChange?: (dataPoints: DataPoint[]) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  boundaries = [],
  onBoundariesChange,
  dataPoints = [],
  onDataPointsChange
}) => {
  const handleDeleteBoundary = (boundaryId: string) => {
    const updatedBoundaries = boundaries.filter(b => b.id !== boundaryId);
    if (onBoundariesChange) {
      onBoundariesChange(updatedBoundaries);
    }
  };

  const handleUpdateBoundaryName = (boundaryId: string, name: string) => {
    const updatedBoundaries = boundaries.map(b => 
      b.id === boundaryId ? { ...b, name } : b
    );
    if (onBoundariesChange) {
      onBoundariesChange(updatedBoundaries);
    }
  };

  const handleSelectBoundary = (boundary: Boundary) => {
    // TODO: Implement boundary selection (zoom to boundary, highlight, etc.)
    console.log('Selected boundary:', boundary);
  };

  const handleDataProcessed = (data: DataPoint[]) => {
    if (onDataPointsChange) {
      onDataPointsChange(data);
    }
  };

  const handleClearData = () => {
    if (onDataPointsChange) {
      onDataPointsChange([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Map className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Google Timeline Map</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-gray-900">Tools</h2>
              <div className="space-y-1">
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Data</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-gray-900">Data Upload</h2>
              <DataUpload
                onDataProcessed={handleDataProcessed}
                onClearData={handleClearData}
                hasData={dataPoints.length > 0}
              />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-gray-900">Boundaries</h2>
              <BoundaryList
                boundaries={boundaries}
                onDeleteBoundary={handleDeleteBoundary}
                onUpdateBoundaryName={handleUpdateBoundaryName}
                onSelectBoundary={handleSelectBoundary}
              />
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 