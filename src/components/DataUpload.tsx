import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

export interface DataPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  timestamp?: string;
  monthYear?: string;
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

  const enrichData = (points: DataPoint[]): DataPoint[] => {
    return points.map(point => {
      if (point.timestamp) {
        try {
          const date = new Date(point.timestamp);
          if (!isNaN(date.getTime())) {
            return { ...point, monthYear: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) };
          }
        } catch (e) { /* ignore invalid dates */ }
      }
      return point;
    });
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

    const enrichedData = enrichData(data);
    setProcessedData(enrichedData);
    onDataProcessed(enrichedData);
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
    } else if (jsonData.semanticSegments && Array.isArray(jsonData.semanticSegments)) {
      // Google Timeline format
      let idx = 0;
      for (const segment of jsonData.semanticSegments) {
        // timelinePath points
        if (Array.isArray(segment.timelinePath)) {
          for (const pathPoint of segment.timelinePath) {
            const [latStr, lngStr] = pathPoint.point.replace('°', '').split(',').map((s: string) => s.trim().replace('°', ''));
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            if (!isNaN(lat) && !isNaN(lng)) {
              data.push({
                id: `timelinePath_${idx++}`,
                latitude: lat,
                longitude: lng,
                title: 'Timeline Path',
                timestamp: pathPoint.time,
                ...pathPoint
              });
            }
          }
        }
        // visit.topCandidate.placeLocation.latLng
        if (segment.visit && segment.visit.topCandidate && segment.visit.topCandidate.placeLocation && segment.visit.topCandidate.placeLocation.latLng) {
          const [latStr, lngStr] = segment.visit.topCandidate.placeLocation.latLng.replace('°', '').split(',').map((s: string) => s.trim().replace('°', ''));
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            data.push({
              id: `visit_${idx++}`,
              latitude: lat,
              longitude: lng,
              title: segment.visit.topCandidate.semanticType || 'Visit',
              timestamp: segment.startTime,
              ...segment.visit.topCandidate
            });
          }
        }
        // activity.start.latLng and activity.end.latLng
        if (segment.activity && segment.activity.start && segment.activity.start.latLng) {
          const [latStr, lngStr] = segment.activity.start.latLng.replace('°', '').split(',').map((s: string) => s.trim().replace('°', ''));
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            data.push({
              id: `activity_start_${idx++}`,
              latitude: lat,
              longitude: lng,
              title: 'Activity Start',
              timestamp: segment.startTime,
              ...segment.activity.start
            });
          }
        }
        if (segment.activity && segment.activity.end && segment.activity.end.latLng) {
          const [latStr, lngStr] = segment.activity.end.latLng.replace('°', '').split(',').map((s: string) => s.trim().replace('°', ''));
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            data.push({
              id: `activity_end_${idx++}`,
              latitude: lat,
              longitude: lng,
              title: 'Activity End',
              timestamp: segment.endTime,
              ...segment.activity.end
            });
          }
        }
      }
    } else {
      throw new Error('Invalid JSON format. Expected array of objects, GeoJSON, or Google Timeline format.');
    }

    // Filter out invalid coordinates
    const validData = data.filter(point => 
      !isNaN(point.latitude) && 
      !isNaN(point.longitude) &&
      point.latitude >= -90 && point.latitude <= 90 &&
      point.longitude >= -180 && point.longitude <= 180
    );

    if (validData.length === 0) {
      throw new Error('No valid data points found in JSON file');
    }

    const enrichedData = enrichData(validData);
    setProcessedData(enrichedData);
    onDataProcessed(enrichedData);
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
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg border border-gray-100 p-4 w-64 mx-auto transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-100 rounded-full p-1 flex items-center justify-center">
          <Upload className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Import Data</h3>
      </div>
      <p className="text-xs text-gray-500 mb-2">CSV or JSON. Drag & drop or click.</p>
      <div
        className={`border-2 border-dashed rounded-lg p-3 text-center transition-all duration-200 shadow-sm relative cursor-pointer select-none
          ${isDragging ? 'border-blue-400 bg-blue-50/70 scale-105' :
            uploadStatus === 'success' ? 'border-green-400 bg-green-50/70' :
            uploadStatus === 'error' ? 'border-red-400 bg-red-50/70' :
            'border-gray-300 hover:border-blue-300 hover:bg-blue-50/40'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}
        style={{ minHeight: '80px' }}
      >
        <div className="flex flex-col items-center justify-center gap-1 min-h-[48px]">
          {/* Only show status icon in the center, not in the success summary */}
          {uploadStatus === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mb-1"></div>
              <span className="text-xs text-blue-700">Processing...</span>
            </>
          )}
          {uploadStatus === 'success' && (
            <>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-1">
                <CheckCircle className="h-4 w-4" /> Uploaded
              </span>
              <span className="text-xs text-gray-700 truncate max-w-[120px]">{fileInputRef.current?.files?.[0]?.name}</span>
              <button
                onClick={handleClearData}
                className="mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                aria-label="Clear data"
                title="Clear data"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          {uploadStatus === 'error' && (
            <>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-1">
                <AlertCircle className="h-4 w-4" /> Error
              </span>
              <span className="text-xs text-red-600">{errorMessage}</span>
              <button
                onClick={handleClearData}
                className="mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                aria-label="Try again"
                title="Try again"
              >
                <Upload className="h-4 w-4" />
              </button>
            </>
          )}
          {uploadStatus === 'idle' && (
            <>
              <button
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-md shadow hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                Choose File
              </button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploadStatus === 'success' && processedData.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 shadow-inner">
            <div className="flex flex-col gap-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Points:</span>
                <span className="font-bold text-gray-900">{processedData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Lat:</span>
                <span className="font-mono">{Math.min(...processedData.map(p => p.latitude)).toFixed(4)} to {Math.max(...processedData.map(p => p.latitude)).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Lon:</span>
                <span className="font-mono">{Math.min(...processedData.map(p => p.longitude)).toFixed(4)} to {Math.max(...processedData.map(p => p.longitude)).toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 60%; }
        }
      `}</style>
    </div>
  );
};

export default DataUpload;

