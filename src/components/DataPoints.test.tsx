import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import DataPoints from './DataPoints';
import type { DataPoint } from './DataUpload';

// Mock Leaflet
const mockMap = {
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  fitBounds: vi.fn(),
} as any;

const mockMarkerClusterGroup = {
  addLayer: vi.fn(),
  getChildCount: vi.fn(),
};

const mockMarker = {
  bindPopup: vi.fn(),
  on: vi.fn(),
};

const mockDivIcon = vi.fn(() => ({}));
const mockFeatureGroup = vi.fn(() => ({
  getBounds: vi.fn(() => ({
    pad: vi.fn(() => ({}))
  }))
}));

vi.mock('leaflet', () => ({
  default: {
    marker: vi.fn(() => mockMarker),
    markerClusterGroup: vi.fn(() => mockMarkerClusterGroup),
    divIcon: mockDivIcon,
    featureGroup: mockFeatureGroup,
    point: vi.fn(),
  },
}));

vi.mock('leaflet.markercluster', () => ({}));

describe('DataPoints', () => {
  const mockDataPoints: DataPoint[] = [
    {
      id: '1',
      latitude: 40.7128,
      longitude: -74.006,
      title: 'New York',
      description: 'Big Apple',
      category: 'attraction'
    },
    {
      id: '2',
      latitude: 34.0522,
      longitude: -118.2437,
      title: 'Los Angeles',
      description: 'City of Angels',
      category: 'attraction'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing (component is invisible)', () => {
    const { container } = render(
      <DataPoints dataPoints={mockDataPoints} map={mockMap} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not process data when map is null', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={null} />);

    expect(mockMap.addLayer).not.toHaveBeenCalled();
  });

  it('does not process data when dataPoints is empty', () => {
    render(<DataPoints dataPoints={[]} map={mockMap} />);

    expect(mockMap.addLayer).not.toHaveBeenCalled();
  });

  it('creates markers for each data point', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={mockMap} />);

    expect(mockMap.addLayer).toHaveBeenCalledWith(mockMarkerClusterGroup);
    expect(mockMarkerClusterGroup.addLayer).toHaveBeenCalledTimes(2);
  });

  it('binds popups to markers', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={mockMap} />);

    expect(mockMarker.bindPopup).toHaveBeenCalledTimes(2);
  });

  it('adds click handlers to markers', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={mockMap} />);

    expect(mockMarker.on).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('fits map bounds when multiple data points exist', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={mockMap} />);

    expect(mockFeatureGroup).toHaveBeenCalledWith([mockMarker, mockMarker]);
  });

  it('does not fit bounds for single data point', () => {
    const singlePoint = [mockDataPoints[0]];
    render(<DataPoints dataPoints={singlePoint} map={mockMap} />);

    expect(mockFeatureGroup).not.toHaveBeenCalled();
  });

  it('cleans up layers on unmount', () => {
    const { unmount } = render(
      <DataPoints dataPoints={mockDataPoints} map={mockMap} />
    );

    unmount();

    expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarkerClusterGroup);
  });

  it('creates custom icons based on category', () => {
    render(<DataPoints dataPoints={mockDataPoints} map={mockMap} />);

    expect(mockDivIcon).toHaveBeenCalledTimes(2);
  });

  it('handles data points without category', () => {
    const dataPointsWithoutCategory: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple'
      }
    ];

    render(<DataPoints dataPoints={dataPointsWithoutCategory} map={mockMap} />);

    expect(mockDivIcon).toHaveBeenCalled();
  });

  it('handles data points with additional properties', () => {
    const dataPointsWithExtraProps: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple',
        category: 'attraction',
        customField: 'custom value',
        rating: 5
      }
    ];

    render(<DataPoints dataPoints={dataPointsWithExtraProps} map={mockMap} />);

    expect(mockMarker.bindPopup).toHaveBeenCalledWith(
      expect.stringContaining('customField'),
      expect.any(Object)
    );
  });

  it('formats dates in popup content', () => {
    const dataPointsWithDate: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple',
        timestamp: '2023-01-15'
      }
    ];

    render(<DataPoints dataPoints={dataPointsWithDate} map={mockMap} />);

    expect(mockMarker.bindPopup).toHaveBeenCalledWith(
      expect.stringContaining('2023-01-15'),
      expect.any(Object)
    );
  });

  it('handles invalid coordinates gracefully', () => {
    const dataPointsWithInvalidCoords: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple'
      },
      {
        id: '2',
        latitude: NaN,
        longitude: NaN,
        title: 'Invalid Point',
        description: 'Invalid coordinates'
      }
    ];

    render(<DataPoints dataPoints={dataPointsWithInvalidCoords} map={mockMap} />);

    // Should only create markers for valid coordinates
    expect(mockMarkerClusterGroup.addLayer).toHaveBeenCalledTimes(1);
  });
}); 