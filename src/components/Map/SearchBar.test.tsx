import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

test('renders search bar with input and current location button', () => {
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  expect(searchInput).toBeInTheDocument();
  
  const currentLocationButton = screen.getByText('Use Current Location');
  expect(currentLocationButton).toBeInTheDocument();
});

test('search input updates value', () => {
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  fireEvent.change(searchInput, { target: { value: 'San Francisco' } });
  
  expect(searchInput).toHaveValue('San Francisco');
});

test('form submission calls onSearch with trimmed value', async () => {
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  const searchForm = searchInput.closest('form');
  
  fireEvent.change(searchInput, { target: { value: '  London  ' } });
  fireEvent.submit(searchForm!);
  
  await waitFor(() => {
    expect(mockOnSearch).toHaveBeenCalledWith('London');
  });
});

test('form submission does not call onSearch with empty value', async () => {
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  const searchForm = searchInput.closest('form');
  
  fireEvent.submit(searchForm!);
  
  await waitFor(() => {
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});

test('current location button calls geolocation API', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn()
  };
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const currentLocationButton = screen.getByText('Use Current Location');
  fireEvent.click(currentLocationButton);
  
  expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
});

test('current location success calls onLocationSelect', async () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    })
  };
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const currentLocationButton = screen.getByText('Use Current Location');
  fireEvent.click(currentLocationButton);
  
  await waitFor(() => {
    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      lat: 40.7128,
      lng: -74.0060,
      name: 'Current Location'
    });
  });
});

test('current location error is handled gracefully', async () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn((success, error) => {
      error(new Error('Geolocation error'));
    })
  };
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
  
  const mockOnSearch = vi.fn();
  const mockOnLocationSelect = vi.fn();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const currentLocationButton = screen.getByText('Use Current Location');
  fireEvent.click(currentLocationButton);
  
  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalled();
  });
  
  consoleSpy.mockRestore();
});

test('loading state is shown during search', async () => {
  let resolvePromise: () => void = () => {};
  const mockOnSearch = vi.fn(() => new Promise<void>(resolve => { resolvePromise = resolve; }));
  const mockOnLocationSelect = vi.fn();
  
  render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />);
  
  const searchInput = screen.getByPlaceholderText('Search for a location...');
  const searchForm = searchInput.closest('form');
  
  fireEvent.change(searchInput, { target: { value: 'Tokyo' } });
  fireEvent.submit(searchForm!);
  
  // Check that input is disabled during loading
  expect(searchInput).toBeDisabled();
  
  // Resolve the promise to simulate async completion
  resolvePromise();
  
  // Wait for the input to be enabled again
  await waitFor(() => {
    expect(searchInput).not.toBeDisabled();
  });
}); 