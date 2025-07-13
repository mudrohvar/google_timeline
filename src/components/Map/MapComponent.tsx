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

const MapComponent: React.FC<MapComponentProps> = ({ 
  center: initialCenter = [20, 0], 
  zoom: initialZoom = 2,
  dataPoints = []
}) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);

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
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        
        {/* Data Points Component */}
        <DataPoints 
          dataPoints={dataPoints} 
        />
      </MapContainer>
      
      

      

      
    </div>
  );
};

export default MapComponent; 