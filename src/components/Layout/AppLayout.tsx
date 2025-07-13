import React, { useState } from 'react';
import { Map, Menu } from 'lucide-react';

import DataUpload from '../DataUpload';
import type { DataPoint } from '../DataUpload';

interface AppLayoutProps {
  children: React.ReactNode;
  dataPoints?: DataPoint[];
  onDataPointsChange?: (dataPoints: DataPoint[]) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  dataPoints = [],
  onDataPointsChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          

          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Data Upload</h2>
            <DataUpload
              onDataProcessed={handleDataProcessed}
              onClearData={handleClearData}
              hasData={dataPoints.length > 0}
            />
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