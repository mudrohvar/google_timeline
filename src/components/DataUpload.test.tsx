import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataUpload, { type DataPoint } from './DataUpload';

// Mock file reading
const mockFileReader = {
  readAsText: vi.fn(),
  result: '',
  onload: null as (() => void) | null,
};

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: vi.fn(() => mockFileReader),
});

// Mock File.text() method
Object.defineProperty(File.prototype, 'text', {
  writable: true,
  value: vi.fn(function() {
    return Promise.resolve(mockFileReader.result);
  }),
});

describe('DataUpload', () => {
  const mockOnDataProcessed = vi.fn();
  const mockOnClearData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = '';
    mockFileReader.onload = null;
  });

  it('renders upload area with correct initial state', () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    expect(screen.getByText('Data Upload')).toBeInTheDocument();
    expect(screen.getByText('Drop your file here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports CSV and JSON files')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.queryByText('Clear Data')).not.toBeInTheDocument();
  });

  it('shows clear data button when hasData is true', () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={true}
      />
    );

    expect(screen.getByText('Clear Data')).toBeInTheDocument();
  });

  it('handles file selection via button click', async () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const fileInput = screen.getByRole('button', { name: 'Choose File' });
    fireEvent.click(fileInput);

    // File input should be triggered
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
  });

  it('processes valid CSV file correctly', async () => {
    const csvContent = `latitude,longitude,title,description,category
40.7128,-74.0060,New York,Big Apple,attraction
34.0522,-118.2437,Los Angeles,City of Angels,attraction`;

    mockFileReader.result = csvContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Successfully loaded 2 data points')).toBeInTheDocument();
    });

    expect(mockOnDataProcessed).toHaveBeenCalledWith([
      {
        id: 'point_1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple',
        category: 'attraction',
        timestamp: undefined
      },
      {
        id: 'point_2',
        latitude: 34.0522,
        longitude: -118.2437,
        title: 'Los Angeles',
        description: 'City of Angels',
        category: 'attraction',
        timestamp: undefined
      }
    ]);
  });

  it('processes valid JSON file correctly', async () => {
    const jsonContent = JSON.stringify([
      {
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple',
        category: 'attraction'
      }
    ]);

    mockFileReader.result = jsonContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([jsonContent], 'test.json', { type: 'application/json' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Successfully loaded 1 data points')).toBeInTheDocument();
    });

    expect(mockOnDataProcessed).toHaveBeenCalledWith([
      {
        id: 'point_0',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: 'Big Apple',
        category: 'attraction'
      }
    ]);
  });

  it('handles CSV file with missing required fields', async () => {
    const csvContent = `latitude,longitude,name
40.7128,-74.0060,New York
invalid,invalid,Invalid Point`;

    mockFileReader.result = csvContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Successfully loaded 1 data points')).toBeInTheDocument();
    });

    // Should only process valid rows
    expect(mockOnDataProcessed).toHaveBeenCalledWith([
      {
        id: 'point_1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'New York',
        description: undefined,
        timestamp: undefined,
        category: undefined,
        name: 'New York'
      }
    ]);
  });

  it('handles unsupported file format', async () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(screen.getByText('Unsupported file format. Please upload CSV or JSON files.')).toBeInTheDocument();
    });

    expect(mockOnDataProcessed).not.toHaveBeenCalled();
  });

  it('handles empty CSV file', async () => {
    const csvContent = 'latitude,longitude,title\n';

    mockFileReader.result = csvContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(screen.getByText('No valid data points found in CSV file')).toBeInTheDocument();
    });

    expect(mockOnDataProcessed).not.toHaveBeenCalled();
  });

  it('handles invalid JSON file', async () => {
    const jsonContent = 'invalid json content';

    mockFileReader.result = jsonContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([jsonContent], 'test.json', { type: 'application/json' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });

    expect(mockOnDataProcessed).not.toHaveBeenCalled();
  });

  it('clears data when clear button is clicked', () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={true}
      />
    );

    const clearButton = screen.getByText('Clear Data');
    fireEvent.click(clearButton);

    expect(mockOnClearData).toHaveBeenCalled();
  });

  it('shows data preview when data is loaded', async () => {
    const csvContent = `latitude,longitude,title
40.7128,-74.0060,New York
34.0522,-118.2437,Los Angeles`;

    mockFileReader.result = csvContent;

    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Data Preview')).toBeInTheDocument();
      expect(screen.getByText('Total points: 2')).toBeInTheDocument();
      expect(screen.getByText(/Latitude range:/)).toBeInTheDocument();
      expect(screen.getByText(/Longitude range:/)).toBeInTheDocument();
    });
  });

  it('handles drag and drop events', () => {
    render(
      <DataUpload
        onDataProcessed={mockOnDataProcessed}
        onClearData={mockOnClearData}
        hasData={false}
      />
    );

    const dropZone = screen.getByText('Drop your file here or click to browse').closest('div');
    
    if (dropZone) {
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('border-blue-400');
      expect(dropZone).toHaveClass('bg-blue-50');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('border-blue-400');
      expect(dropZone).not.toHaveClass('bg-blue-50');
    }
  });
}); 