import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vendorService } from '../services/api';
import { formatCurrency, getAssetUrl } from '../utils/helpers';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function VendorDetailPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await vendorService.getProfile(vendorId);
        setVendor(res.data.vendor);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat paklek');
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) load();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <LoadingSkeleton count={3} type="card" />
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-xl text-red-600 mb-4">{error || 'Paklek tidak ditemukan'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-orange-100 hover:text-white mb-2"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold">{vendor.storeName}</h1>
            <p className="text-orange-50 mt-1">{vendor.category}</p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Status: {vendor.status}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Rating: {vendor.rating?.toFixed(1) || '0.0'}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Followers: {vendor.followerCount ?? 0}</span>
            </div>
          </div>
          {vendor.profileImage ? (
            <img
              src={getAssetUrl(vendor.profileImage)}
              alt={vendor.storeName}
              className="w-28 h-28 rounded-xl object-cover border-4 border-white/40 shadow"
            />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-white/20 flex items-center justify-center text-4xl">*</div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Informasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Deskripsi</p>
              <p className="text-gray-600 mt-1">{vendor.description || 'Belum ada deskripsi'}</p>
            </div>
            <div>
              <p className="font-semibold">Kontak</p>
              <p className="text-gray-600 mt-1">{vendor.user?.phone || '—'}</p>
              <p className="text-gray-600">{vendor.user?.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Menu</h2>
            <span className="text-sm text-gray-500">{vendor.menus?.length || 0} item</span>
          </div>

          {vendor.menus && vendor.menus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.menus.map((menu) => (
                <div key={menu.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                  {menu.image ? (
                    <img
                      src={getAssetUrl(menu.image)}
                      alt={menu.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-3xl">*</div>
                  )}
                  <h3 className="font-semibold text-gray-800">{menu.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{menu.description || '—'}</p>
                  <p className="text-primary font-bold mt-2">{formatCurrency(menu.price)}</p>
                  {!menu.isAvailable && (
                    <span className="text-xs text-red-500 mt-1 inline-block">Tidak tersedia</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Paklek belum menambahkan menu.</p>
          )}
        </div>

        {/* Reviews (preview) */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Review terbaru</h2>
            <span className="text-sm text-gray-500">{vendor.reviews?.length || 0} ulasan</span>
          </div>
          {vendor.reviews && vendor.reviews.length > 0 ? (
            <div className="space-y-4">
              {vendor.reviews.slice(0, 5).map((rev) => (
                <div key={rev.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span>* {rev.rating}</span>
                    <span>•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 text-sm">{rev.comment || '—'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Belum ada review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
