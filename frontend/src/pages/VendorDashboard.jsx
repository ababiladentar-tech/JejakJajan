import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { vendorService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.vendor) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getProfile(user.vendor.id);
      setProfile(res.data.vendor);
    } catch (err) {
      console.error(err);
      setError('Gagal load profil vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await vendorService.updateStatus(newStatus);
      setProfile({ ...profile, status: newStatus });
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengganti status');
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'RESTING', label: 'Istirahat', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'INACTIVE', label: 'Tutup', color: 'bg-red-100 text-red-800' },
  ];

  if (loading) return <LoadingSkeleton count={3} type="card" />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return <div className="p-8">Tidak ada data vendor</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold">🍽️ Vendor Dashboard</h1>
        <p className="text-orange-100 mt-2">Kelola toko makanan Anda di sini</p>
      </div>

      <div className="p-8">
        {/* Store Info Card */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-orange-700 mb-1">{profile.storeName}</h2>
              <p className="text-orange-600 font-semibold text-lg">{profile.category}</p>
              <p className="text-gray-600 mt-3 max-w-2xl">
                {profile.description || `Lokasi: ${profile.latitude?.toFixed(4)}, ${profile.longitude?.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/vendor/menus')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform duration-200"
          >
            📝 Kelola Menu
          </button>
          <button
            onClick={loadProfile}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform duration-200"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Status Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">⚙️ Status Toko</h3>
          <div className="flex gap-4 mb-6 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  profile.status === opt.value
                    ? `${opt.color} border-2 border-gray-900 scale-105 shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={`inline-block px-6 py-3 rounded-lg font-bold text-center text-lg ${statusOptions.find(s => s.value === profile.status)?.color}`}>
            📍 Status Sekarang: {statusOptions.find(s => s.value === profile.status)?.label}
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mt-6 text-sm text-blue-800">
            <div className="font-semibold mb-1">ℹ️ Informasi</div>
            Status "Istirahat" atau "Tutup" akan terlihat di peta pembeli sehingga mereka tahu toko Anda sedang tidak beroperasi.
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-yellow-100 text-sm font-semibold">Rating</div>
            <div className="text-4xl font-bold mt-2 flex items-center">⭐ {profile.rating}</div>
            <div className="text-yellow-200 text-xs mt-2">Dari pembeli</div>
          </div>
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-pink-100 text-sm font-semibold">Followers</div>
            <div className="text-4xl font-bold mt-2 flex items-center">👥 {profile.followerCount}</div>
            <div className="text-pink-200 text-xs mt-2">Pengikut</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-green-100 text-sm font-semibold">Total Penjualan</div>
            <div className="text-4xl font-bold mt-2 flex items-center">📦 {profile.totalSales}</div>
            <div className="text-green-200 text-xs mt-2">Pesanan</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-blue-100 text-sm font-semibold">Menu Aktif</div>
            <div className="text-4xl font-bold mt-2 flex items-center">📝 {profile.menus?.length || 0}</div>
            <div className="text-blue-200 text-xs mt-2">Produk</div>
          </div>
        </div>

        {/* Verification Status */}
        {profile.isVerified && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-4 text-green-900 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <div className="font-bold">Akun Terverifikasi</div>
                <div className="text-sm mt-1">Akun Anda sudah terverifikasi dan dapat menerima pesanan</div>
              </div>
            </div>
          </div>
        )}
        {profile.isSuspended && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 text-red-900 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="font-bold">Akun Ditangguhkan</div>
                <div className="text-sm mt-1">{profile.suspendReason}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
