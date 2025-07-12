import React, { useState } from 'react';
import { Trash2, Edit3, MapPin } from 'lucide-react';

interface Boundary {
  id: string;
  name: string;
  coordinates: any[];
  color: string;
}

interface BoundaryListProps {
  boundaries: Boundary[];
  onDeleteBoundary: (boundaryId: string) => void;
  onUpdateBoundaryName: (boundaryId: string, name: string) => void;
  onSelectBoundary: (boundary: Boundary) => void;
}

const BoundaryList: React.FC<BoundaryListProps> = ({
  boundaries,
  onDeleteBoundary,
  onUpdateBoundaryName,
  onSelectBoundary
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEditStart = (boundary: Boundary) => {
    setEditingId(boundary.id);
    setEditName(boundary.name);
  };

  const handleEditSave = (boundaryId: string) => {
    if (editName.trim()) {
      onUpdateBoundaryName(boundaryId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  if (boundaries.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No boundaries drawn yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {boundaries.map((boundary) => (
        <div
          key={boundary.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex-1 min-w-0">
            {editingId === boundary.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave(boundary.id);
                    } else if (e.key === 'Escape') {
                      handleEditCancel();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleEditSave(boundary.id)}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span 
                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                  onClick={() => onSelectBoundary(boundary)}
                  title={boundary.name}
                >
                  {boundary.name}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {boundary.coordinates.length} points
            </div>
          </div>
          
          {editingId !== boundary.id && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleEditStart(boundary)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit name"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDeleteBoundary(boundary.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete boundary"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BoundaryList; 