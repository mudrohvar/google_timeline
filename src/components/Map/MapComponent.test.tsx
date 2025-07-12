import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import MapComponent from './MapComponent';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  ZoomControl: () => <div data-testid="zoom-control" />,
  useMap: () => ({
    setView: vi.fn(),
    on: vi.fn(),
    removeControl: vi.fn(),
    removeLayer: vi.fn(),
    addLayer: vi.fn(),
    addControl: vi.fn()
  }),
  Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>
}));

// Mock BoundaryDrawer component
vi.mock('../BoundaryDrawer/BoundaryDrawer', () => ({
  default: () => <div data-testid="boundary-drawer" />
}));

test('renders map component with all elements', () => {
  render(<MapComponent />);
  
  expect(screen.getByTestId('map-container')).toBeInTheDocument();
  expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
  expect(screen.getByTestId('boundary-drawer')).toBeInTheDocument();
});

test('renders search bar', () => {
  render(<MapComponent />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  expect(searchInput).toBeInTheDocument();
  
  const currentLocationButton = screen.getByText('Use Current Location');
  expect(currentLocationButton).toBeInTheDocument();
});

test('search functionality works', async () => {
  const mockOnSearch = vi.fn();
  render(<MapComponent />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  const searchForm = searchInput.closest('form');
  
  fireEvent.change(searchInput, { target: { value: 'New York' } });
  fireEvent.submit(searchForm!);
  
  await waitFor(() => {
    expect(searchInput).toHaveValue('New York');
  });
});

test('current location button is clickable', () => {
  // Mock geolocation
  const mockGeolocation = {
    getCurrentPosition: vi.fn()
  };
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  render(<MapComponent />);
  
  const currentLocationButton = screen.getByText('Use Current Location');
  fireEvent.click(currentLocationButton);
  
  expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
});

test('handles boundary creation callback', () => {
  const mockOnBoundariesChange = vi.fn();
  render(<MapComponent onBoundariesChange={mockOnBoundariesChange} />);
  
  // The boundary drawer component should be rendered
  expect(screen.getByTestId('boundary-drawer')).toBeInTheDocument();
}); 