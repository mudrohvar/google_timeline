import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { DataPoint } from './DataUpload';

interface DataPointsProps {
  dataPoints: DataPoint[];
  map: L.Map | null;
  showVisitFrequency?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
  minVisitCount?: number;
  maxVisitCount?: number;
  categories?: string[];
}

const DataPoints: React.FC<DataPointsProps> = ({ 
  dataPoints, 
  map, 
  showVisitFrequency = false,
  timeRange,
  minVisitCount,
  maxVisitCount,
  categories
}) => {
  const markersRef = useRef<L.Marker[]>([]);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }
    markersRef.current = [];

    if (dataPoints.length === 0) return;

    // Create marker cluster group
    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
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

    // Filter data points based on time range and visit count
    const filteredDataPoints = dataPoints.filter(point => {
      // Filter by time range if specified
      if (timeRange && point.timestamp) {
        const pointDate = new Date(point.timestamp);
        if (pointDate < timeRange.start || pointDate > timeRange.end) {
          return false;
        }
      }
      
      // Filter by visit count if specified
      if (minVisitCount !== undefined && (point.visitCount || 0) < minVisitCount) {
        return false;
      }
      if (maxVisitCount !== undefined && (point.visitCount || 0) > maxVisitCount) {
        return false;
      }
      
      // Filter by category if specified
      if (categories && categories.length > 0) {
        if (!point.category || !categories.includes(point.category)) {
          return false;
        }
      }
      
      return true;
    });

    // Create markers for each filtered data point
    filteredDataPoints.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: createCustomIcon(point.category, point, showVisitFrequency)
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

    // Add cluster group to map
    map.addLayer(clusterGroupRef.current!);

    // Fit map to show all markers if there are multiple points
    if (dataPoints.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [dataPoints, map, showVisitFrequency, timeRange, minVisitCount, maxVisitCount, categories]);

  const createCustomIcon = (category?: string, point?: DataPoint, showVisitFrequency?: boolean): L.DivIcon => {
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

    // Adjust marker appearance based on visit frequency if enabled
    if (showVisitFrequency && point) {
      const visitCount = point.visitCount || 1;
      
      // Size based on visit count (min 8px, max 20px)
      size = Math.max(8, Math.min(20, 8 + (visitCount * 2)));
      
      // Color intensity based on visit count
      if (visitCount > 5) {
        color = '#ff4757'; // Bright red for high frequency
      } else if (visitCount > 3) {
        color = '#ff6b6b'; // Medium red
      } else if (visitCount > 1) {
        color = '#ffa502'; // Orange
      }
      
      // Border width based on recency
      if (point.lastVisit) {
        const lastVisitDate = new Date(point.lastVisit);
        const daysSinceLastVisit = (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastVisit < 7) {
          borderWidth = 4; // Thick border for recent visits
        } else if (daysSinceLastVisit < 30) {
          borderWidth = 3; // Medium border
        }
      }
    }

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${showVisitFrequency && point?.visitCount ? `
            position: relative;
          ` : ''}
        ">
          ${showVisitFrequency && point?.visitCount && point.visitCount > 1 ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: #2f3542;
              color: white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              font-size: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            ">${point.visitCount}</div>
          ` : ''}
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