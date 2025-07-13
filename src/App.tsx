import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';
import StatisticsDashboard from './components/StatisticsDashboard';
import type { DataPoint } from './components/DataUpload';

function App() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);

  const handleDataPointsChange = (newDataPoints: DataPoint[]) => {
    setDataPoints(newDataPoints);
  };

  

  return (
    <AppLayout 
      dataPoints={dataPoints}
      onDataPointsChange={handleDataPointsChange}
    >
      <MapComponent 
        dataPoints={dataPoints}
      />
      
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
