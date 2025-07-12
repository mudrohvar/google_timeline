import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

export interface DataPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  timestamp?: string;
  category?: string;
  visitCount?: number;
  lastVisit?: string;
  [key: string]: any;
}

interface DataUploadProps {
  onDataProcessed: (data: DataPoint[]) => void;
  onClearData: () => void;
  hasData: boolean;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataProcessed, onClearData, hasData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [processedData, setProcessedData] = useState<DataPoint[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        await processCSV(file);
      } else if (fileExtension === 'json') {
        await processJSON(file);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or JSON files.');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  const processCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: DataPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate required fields
      const lat = parseFloat(row.latitude || row.lat);
      const lng = parseFloat(row.longitude || row.lng || row.lon);
      const title = row.title || row.name || `Point ${i}`;

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Skipping row ${i}: Invalid coordinates`);
        continue;
      }

      data.push({
        id: `point_${i}`,
        latitude: lat,
        longitude: lng,
        title,
        description: row.description || row.desc,
        timestamp: row.timestamp || row.date || row.time,
        category: row.category || row.type,
        ...row
      });
    }

    if (data.length === 0) {
      throw new Error('No valid data points found in CSV file');
    }

    setProcessedData(data);
    onDataProcessed(data);
    setUploadStatus('success');
  };

  const processJSON = async (file: File) => {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    
    let data: DataPoint[] = [];

    if (Array.isArray(jsonData)) {
      data = jsonData.map((item, index) => ({
        id: item.id || `point_${index}`,
        latitude: parseFloat(item.latitude || item.lat),
        longitude: parseFloat(item.longitude || item.lng || item.lon),
        title: item.title || item.name || `Point ${index}`,
        description: item.description || item.desc,
        timestamp: item.timestamp || item.date || item.time,
        category: item.category || item.type,
        ...item
      }));
    } else if (jsonData.features && Array.isArray(jsonData.features)) {
      // GeoJSON format
      data = jsonData.features.map((feature: any, index: number) => {
        const coords = feature.geometry?.coordinates;
        return {
          id: feature.id || `point_${index}`,
          latitude: coords ? coords[1] : 0,
          longitude: coords ? coords[0] : 0,
          title: feature.properties?.title || feature.properties?.name || `Point ${index}`,
          description: feature.properties?.description,
          timestamp: feature.properties?.timestamp,
          category: feature.properties?.category,
          ...feature.properties
        };
      });
    } else {
      throw new Error('Invalid JSON format. Expected array of objects or GeoJSON.');
    }

    // Filter out invalid coordinates
    data = data.filter(point => 
      !isNaN(point.latitude) && 
      !isNaN(point.longitude) &&
      point.latitude >= -90 && point.latitude <= 90 &&
      point.longitude >= -180 && point.longitude <= 180
    );

    if (data.length === 0) {
      throw new Error('No valid data points found in JSON file');
    }

    setProcessedData(data);
    onDataProcessed(data);
    setUploadStatus('success');
  };

  const handleClearData = () => {
    setProcessedData([]);
    setUploadStatus('idle');
    setErrorMessage('');
    onClearData();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Upload</h3>
        {hasData && (
          <button
            onClick={handleClearData}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
          >
            <X className="h-3 w-3" />
            Clear Data
          </button>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          {getStatusIcon()}
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploadStatus === 'processing' && 'Processing file...'}
              {uploadStatus === 'success' && `Successfully loaded ${processedData.length} data points`}
              {uploadStatus === 'error' && 'Upload failed'}
              {uploadStatus === 'idle' && 'Drop your file here or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports CSV and JSON files
            </p>
          </div>

          {uploadStatus === 'idle' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
          )}

          {uploadStatus === 'error' && (
            <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
          )}

          {uploadStatus === 'success' && (
            <div className="text-xs text-green-600 mt-2">
              <FileText className="h-3 w-3 inline mr-1" />
              {fileInputRef.current?.files?.[0]?.name}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadStatus === 'success' && processedData.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Preview</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Total points: {processedData.length}</p>
            <p>Latitude range: {Math.min(...processedData.map(p => p.latitude)).toFixed(4)} to {Math.max(...processedData.map(p => p.latitude)).toFixed(4)}</p>
            <p>Longitude range: {Math.min(...processedData.map(p => p.longitude)).toFixed(4)} to {Math.max(...processedData.map(p => p.longitude)).toFixed(4)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload; 