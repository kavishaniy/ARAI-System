import React, { useState } from 'react';
import UploadSection from './UploadSection';
import HistorySection from './HistorySection';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleUploadComplete = () => {
    setRefreshHistory(prev => prev + 1);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard
          </h1>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`${
                  activeTab === 'upload'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Upload Design
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analysis History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'upload' && (
              <UploadSection onUploadComplete={handleUploadComplete} />
            )}
            {activeTab === 'history' && (
              <HistorySection key={refreshHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
