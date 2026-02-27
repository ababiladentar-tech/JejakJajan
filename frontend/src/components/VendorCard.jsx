import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useVendorStore } from '../context/store';
import { formatCurrency, getAssetUrl } from '../utils/helpers';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function VendorCard({ vendor, showDistance = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const favorites = useVendorStore((state) => state.favorites);
  const toggleFavorite = useVendorStore((state) => state.toggleFavorite);
  const isFav = favorites.includes(vendor.id || vendor.vendorId);

  const handleViewDetail = () => {
    const id = vendor.id || vendor.vendorId;
    if (!id) return;
    navigate(`/vendor/${id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        {vendor.profileImage ? (
          <img
            src={getAssetUrl(vendor.profileImage)}
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-4xl">🍜</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-2">
        {/* favorite button for buyers */}
        {user?.role === 'BUYER' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(vendor.id || vendor.vendorId);
            }}
            className="text-red-500"
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
        <div className="bg-white rounded-full px-3 py-1">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold text-sm">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{vendor.storeName}</h3>
        <p className="text-xs text-gray-600 mb-1">{vendor.category}</p>
        <p className="text-xs text-gray-500 mb-2">
          {vendor.address || `Alamat sementara: ${vendor.latitude?.toFixed(4)}, ${vendor.longitude?.toFixed(4)}`}
        </p>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              vendor.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : vendor.status === 'RESTING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {vendor.status}
          </span>
          <span className="text-xs text-gray-600">{vendor.followerCount} followers</span>
        </div>

        {/* Distance */}
        {showDistance && (
          <p className="text-sm text-primary font-semibold mb-3">{showDistance}</p>
        )}

        {/* Menu preview */}
        {vendor.menus && vendor.menus.length > 0 && (
          <div className="mb-3 border-t pt-2">
            <p className="text-xs text-gray-600 mb-1">Popular items:</p>
            <div className="flex gap-1 flex-wrap">
              {vendor.menus.slice(0, 2).map((menu) => (
                <span key={menu.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {menu.name} ({formatCurrency(menu.price)})
                </span>
              ))}
              {vendor.menus.length > 2 && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  +{vendor.menus.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleViewDetail}
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
