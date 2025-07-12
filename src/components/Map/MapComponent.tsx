import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SearchBar from './SearchBar';
import BoundaryDrawer from '../BoundaryDrawer/BoundaryDrawer';
import DataPoints from '../DataPoints';
import type { DataPoint } from '../DataUpload';
import type { FilterOptions } from '../FilterPanel';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Boundary {
  id: string;
  name: string;
  coordinates: L.LatLng[];
  color: string;
  layer: L.Polygon;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  onBoundariesChange?: (boundaries: Boundary[]) => void;
  dataPoints?: DataPoint[];
  filters?: FilterOptions;
  onToggleFilterPanel?: () => void;
}

// Component to handle map view changes and store map reference
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  onMapReady: (map: L.Map) => void;
}> = ({ center, zoom, onMapReady }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(center, zoom);
    onMapReady(map);
  }, [center, zoom, map, onMapReady]);
  
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  center: initialCenter = [20, 0], 
  zoom: initialZoom = 2,
  onBoundariesChange,
  dataPoints = [],
  filters,
  onToggleFilterPanel
}) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // handleSearch is not used for real geocoding anymore; can be removed or left empty if required by props.

  const handleLocationSelect = (location: { lat: number; lng: number; name: string }) => {
    setCenter([location.lat, location.lng]);
    setZoom(12);
    setSearchResults([location]);
  };

  const handleBoundaryCreated = (boundary: Boundary) => {
    setBoundaries(prev => [...prev, boundary]);
    if (onBoundariesChange) {
      onBoundariesChange([...boundaries, boundary]);
    }
  };

  const handleBoundaryDeleted = (boundaryId: string) => {
    setBoundaries(prev => prev.filter(b => b.id !== boundaryId));
    if (onBoundariesChange) {
      onBoundariesChange(boundaries.filter(b => b.id !== boundaryId));
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        minZoom={3}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {/* Search results markers */}
        {searchResults.map((result, index) => (
          <Marker key={index} position={[result.lat, result.lng]}>
            <Popup>
              <div>
                <h3 className="font-medium">{result.name}</h3>
                <p className="text-sm text-gray-600">
                  {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapController 
          center={center} 
          zoom={zoom} 
          onMapReady={(map) => { mapRef.current = map; }}
        />
        
        {/* Boundary Drawing Component */}
        <BoundaryDrawer
          onBoundaryCreated={handleBoundaryCreated}
          onBoundaryDeleted={handleBoundaryDeleted}
        />
        
        {/* Data Points Component */}
        <DataPoints 
          dataPoints={dataPoints} 
          map={mapRef.current}
          showVisitFrequency={filters?.showVisitFrequency}
          timeRange={filters?.timeRange}
          minVisitCount={filters?.minVisitCount}
          maxVisitCount={filters?.maxVisitCount}
          categories={filters?.categories}
        />
      </MapContainer>
      
      <SearchBar onSearch={() => {}} onLocationSelect={handleLocationSelect} />

      {/* Filter Panel Toggle Button (top right, below boundary tools) */}
      <div className="absolute top-40 right-4 z-[1000] flex flex-col items-end space-y-2">
        <button
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 text-sm font-medium flex items-center space-x-2"
          onClick={onToggleFilterPanel}
        >
          <span>Filter</span>
          {/* You can add a filter icon here if desired */}
        </button>
      </div>
    </div>
  );
};

export default MapComponent; 