import React from 'react';
import { formatDistance, getMarkerColor } from '../utils/helpers';

export default function VendorMarker({ vendor, onSelect }) {
  return (
    <div
      className="bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onSelect(vendor)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{vendor.storeName}</h3>
          <p className="text-xs text-gray-600">{vendor.category}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getMarkerColor(vendor.status) }}
        />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="text-xs font-semibold ml-1">{vendor.rating.toFixed(1)}</span>
        </div>
        <span className="text-xs text-gray-600">{vendor.status}</span>
      </div>
      
      {vendor.distance && (
        <p className="text-xs text-primary font-semibold">{vendor.distance}</p>
      )}
    </div>
  );
}
