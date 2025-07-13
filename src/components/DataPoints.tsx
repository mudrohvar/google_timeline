import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import type { DataPoint } from './DataUpload';

interface DataPointsProps {
  dataPoints: DataPoint[];
}

const DataPoints: React.FC<DataPointsProps> = ({ 
  dataPoints 
}) => {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    console.log("DataPoints useEffect triggered. Data points received:", dataPoints);
    if (!map) return;

    // Clear existing markers
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }
    markersRef.current = [];

    if (dataPoints.length === 0) return;

    // Create marker cluster group
    clusterGroupRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: false, // Keep markers on wrapped map
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let className = 'marker-cluster marker-cluster-';
        
        if (count < 10) {
          className += 'small';
        } else if (count < 100) {
          className += 'medium';
        } else {
          className += 'large';
        }

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className,
          iconSize: L.point(40, 40)
        });
      }
    });

    // Create markers for each data point, duplicating for wrapped world
    dataPoints.forEach((point) => {
      [-360, 0, 360].forEach(offset => {
        const marker = L.marker([point.latitude, point.longitude + offset], {
          icon: createCustomIcon(point.category, point)
        });

        // Create popup content
        const popupContent = createPopupContent(point);
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        // Add click handler for marker
        marker.on('click', () => {
          // You can add custom click behavior here
          console.log('Marker clicked:', point);
        });

        markersRef.current.push(marker);
        clusterGroupRef.current!.addLayer(marker);
      });
    });

    // Add cluster group to map
    map.addLayer(clusterGroupRef.current!);

    // Fit map to show all markers if there are multiple points
    if (dataPoints.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    const handleMoveEnd = () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.refreshClusters();
      }
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [dataPoints, map]);

  const createCustomIcon = (category?: string, point?: DataPoint): L.DivIcon => {
    // Define colors for different categories
    const categoryColors: { [key: string]: string } = {
      'restaurant': '#ff6b6b',
      'hotel': '#4ecdc4',
      'attraction': '#45b7d1',
      'shop': '#96ceb4',
      'transport': '#feca57',
      'default': '#6c5ce7'
    };

    let color = categoryColors[category?.toLowerCase() || 'default'] || categoryColors.default;
    let size = 12;
    let borderWidth = 2;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const createPopupContent = (point: DataPoint): string => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return dateString;
      }
    };

    return `
      <div class="popup-content">
        <h3 class="popup-title">${point.title}</h3>
        ${point.description ? `<p class="popup-description">${point.description}</p>` : ''}
        <div class="popup-details">
          <div class="popup-detail">
            <strong>Coordinates:</strong> ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}
          </div>
          ${point.category ? `<div class="popup-detail"><strong>Category:</strong> ${point.category}</div>` : ''}
          ${point.timestamp ? `<div class="popup-detail"><strong>Date:</strong> ${formatDate(point.timestamp)}</div>` : ''}
          ${point.visitCount ? `<div class="popup-detail"><strong>Visit Count:</strong> ${point.visitCount}</div>` : ''}
          ${point.lastVisit ? `<div class="popup-detail"><strong>Last Visit:</strong> ${formatDate(point.lastVisit)}</div>` : ''}
        </div>
        ${Object.keys(point).filter(key => !['id', 'latitude', 'longitude', 'title', 'description', 'timestamp', 'category'].includes(key)).length > 0 ? `
          <div class="popup-extra">
            <details>
              <summary>Additional Data</summary>
              <div class="popup-extra-data">
                ${Object.entries(point)
                  .filter(([key]) => !['id', 'latitude', 'longitude', 'title', 'description', 'timestamp', 'category'].includes(key))
                  .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                  .join('')}
              </div>
            </details>
          </div>
        ` : ''}
      </div>
    `;
  };

  return null; // This component doesn't render anything visible
};

export default DataPoints; 