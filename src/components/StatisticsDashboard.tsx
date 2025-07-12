import React from 'react';
import { BarChart3, MapPin, Calendar, TrendingUp, Users, Clock, X } from 'lucide-react';
import type { DataPoint } from './DataUpload';

interface StatisticsDashboardProps {
  dataPoints: DataPoint[];
  isOpen: boolean;
  onToggle: () => void;
}

interface CategoryStats {
  category: string;
  count: number;
  visitCount: number;
}

interface TimeStats {
  month: string;
  count: number;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  dataPoints,
  isOpen,
  onToggle
}) => {
  if (dataPoints.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalPoints = dataPoints.length;
  const totalVisits = dataPoints.reduce((sum, point) => sum + (point.visitCount || 1), 0);
  const uniqueCategories = [...new Set(dataPoints.map(p => p.category).filter(Boolean))];
  const averageVisitsPerPoint = totalVisits / totalPoints;

  // Category statistics
  const categoryStats: CategoryStats[] = uniqueCategories.map(category => {
    const categoryPoints = dataPoints.filter(p => p.category === category);
    const categoryVisitCount = categoryPoints.reduce((sum, p) => sum + (p.visitCount || 1), 0);
    return {
      category: category || 'Unknown',
      count: categoryPoints.length,
      visitCount: categoryVisitCount
    };
  }).sort((a, b) => b.count - a.count);

  // Time-based statistics (by month)
  const timeStats: TimeStats[] = dataPoints
    .filter(p => p.timestamp)
    .reduce((acc, point) => {
      const date = new Date(point.timestamp!);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const existing = acc.find(item => item.month === monthName);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ month: monthName, count: 1 });
      }
      return acc;
    }, [] as TimeStats[])
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Most visited places
  const mostVisited = dataPoints
    .filter(p => p.visitCount && p.visitCount > 1)
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    .slice(0, 5);

  // Recent visits (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentVisits = dataPoints.filter(p => {
    if (!p.lastVisit) return false;
    const lastVisitDate = new Date(p.lastVisit);
    return lastVisitDate >= thirtyDaysAgo;
  }).length;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 left-4 z-[1001] bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Open Statistics"
      >
        <BarChart3 className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 left-4 z-[1001] bg-white rounded-lg shadow-lg border border-gray-200 w-96 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistics Dashboard
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Total Places</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalPoints}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Visits</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{totalVisits}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Avg Visits</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{averageVisitsPerPoint.toFixed(1)}</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Recent (30d)</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{recentVisits}</div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Places by Category</h4>
            <div className="space-y-2">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 capitalize">{stat.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{stat.visitCount} visits</span>
                    <span className="text-sm font-medium text-gray-900">{stat.count} places</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Visited Places */}
        {mostVisited.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Most Visited Places</h4>
            <div className="space-y-2">
              {mostVisited.map((point, index) => (
                <div key={point.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-700 truncate max-w-32">{point.title}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{point.visitCount} visits</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Distribution */}
        {timeStats.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Visits Over Time</h4>
            <div className="space-y-2">
              {timeStats.map((stat) => (
                <div key={stat.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{stat.month}</span>
                  <span className="text-sm font-medium text-gray-900">{stat.count} visits</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Info */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Quality</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• {dataPoints.filter(p => p.visitCount).length} places with visit data</div>
            <div>• {dataPoints.filter(p => p.timestamp).length} places with timestamps</div>
            <div>• {dataPoints.filter(p => p.category).length} places with categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard; 