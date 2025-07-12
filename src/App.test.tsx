import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// Mock all child components to focus on App integration
vi.mock('./components/Layout/AppLayout', () => ({
  default: ({ children, boundaries, onBoundariesChange }: any) => (
    <div data-testid="app-layout">
      <header>Google Timeline Map</header>
      <aside>
        <div>Tools</div>
        <div>Search</div>
        <div>Upload Data</div>
        <div>Boundaries</div>
        <div data-testid="boundary-count">{boundaries?.length || 0} boundaries</div>
      </aside>
      <main>{children}</main>
    </div>
  )
}));

vi.mock('./components/Map/MapComponent', () => ({
  default: ({ onBoundariesChange }: any) => (
    <div data-testid="map-component">
      <div>Interactive Map</div>
      <button onClick={() => onBoundariesChange?.([{ id: 'test-1', name: 'Test Boundary' }])}>
        Add Test Boundary
      </button>
    </div>
  )
}));

test('renders main app with complete layout and functionality', () => {
  render(<App />);
  
  // Check for main app structure
  expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  expect(screen.getByTestId('map-component')).toBeInTheDocument();
  
  // Check for header content
  expect(screen.getByText('Google Timeline Map')).toBeInTheDocument();
  
  // Check for sidebar content
  expect(screen.getByText('Tools')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Upload Data')).toBeInTheDocument();
  expect(screen.getByText('Boundaries')).toBeInTheDocument();
  
  // Check for map content
  expect(screen.getByText('Interactive Map')).toBeInTheDocument();
});

test('starts with zero boundaries', () => {
  render(<App />);
  
  expect(screen.getByTestId('boundary-count')).toHaveTextContent('0 boundaries');
});

test('can add boundaries through map component', async () => {
  render(<App />);
  
  const addBoundaryButton = screen.getByText('Add Test Boundary');
  fireEvent.click(addBoundaryButton);
  
  await waitFor(() => {
    expect(screen.getByTestId('boundary-count')).toHaveTextContent('1 boundaries');
  });
});

test('boundary state is properly managed', async () => {
  render(<App />);
  
  // Initially no boundaries
  expect(screen.getByTestId('boundary-count')).toHaveTextContent('0 boundaries');
  
  // Add a boundary
  const addBoundaryButton = screen.getByText('Add Test Boundary');
  fireEvent.click(addBoundaryButton);
  
  await waitFor(() => {
    expect(screen.getByTestId('boundary-count')).toHaveTextContent('1 boundaries');
  });
});

test('boundary change handlers are properly connected', async () => {
  render(<App />);
  
  // Test that the boundary change handler is working
  const addBoundaryButton = screen.getByText('Add Test Boundary');
  
  // Click to add a boundary
  fireEvent.click(addBoundaryButton);
  
  await waitFor(() => {
    expect(screen.getByTestId('boundary-count')).toHaveTextContent('1 boundaries');
  });
}); 