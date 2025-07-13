import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';
import StatisticsDashboard from './components/StatisticsDashboard';
import DataUpload from './components/DataUpload';
import type { DataPoint } from './components/DataUpload';

function App() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);

  

  

  return (
    <AppLayout>
      <MapComponent 
        dataPoints={dataPoints}
      />
      <div className="absolute top-4 left-4 z-[1000]">
        <DataUpload
          onDataProcessed={setDataPoints}
          onClearData={() => setDataPoints([])}
          hasData={dataPoints.length > 0}
        />
      </div>
      
      {/* Phase 5 Components */}
      
      
      <StatisticsDashboard
        dataPoints={dataPoints}
        isOpen={isStatsPanelOpen}
        onToggle={() => setIsStatsPanelOpen(!isStatsPanelOpen)}
      />
    </AppLayout>
  );
}

export default App;
