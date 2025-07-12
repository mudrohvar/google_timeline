import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportPanel from './ExportPanel';
import type { DataPoint } from './DataUpload';
import type { FilterOptions } from './FilterPanel';

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
});

// Mock document.createElement and appendChild
const mockLink = {
  href: '',
  download: '',
  click: vi.fn()
};

const mockCreateElement = vi.fn(() => mockLink);
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
});

describe('ExportPanel', () => {
  const mockDataPoints: DataPoint[] = [
    {
      id: '1',
      latitude: 40.7128,
      longitude: -74.006,
      title: 'Restaurant A',
      description: 'Test restaurant',
      category: 'restaurant',
      timestamp: '2023-01-15',
      visitCount: 5,
      lastVisit: '2024-01-15'
    },
    {
      id: '2',
      latitude: 40.7589,
      longitude: -73.9851,
      title: 'Hotel B',
      description: 'Test hotel',
      category: 'hotel',
      timestamp: '2023-02-20',
      visitCount: 3,
      lastVisit: '2024-01-10'
    }
  ];

  const mockFilters: FilterOptions = {
    showVisitFrequency: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export button when closed', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByTitle('Export Data')).toBeInTheDocument();
    expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
  });

  it('renders export panel when open', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Export Summary')).toBeInTheDocument();
    expect(screen.getByText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('CSV (Excel compatible)')).toBeInTheDocument();
    expect(screen.getByText('JSON (with metadata)')).toBeInTheDocument();
  });

  it('displays correct export summary', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('2 places to export')).toBeInTheDocument();
    expect(screen.getByText('2 total places in dataset')).toBeInTheDocument();
  });

  it('handles CSV export format selection', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const csvRadio = screen.getByLabelText('CSV (Excel compatible)');
    fireEvent.click(csvRadio);

    expect(csvRadio).toBeChecked();
  });

  it('handles JSON export format selection', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const jsonRadio = screen.getByLabelText('JSON (with metadata)');
    fireEvent.click(jsonRadio);

    expect(jsonRadio).toBeChecked();
  });

  it('handles metadata toggle for JSON export', () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Select JSON format first
    const jsonRadio = screen.getByLabelText('JSON (with metadata)');
    fireEvent.click(jsonRadio);

    const metadataCheckbox = screen.getByLabelText('Include export metadata');
    fireEvent.click(metadataCheckbox);

    expect(metadataCheckbox).not.toBeChecked();
  });

  it('exports CSV data correctly', async () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const exportButton = screen.getByText('Export 2 places');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  it('exports JSON data correctly', async () => {
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Select JSON format
    const jsonRadio = screen.getByLabelText('JSON (with metadata)');
    fireEvent.click(jsonRadio);

    const exportButton = screen.getByText('Export 2 places');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('.json');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  it('filters data correctly based on time range', () => {
    const filtersWithTimeRange: FilterOptions = {
      ...mockFilters,
      timeRange: {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31')
      }
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithTimeRange}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should only show 1 place (Restaurant A from 2023-01-15)
    expect(screen.getByText('1 places to export')).toBeInTheDocument();
  });

  it('filters data correctly based on visit count', () => {
    const filtersWithVisitCount: FilterOptions = {
      ...mockFilters,
      minVisitCount: 4
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithVisitCount}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should only show 1 place (Restaurant A with 5 visits)
    expect(screen.getByText('1 places to export')).toBeInTheDocument();
  });

  it('filters data correctly based on categories', () => {
    const filtersWithCategories: FilterOptions = {
      ...mockFilters,
      categories: ['restaurant']
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should only show 1 place (Restaurant A)
    expect(screen.getByText('1 places to export')).toBeInTheDocument();
  });

  it('shows filtered categories in summary', () => {
    const filtersWithCategories: FilterOptions = {
      ...mockFilters,
      categories: ['restaurant', 'hotel']
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Filtered by 2 categories')).toBeInTheDocument();
  });

  it('shows time range in summary', () => {
    const filtersWithTimeRange: FilterOptions = {
      ...mockFilters,
      timeRange: {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31')
      }
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithTimeRange}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Filtered by time range')).toBeInTheDocument();
  });

  it('disables export button when no data matches filters', () => {
    const filtersWithNoMatch: FilterOptions = {
      ...mockFilters,
      categories: ['nonexistent']
    };

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={filtersWithNoMatch}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const exportButton = screen.getByText('Export 0 places');
    expect(exportButton).toBeDisabled();
    expect(screen.getByText('No data matches current filters')).toBeInTheDocument();
  });

  it('calls onToggle when export button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    const exportButton = screen.getByTitle('Export Data');
    fireEvent.click(exportButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('calls onToggle when close button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // Close button
    fireEvent.click(closeButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('handles export error gracefully', async () => {
    // Mock console.error to prevent test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ExportPanel
        dataPoints={mockDataPoints}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const exportButton = screen.getByText('Export 2 places');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Export failed. Please try again.');
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('includes custom fields in CSV export', async () => {
    const dataWithCustomFields: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Restaurant A',
        description: 'Test restaurant',
        category: 'restaurant',
        customField: 'custom value',
        rating: 5
      }
    ];

    render(
      <ExportPanel
        dataPoints={dataWithCustomFields}
        filters={mockFilters}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    const exportButton = screen.getByText('Export 1 places');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
}); 