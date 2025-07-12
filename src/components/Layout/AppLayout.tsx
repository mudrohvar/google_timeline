import React, { useState } from 'react';
import { Map, Search, Upload, Settings, Menu } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <Map className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Google Timeline Map</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (responsive) */}
        <aside
          className={
            `w-60 bg-white shadow-sm border-r border-gray-200 p-2 flex flex-col gap-3 z-20 transition-transform duration-200
            fixed inset-y-0 left-0 md:static md:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:flex md:relative md:translate-x-0`
          }
          style={{ minWidth: '15rem', maxWidth: '15rem' }}
        >
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Tools</h2>
            <div className="flex flex-col gap-1">
              <button className="w-full flex items-center space-x-2 px-2 py-2 text-sm rounded-lg transition-colors bg-blue-50 text-blue-700 font-semibold">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload Data</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Data Upload</h2>
            <DataUpload
              onDataProcessed={handleDataProcessed}
              onClearData={handleClearData}
              hasData={dataPoints.length > 0}
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Boundaries</h2>
            {boundaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 text-xs py-6">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                No boundaries drawn yet
              </div>
            ) : (
              <BoundaryList
                boundaries={boundaries}
                onDeleteBoundary={handleDeleteBoundary}
                onUpdateBoundaryName={handleUpdateBoundaryName}
                onSelectBoundary={handleSelectBoundary}
              />
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Map Area */}
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 