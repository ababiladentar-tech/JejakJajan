import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-40 bg-gray-300 animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-3/4" />
              <div className="h-3 bg-gray-300 rounded animate-pulse mb-3 w-1/2" />
              <div className="h-10 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-md">
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
