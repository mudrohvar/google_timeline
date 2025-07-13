import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';




import DataPoints from '../DataPoints';
import type { DataPoint } from '../DataUpload';

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



interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  dataPoints?: DataPoint[];
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
  dataPoints = []
}) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        minZoom={3}
        maxBounds={[[-85, -Infinity], [85, Infinity]]}
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
        
        
        
        {/* Data Points Component */}
        <DataPoints 
          dataPoints={dataPoints} 
          map={mapRef.current}
        />
      </MapContainer>
      
      

      

      
    </div>
  );
};

export default MapComponent; 