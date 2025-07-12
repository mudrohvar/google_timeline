import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';

interface Boundary {
  id: string;
  name: string;
  coordinates: any[];
  color: string;
}

function App() {
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);

  const handleBoundariesChange = (newBoundaries: Boundary[]) => {
    setBoundaries(newBoundaries);
  };

  return (
    <AppLayout 
      boundaries={boundaries}
      onBoundariesChange={handleBoundariesChange}
    >
      <MapComponent onBoundariesChange={handleBoundariesChange} />
    </AppLayout>
  );
}

export default App;
