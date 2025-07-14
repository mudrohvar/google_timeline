import React, { useState, useMemo } from 'react';
import AppLayout from './components/Layout/AppLayout';
import MapComponent from './components/Map/MapComponent';
import StatisticsDashboard from './components/StatisticsDashboard';
import DataUpload from './components/DataUpload';
import type { DataPoint } from './components/DataUpload';

function App() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const handleMonthSelect = (month: string | null) => {
    setSelectedMonth(month);
  };

  const filteredDataPoints = useMemo(() => {
    if (!selectedMonth) {
      return dataPoints;
    }
    return dataPoints.filter(point => point.monthYear === selectedMonth);
  }, [dataPoints, selectedMonth]);

  return (
    <AppLayout>
      <MapComponent 
        dataPoints={filteredDataPoints}
      />
      <div className="absolute top-4 left-4 z-[1000]">
        <DataUpload
          onDataProcessed={(data) => {
            setDataPoints(data);
            setSelectedMonth(null);
          }}
          onClearData={() => {
            setDataPoints([]);
            setSelectedMonth(null);
          }}
          hasData={dataPoints.length > 0}
        />
      </div>
      
      {/* Phase 5 Components */}
      
      
      <StatisticsDashboard
        dataPoints={dataPoints}
        isOpen={isStatsPanelOpen}
        onToggle={() => setIsStatsPanelOpen(!isStatsPanelOpen)}
        onMonthSelect={handleMonthSelect}
        selectedMonth={selectedMonth}
      />
    </AppLayout>
  );
}

export default App;
