import React from 'react';
import { Map } from 'lucide-react';



interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children
}) => {
  

  

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          
          <Map className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Google Timeline Map</h1>
        </div>
        <div className="flex items-center space-x-4">
          
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        

        

        {/* Map Area */}
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 