import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatisticsDashboard from './StatisticsDashboard';
import type { DataPoint } from './DataUpload';

describe('StatisticsDashboard', () => {
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
    },
    {
      id: '3',
      latitude: 40.7614,
      longitude: -73.9776,
      title: 'Shop C',
      description: 'Test shop',
      category: 'shop',
      timestamp: '2023-03-10',
      visitCount: 8,
      lastVisit: '2024-01-20'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no data points', () => {
    const { container } = render(
      <StatisticsDashboard
        dataPoints={[]}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders statistics button when closed', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByTitle('Open Statistics')).toBeInTheDocument();
    expect(screen.queryByText('Statistics Dashboard')).not.toBeInTheDocument();
  });

  it('renders dashboard when open', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Statistics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Places')).toBeInTheDocument();
    expect(screen.getByText('Total Visits')).toBeInTheDocument();
    expect(screen.getByText('Avg Visits')).toBeInTheDocument();
    expect(screen.getByText('Recent (30d)')).toBeInTheDocument();
  });

  it('displays correct summary statistics', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Total places
    expect(screen.getByText('3')).toBeInTheDocument(); // Total places
    
    // Total visits (5 + 3 + 8 = 16)
    expect(screen.getByText('16')).toBeInTheDocument(); // Total visits
    
    // Average visits (16 / 3 = 5.33...)
    expect(screen.getByText('5.3')).toBeInTheDocument(); // Average visits
  });

  it('displays category breakdown', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Places by Category')).toBeInTheDocument();
    expect(screen.getByText('restaurant')).toBeInTheDocument();
    expect(screen.getByText('hotel')).toBeInTheDocument();
    expect(screen.getByText('shop')).toBeInTheDocument();
  });

  it('displays most visited places', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Most Visited Places')).toBeInTheDocument();
    expect(screen.getByText('Shop C')).toBeInTheDocument();
    expect(screen.getByText('8 visits')).toBeInTheDocument();
  });

  it('displays time distribution', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Visits Over Time')).toBeInTheDocument();
    expect(screen.getByText('Jan 2023')).toBeInTheDocument();
    expect(screen.getByText('Feb 2023')).toBeInTheDocument();
    expect(screen.getByText('Mar 2023')).toBeInTheDocument();
  });

  it('displays data quality information', () => {
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Data Quality')).toBeInTheDocument();
    expect(screen.getByText(/3 places with visit data/)).toBeInTheDocument();
    expect(screen.getByText(/3 places with timestamps/)).toBeInTheDocument();
    expect(screen.getByText(/3 places with categories/)).toBeInTheDocument();
  });

  it('calls onToggle when statistics button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    const statsButton = screen.getByTitle('Open Statistics');
    statsButton.click();

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('calls onToggle when close button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(
      <StatisticsDashboard
        dataPoints={mockDataPoints}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // Close button
    closeButton.click();

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('handles data points without visit count', () => {
    const dataWithoutVisits: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Place A',
        description: 'Test place',
        category: 'attraction'
      }
    ];

    render(
      <StatisticsDashboard
        dataPoints={dataWithoutVisits}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should default to 1 visit per place
    expect(screen.getByText('1')).toBeInTheDocument(); // Total visits
    expect(screen.getByText('1.0')).toBeInTheDocument(); // Average visits
  });

  it('handles data points without timestamps', () => {
    const dataWithoutTimestamps: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Place A',
        description: 'Test place',
        category: 'attraction',
        visitCount: 2
      }
    ];

    render(
      <StatisticsDashboard
        dataPoints={dataWithoutTimestamps}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should not show time distribution
    expect(screen.queryByText('Visits Over Time')).not.toBeInTheDocument();
  });

  it('handles data points without categories', () => {
    const dataWithoutCategories: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Place A',
        description: 'Test place',
        visitCount: 2
      }
    ];

    render(
      <StatisticsDashboard
        dataPoints={dataWithoutCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should show "Unknown" category
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('calculates recent visits correctly', () => {
    const recentData: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Recent Place',
        description: 'Recently visited',
        category: 'restaurant',
        visitCount: 1,
        lastVisit: new Date().toISOString().split('T')[0] // Today
      },
      {
        id: '2',
        latitude: 40.7589,
        longitude: -73.9851,
        title: 'Old Place',
        description: 'Old visit',
        category: 'hotel',
        visitCount: 1,
        lastVisit: '2023-01-01' // Old date
      }
    ];

    render(
      <StatisticsDashboard
        dataPoints={recentData}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Should show 1 recent visit (within 30 days)
    expect(screen.getByText('1')).toBeInTheDocument(); // Recent visits
  });

  it('sorts categories by count', () => {
    const dataWithMultipleCategories: DataPoint[] = [
      {
        id: '1',
        latitude: 40.7128,
        longitude: -74.006,
        title: 'Restaurant 1',
        category: 'restaurant',
        visitCount: 1
      },
      {
        id: '2',
        latitude: 40.7589,
        longitude: -73.9851,
        title: 'Restaurant 2',
        category: 'restaurant',
        visitCount: 1
      },
      {
        id: '3',
        latitude: 40.7614,
        longitude: -73.9776,
        title: 'Hotel 1',
        category: 'hotel',
        visitCount: 1
      }
    ];

    render(
      <StatisticsDashboard
        dataPoints={dataWithMultipleCategories}
        isOpen={true}
        onToggle={vi.fn()}
      />
    );

    // Restaurant should appear first (2 places) then hotel (1 place)
    const categoryElements = screen.getAllByText(/restaurant|hotel/);
    expect(categoryElements[0]).toHaveTextContent('restaurant');
    expect(categoryElements[1]).toHaveTextContent('hotel');
  });
}); 