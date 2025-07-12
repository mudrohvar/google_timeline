import React, { useState } from 'react';
import { Download, FileText, FileJson, X } from 'lucide-react';
import type { DataPoint } from './DataUpload';
import type { FilterOptions } from './FilterPanel';

interface ExportPanelProps {
  dataPoints: DataPoint[];
  filters: FilterOptions;
  isOpen: boolean;
  onToggle: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  dataPoints,
  filters,
  isOpen,
  onToggle
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Apply filters to data points
  const getFilteredData = (): DataPoint[] => {
    return dataPoints.filter(point => {
      // Filter by time range
      if (filters.timeRange && point.timestamp) {
        const pointDate = new Date(point.timestamp);
        if (pointDate < filters.timeRange.start || pointDate > filters.timeRange.end) {
          return false;
        }
      }
      
      // Filter by visit count
      if (filters.minVisitCount !== undefined && (point.visitCount || 0) < filters.minVisitCount) {
        return false;
      }
      if (filters.maxVisitCount !== undefined && (point.visitCount || 0) > filters.maxVisitCount) {
        return false;
      }
      
      // Filter by category
      if (filters.categories && filters.categories.length > 0) {
        if (!point.category || !filters.categories.includes(point.category)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const exportToCSV = (data: DataPoint[]) => {
    const headers = ['id', 'latitude', 'longitude', 'title', 'description', 'category', 'timestamp', 'visitCount', 'lastVisit'];
    
    // Add any additional custom fields
    const customFields = new Set<string>();
    data.forEach(point => {
      Object.keys(point).forEach(key => {
        if (!headers.includes(key)) {
          customFields.add(key);
        }
      });
    });
    
    const allHeaders = [...headers, ...Array.from(customFields)];
    
    const csvContent = [
      allHeaders.join(','),
      ...data.map(point => 
        allHeaders.map(header => {
          const value = point[header as keyof DataPoint];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const exportToJSON = (data: DataPoint[]) => {
    const exportData = {
      metadata: includeMetadata ? {
        exportDate: new Date().toISOString(),
        totalPoints: data.length,
        filters: filters,
        originalDataPoints: dataPoints.length
      } : undefined,
      data: data
    };

    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filteredData = getFilteredData();
      
      if (filteredData.length === 0) {
        alert('No data to export with current filters.');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      let content: string;
      let filename: string;

      if (exportFormat === 'csv') {
        content = exportToCSV(filteredData);
        filename = `timeline_data_${timestamp}.csv`;
      } else {
        content = exportToJSON(filteredData);
        filename = `timeline_data_${timestamp}.json`;
      }

      downloadFile(content, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredData = getFilteredData();

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-[1001] bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Export Data"
      >
        <Download className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[1001] bg-white rounded-lg shadow-lg border border-gray-200 w-80">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Export Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Export Summary</div>
          <div className="space-y-1 text-xs">
            <div>• {filteredData.length} places to export</div>
            <div>• {dataPoints.length} total places in dataset</div>
            {filters.timeRange && (
              <div>• Filtered by time range</div>
            )}
            {filters.categories && filters.categories.length > 0 && (
              <div>• Filtered by {filters.categories.length} categories</div>
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value as 'csv')}
                className="mr-2"
              />
              <FileText className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">CSV (Excel compatible)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as 'json')}
                className="mr-2"
              />
              <FileJson className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">JSON (with metadata)</span>
            </label>
          </div>
        </div>

        {/* Options */}
        {exportFormat === 'json' && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include export metadata</span>
            </label>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || filteredData.length === 0}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isExporting || filteredData.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExporting ? 'Exporting...' : `Export ${filteredData.length} places`}
        </button>

        {filteredData.length === 0 && (
          <div className="text-xs text-red-600 text-center">
            No data matches current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPanel; 