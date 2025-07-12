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
  filters
}) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  const handleSearch = (query: string) => {
    // Simulate search results - in real implementation, this would call a geocoding API
    console.log('Searching for:', query);
    // For now, just add a mock result
    const mockResult = {
      lat: 40.7128,
      lng: -74.0060,
      name: query
    };
    setSearchResults([mockResult]);
    setCenter([mockResult.lat, mockResult.lng]);
    setZoom(10);
  };

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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
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
      
      <SearchBar onSearch={handleSearch} onLocationSelect={handleLocationSelect} />
    </div>
  );
};

export default MapComponent; 