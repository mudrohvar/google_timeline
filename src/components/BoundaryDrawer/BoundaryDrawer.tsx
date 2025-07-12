import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

interface Boundary {
  id: string;
  name: string;
  coordinates: L.LatLng[];
  color: string;
  layer: L.Polygon;
}

interface BoundaryDrawerProps {
  onBoundaryCreated?: (boundary: Boundary) => void;
  onBoundaryDeleted?: (boundaryId: string) => void;
}

const BoundaryDrawer: React.FC<BoundaryDrawerProps> = ({
  onBoundaryCreated,
  onBoundaryDeleted
}) => {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize drawing controls
  useEffect(() => {
    if (!map) return;

    // Create feature group to store drawn items
    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    // Initialize draw control
    drawControlRef.current = new L.Control.Draw({
      position: 'topright', // Changed from 'topleft' to 'topright'
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#3388ff',
            weight: 2,
            fillOpacity: 0.2
          }
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true
      }
    });

    map.addControl(drawControlRef.current);

    // Event listeners
    map.on('draw:created', handleDrawCreated);
    map.on('draw:deleted', handleDrawDeleted);
    map.on('draw:drawstart', () => setIsDrawing(true));
    map.on('draw:drawstop', () => setIsDrawing(false));

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
    };
  }, [map]);

  const handleDrawCreated = (event: any) => {
    const layer = event.layer as L.Polygon;
    const coordinates = layer.getLatLngs()[0] as L.LatLng[];
    
    const boundary: Boundary = {
      id: `boundary-${Date.now()}`,
      name: `Boundary ${boundaries.length + 1}`,
      coordinates,
      color: '#3388ff',
      layer
    };

    setBoundaries(prev => [...prev, boundary]);
    
    if (drawnItemsRef.current) {
      drawnItemsRef.current.addLayer(layer);
    }

    if (onBoundaryCreated) {
      onBoundaryCreated(boundary);
    }
  };

  const handleDrawDeleted = (event: any) => {
    const layers = event.layers;
    layers.eachLayer((layer: L.Layer) => {
      const boundary = boundaries.find(b => b.layer === layer);
      if (boundary) {
        setBoundaries(prev => prev.filter(b => b.id !== boundary.id));
        if (onBoundaryDeleted) {
          onBoundaryDeleted(boundary.id);
        }
      }
    });
  };

  const deleteBoundary = (boundaryId: string) => {
    const boundary = boundaries.find(b => b.id === boundaryId);
    if (boundary && drawnItemsRef.current) {
      drawnItemsRef.current.removeLayer(boundary.layer);
      setBoundaries(prev => prev.filter(b => b.id !== boundaryId));
      if (onBoundaryDeleted) {
        onBoundaryDeleted(boundaryId);
      }
    }
  };

  const updateBoundaryName = (boundaryId: string, name: string) => {
    setBoundaries(prev => 
      prev.map(b => b.id === boundaryId ? { ...b, name } : b)
    );
  };

  return null; // This component doesn't render anything visible
};

export default BoundaryDrawer; 