import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';
import type { DataPoint } from './components/DataUpload';

interface Boundary {
  id: string;
  name: string;
  coordinates: any[];
  color: string;
}

function App() {
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  const handleBoundariesChange = (newBoundaries: Boundary[]) => {
    setBoundaries(newBoundaries);
  };

  const handleDataPointsChange = (newDataPoints: DataPoint[]) => {
    setDataPoints(newDataPoints);
  };

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
      />
    </AppLayout>
  );
}

export default App;
