import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AppLayout from './AppLayout';

// Mock BoundaryList component
vi.mock('../BoundaryDrawer/BoundaryList', () => ({
  default: ({ boundaries, onDeleteBoundary, onUpdateBoundaryName, onSelectBoundary }: any) => (
    <div data-testid="boundary-list">
      {boundaries.length === 0 ? (
        <div>No boundaries drawn yet</div>
      ) : (
        boundaries.map((boundary: any) => (
          <div key={boundary.id} data-testid={`boundary-${boundary.id}`}>
            <span>{boundary.name}</span>
            <button onClick={() => onDeleteBoundary(boundary.id)}>Delete</button>
            <button onClick={() => onUpdateBoundaryName(boundary.id, 'Updated Name')}>Update</button>
            <button onClick={() => onSelectBoundary(boundary)}>Select</button>
          </div>
        ))
      )}
    </div>
  )
}));

const mockBoundaries = [
  {
    id: 'boundary-1',
    name: 'Downtown Area',
    coordinates: [{ lat: 40.7128, lng: -74.0060 }],
    color: '#3388ff'
  },
  {
    id: 'boundary-2',
    name: 'Central Park',
    coordinates: [{ lat: 40.7829, lng: -73.9654 }],
    color: '#3388ff'
  }
];

test('renders header with app title and icon', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  expect(screen.getByText('Google Timeline Map')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Upload Data')).toBeInTheDocument();
});

test('renders sidebar with tools section', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  expect(screen.getByText('Tools')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Upload Data')).toBeInTheDocument();
});

test('renders boundaries section', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  expect(screen.getByText('Boundaries')).toBeInTheDocument();
  expect(screen.getByTestId('boundary-list')).toBeInTheDocument();
});

test('renders empty boundary state', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  expect(screen.getByText('No boundaries drawn yet')).toBeInTheDocument();
});

test('renders boundary list when boundaries are provided', () => {
  render(<AppLayout boundaries={mockBoundaries}>Test Content</AppLayout>);
  
  expect(screen.getByText('Downtown Area')).toBeInTheDocument();
  expect(screen.getByText('Central Park')).toBeInTheDocument();
  expect(screen.getByTestId('boundary-boundary-1')).toBeInTheDocument();
  expect(screen.getByTestId('boundary-boundary-2')).toBeInTheDocument();
});

test('calls onBoundariesChange when boundary is deleted', () => {
  const mockOnBoundariesChange = vi.fn();
  render(
    <AppLayout 
      boundaries={mockBoundaries}
      onBoundariesChange={mockOnBoundariesChange}
    >
      Test Content
    </AppLayout>
  );
  
  const deleteButtons = screen.getAllByText('Delete');
  fireEvent.click(deleteButtons[0]);
  
  expect(mockOnBoundariesChange).toHaveBeenCalledWith([
    mockBoundaries[1] // Only the second boundary should remain
  ]);
});

test('calls onBoundariesChange when boundary name is updated', () => {
  const mockOnBoundariesChange = vi.fn();
  render(
    <AppLayout 
      boundaries={mockBoundaries}
      onBoundariesChange={mockOnBoundariesChange}
    >
      Test Content
    </AppLayout>
  );
  
  const updateButtons = screen.getAllByText('Update');
  fireEvent.click(updateButtons[0]);
  
  expect(mockOnBoundariesChange).toHaveBeenCalledWith([
    { ...mockBoundaries[0], name: 'Updated Name' },
    mockBoundaries[1]
  ]);
});

test('calls onSelectBoundary when boundary is selected', () => {
  const mockOnBoundariesChange = vi.fn();
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  
  render(
    <AppLayout 
      boundaries={mockBoundaries}
      onBoundariesChange={mockOnBoundariesChange}
    >
      Test Content
    </AppLayout>
  );
  
  const selectButtons = screen.getAllByText('Select');
  fireEvent.click(selectButtons[0]);
  
  expect(consoleSpy).toHaveBeenCalledWith('Selected boundary:', mockBoundaries[0]);
  
  consoleSpy.mockRestore();
});

test('renders children in main content area', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});

test('settings button is present and clickable', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  // Find the settings button by its title
  const settingsButton = screen.getByTitle('Settings');
  expect(settingsButton).toBeInTheDocument();
  
  fireEvent.click(settingsButton);
  // Button should be clickable without errors
});

test('search button is present and clickable', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  const searchButton = screen.getByText('Search');
  expect(searchButton).toBeInTheDocument();
  
  fireEvent.click(searchButton);
  // Button should be clickable without errors
});

test('upload data button is present and clickable', () => {
  render(<AppLayout>Test Content</AppLayout>);
  
  const uploadButton = screen.getByText('Upload Data');
  expect(uploadButton).toBeInTheDocument();
  
  fireEvent.click(uploadButton);
  // Button should be clickable without errors
}); 