import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterPanel, { type FilterOptions } from './FilterPanel';

describe('FilterPanel', () => {
  const mockOnFiltersChange = vi.fn();
  const mockAvailableCategories = ['restaurant', 'hotel', 'attraction', 'shop', 'transport'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter button when closed', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByTitle('Open Filters')).toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  it('renders filter panel when open', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Show Visit Frequency')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Visit Count Range')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('toggles visit frequency filter', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const visitFrequencyCheckbox = screen.getByLabelText(/Color and size markers by visit frequency/);
    fireEvent.click(visitFrequencyCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      showVisitFrequency: true
    });
  });

  it('handles time range filter changes', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');

    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timeRange: expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date)
        })
      })
    );
  });

  it('handles visit count range filter changes', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const minInput = screen.getByPlaceholderText('0');
    const maxInput = screen.getByPlaceholderText('∞');

    fireEvent.change(minInput, { target: { value: '5' } });
    fireEvent.change(maxInput, { target: { value: '20' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minVisitCount: 5,
        maxVisitCount: 20
      })
    );
  });

  it('handles category filter toggles', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const restaurantCheckbox = screen.getByLabelText('restaurant');
    fireEvent.click(restaurantCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['restaurant']
      })
    );
  });

  it('clears all filters when clear button is clicked', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      showVisitFrequency: false
    });
  });

  it('calls onToggle when close button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // Close button
    fireEvent.click(closeButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('calls onToggle when filter button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    const filterButton = screen.getByTitle('Open Filters');
    fireEvent.click(filterButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('does not show categories section when no categories available', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={[]}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
  });

  it('maintains filter state correctly', () => {
    const { rerender } = render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Set some filters
    const visitFrequencyCheckbox = screen.getByLabelText(/Color and size markers by visit frequency/);
    fireEvent.click(visitFrequencyCheckbox);

    // Re-render with same props
    rerender(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Check that the checkbox is still checked
    expect(visitFrequencyCheckbox).toBeChecked();
  });

  it('handles multiple category selections', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const restaurantCheckbox = screen.getByLabelText('restaurant');
    const hotelCheckbox = screen.getByLabelText('hotel');

    fireEvent.click(restaurantCheckbox);
    fireEvent.click(hotelCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['restaurant', 'hotel']
      })
    );
  });

  it('handles category deselection', () => {
    render(
      <FilterPanel
        onFiltersChange={mockOnFiltersChange}
        availableCategories={mockAvailableCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const restaurantCheckbox = screen.getByLabelText('restaurant');
    
    // Select then deselect
    fireEvent.click(restaurantCheckbox);
    fireEvent.click(restaurantCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: []
      })
    );
  });
}); 