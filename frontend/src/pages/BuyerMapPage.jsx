import React, { useEffect, useState } from 'react';
import { vendorService } from '../services/api';
import { useAuthStore, useVendorStore, useMapStore } from '../context/store';
import { calculateDistance, formatDistance } from '../utils/helpers';
import MapView from '../components/MapView';
import VendorCard from '../components/VendorCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  onVendorLocationUpdate,
  onVendorActiveVendors,
  emitBuyerJoinMap,
  emitGetNearbyVendors,
  initSocket,
} from '../services/socket';

export default function BuyerMapPage() {
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchCategory, setSearchCategory] = useState('');
  const token = useAuthStore((state) => state.token);
  const { vendors, setVendors, activeVendors, setActiveVendors, updateVendorLocation, favorites } =
    useVendorStore();
  const { userLocation, setUserLocation } = useMapStore();

  useEffect(() => {
    // Initialize socket
    if (token) {
      initSocket(token);
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(latitude, longitude);
          emitGetNearbyVendors(latitude, longitude, 500);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Enable location access to see nearby vendors');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    // Socket listeners
    emitBuyerJoinMap();
    
    onVendorActiveVendors((data) => {
      let list = data;
      if (userLocation) {
        list = data.map((v) => {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            v.latitude,
            v.longitude
          );
          return { ...v, distanceKM: dist, distance: formatDistance(dist) };
        });
      }
      setActiveVendors(list);
    });

    onVendorLocationUpdate((data) => {
      updateVendorLocation(data.vendorId, data.latitude, data.longitude);
      // also update distance if we know userLocation
      if (userLocation) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          data.latitude,
          data.longitude
        );
        setActiveVendors((prev) =>
          prev.map((v) =>
            (v.id === data.vendorId || v.vendorId === data.vendorId)
              ? { ...v, latitude: data.latitude, longitude: data.longitude, distanceKM: dist, distance: formatDistance(dist) }
              : v
          )
        );
      }
    });

    loadVendors();
  }, [token]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getActive();
      let list = response.data.vendors;
      if (userLocation) {
        list = list.map((v) => {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            v.latitude,
            v.longitude
          );
          return {
            ...v,
            distanceKM: dist,
            distance: formatDistance(dist),
          };
        });
      }
      setVendors(list);
    } catch (error) {
      toast.error('Error loading vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const category = e.target.value;
    setSearchCategory(category);
    
    if (!category) {
      loadVendors();
      return;
    }

    try {
      setLoading(true);
      const response = await vendorService.getByCategory(category);
      let list = response.data.vendors;
      if (userLocation) {
        list = list.map((v) => {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            v.latitude,
            v.longitude
          );
          return {
            ...v,
            distanceKM: dist,
            distance: formatDistance(dist),
          };
        });
      }
      setVendors(list);
    } catch (error) {
      toast.error('Error searching vendors');
    } finally {
      setLoading(false);
    }
  };

  const displayVendors = searchCategory ? vendors : activeVendors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">🗺️ Temukan Makanan Enak</h1>
          <p className="text-green-100 mt-2">Vendor di sekitar Anda</p>
          
          <div className="mt-6 flex gap-3 flex-col md:flex-row">
            <input
              type="text"
              placeholder="🔍 Cari vendor..."
              className="flex-1 px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-800 placeholder-gray-500"
            />
            <select
              value={searchCategory}
              onChange={handleSearch}
              className="px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-800 font-semibold"
            >
              <option value="">📦 Semua Kategori</option>
              <option value="Makanan">🍜 Makanan</option>
              <option value="Minuman">🥤 Minuman</option>
              <option value="Dessert">🍰 Dessert</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <MapView
                vendors={displayVendors || []}
                userLocation={userLocation}
                onVendorSelect={setSelectedVendor}
                height="h-96"
              />
            </div>
            <div className="mt-4 text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                📍 Menemukan {displayVendors?.length || 0} vendor di sekitar Anda
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {selectedVendor ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4">
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-sm text-orange-100 mb-3 hover:text-white"
                  >
                    ← Kembali ke daftar
                  </button>
                  <h2 className="text-xl font-bold">{selectedVendor.storeName}</h2>
                  <p className="text-orange-100 text-sm mt-1">{selectedVendor.category}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <div className="text-sm text-gray-600">Rating</div>
                      <div className="font-bold text-lg text-orange-600">{selectedVendor.rating}</div>
                    </div>
                  </div>
                  {selectedVendor.distance && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-sm text-gray-600">Jarak</div>
                        <div className="font-bold text-lg text-blue-600">{selectedVendor.distance}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-5xl mb-3">👇</div>
                <p className="text-gray-600 font-semibold">Pilih vendor di peta untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>

        {/* Vendors List */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {searchCategory ? `🍽️ ${searchCategory}` : '👨‍🍳 Vendor Aktif'}
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-green-400 to-transparent rounded"></div>
          </div>
          
          {loading ? (
            <LoadingSkeleton count={3} type="card" />
          ) : displayVendors && displayVendors.length > 0 ? (
            <>
              {favorites && favorites.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold text-red-600">❤️ Favorit Saya</h3>
                    <div className="h-1 flex-1 bg-gradient-to-r from-red-400 to-transparent rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayVendors
                      .filter((v) => favorites.includes(v.id || v.vendorId))
                      .map((vendor) => (
                        <VendorCard
                          key={vendor.id || vendor.vendorId}
                          vendor={vendor}
                          showDistance={vendor.distance}
                        />
                      ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id || vendor.vendorId}
                    vendor={vendor}
                    showDistance={vendor.distance}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-gray-600 text-lg font-semibold">Tidak ada vendor yang ditemukan</p>
              <p className="text-gray-500 text-sm mt-2">Coba ubah kategori atau cari dengan kata kunci lain</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
