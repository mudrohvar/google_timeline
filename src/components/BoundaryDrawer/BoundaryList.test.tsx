import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import BoundaryList from './BoundaryList';

const mockBoundaries = [
  {
    id: 'boundary-1',
    name: 'Downtown Area',
    coordinates: [{ lat: 40.7128, lng: -74.0060 }, { lat: 40.7589, lng: -73.9851 }],
    color: '#3388ff'
  },
  {
    id: 'boundary-2',
    name: 'Central Park',
    coordinates: [{ lat: 40.7829, lng: -73.9654 }, { lat: 40.8006, lng: -73.9581 }],
    color: '#3388ff'
  }
];

test('renders empty state when no boundaries', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={[]}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  expect(screen.getByText('No boundaries drawn yet')).toBeInTheDocument();
});

test('renders boundary list with multiple boundaries', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  expect(screen.getByText('Downtown Area')).toBeInTheDocument();
  expect(screen.getByText('Central Park')).toBeInTheDocument();
  expect(screen.getAllByText('2 points')).toHaveLength(2);
});

test('boundary name is clickable and calls onSelectBoundary', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const downtownBoundary = screen.getByText('Downtown Area');
  fireEvent.click(downtownBoundary);
  
  expect(mockOnSelectBoundary).toHaveBeenCalledWith(mockBoundaries[0]);
});

test('edit button starts editing mode', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  expect(editInput).toBeInTheDocument();
  
  const saveButton = screen.getByText('Save');
  const cancelButton = screen.getByText('Cancel');
  expect(saveButton).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();
});

test('save button updates boundary name', async () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  fireEvent.change(editInput, { target: { value: 'New Downtown Area' } });
  
  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);
  
  await waitFor(() => {
    expect(mockOnUpdateBoundaryName).toHaveBeenCalledWith('boundary-1', 'New Downtown Area');
  });
  
  // Should exit edit mode
  expect(screen.queryByDisplayValue('New Downtown Area')).not.toBeInTheDocument();
});

test('cancel button exits edit mode without saving', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  fireEvent.change(editInput, { target: { value: 'Changed Name' } });
  
  const cancelButton = screen.getByText('Cancel');
  fireEvent.click(cancelButton);
  
  expect(mockOnUpdateBoundaryName).not.toHaveBeenCalled();
  expect(screen.queryByDisplayValue('Changed Name')).not.toBeInTheDocument();
});

test('delete button calls onDeleteBoundary', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const deleteButtons = screen.getAllByTitle('Delete boundary');
  fireEvent.click(deleteButtons[0]);
  
  expect(mockOnDeleteBoundary).toHaveBeenCalledWith('boundary-1');
});

test('enter key saves edit', async () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  fireEvent.change(editInput, { target: { value: 'Enter Key Test' } });
  fireEvent.keyDown(editInput, { key: 'Enter' });
  
  await waitFor(() => {
    expect(mockOnUpdateBoundaryName).toHaveBeenCalledWith('boundary-1', 'Enter Key Test');
  });
});

test('escape key cancels edit', () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  fireEvent.change(editInput, { target: { value: 'Escape Test' } });
  fireEvent.keyDown(editInput, { key: 'Escape' });
  
  expect(mockOnUpdateBoundaryName).not.toHaveBeenCalled();
  expect(screen.queryByDisplayValue('Escape Test')).not.toBeInTheDocument();
});

test('empty name is not saved', async () => {
  const mockOnDeleteBoundary = vi.fn();
  const mockOnUpdateBoundaryName = vi.fn();
  const mockOnSelectBoundary = vi.fn();
  
  render(
    <BoundaryList
      boundaries={mockBoundaries}
      onDeleteBoundary={mockOnDeleteBoundary}
      onUpdateBoundaryName={mockOnUpdateBoundaryName}
      onSelectBoundary={mockOnSelectBoundary}
    />
  );
  
  const editButtons = screen.getAllByTitle('Edit name');
  fireEvent.click(editButtons[0]);
  
  const editInput = screen.getByDisplayValue('Downtown Area');
  fireEvent.change(editInput, { target: { value: '   ' } });
  
  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);
  
  await waitFor(() => {
    expect(mockOnUpdateBoundaryName).not.toHaveBeenCalled();
  });
}); 