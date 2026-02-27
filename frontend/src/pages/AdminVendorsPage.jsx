import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminVendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoData, setPromoData] = useState({
    vendorId: '',
    title: '',
    discount: 0,
    durationDays: 1,
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(1, 100);
      const vendorsList = res.data.users.filter((u) => u.role === 'VENDOR');
      setVendors(vendorsList);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat paklek');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    if (!promoData.title || !promoData.discount || !promoData.vendorId) {
      toast.error('Lengkapi semua field');
      return;
    }
    try {
      // Simpan promo ke localStorage untuk demo
      const promos = JSON.parse(localStorage.getItem('promos') || '[]');
      promos.push({
        id: Date.now(),
        ...promoData,
        startDate: new Date(),
        endDate: new Date(Date.now() + promoData.durationDays * 24 * 60 * 60 * 1000),
      });
      localStorage.setItem('promos', JSON.stringify(promos));
      toast.success('Promo berhasil dibuat');
      setShowPromoModal(false);
      setPromoData({ vendorId: '', title: '', discount: 0, durationDays: 1 });
    } catch (err) {
      toast.error('Gagal membuat promo');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Kelola Paklek</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daftar Paklek */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedVendor(vendor)}
              >
                <div className="font-semibold">{vendor.name}</div>
                <div className="text-sm text-gray-600">{vendor.email}</div>
                {vendor.vendor && (
                  <div className="text-sm text-gray-500">
                    {vendor.vendor.storeName} • Status: {vendor.vendor.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Paklek */}
        <div className="bg-white p-4 rounded shadow">
          {selectedVendor ? (
            <>
              <h2 className="font-bold mb-2">{selectedVendor.name}</h2>
              <div className="text-sm space-y-2 mb-4">
                <div>
                  <span className="font-semibold">Email:</span> {selectedVendor.email}
                </div>
                {selectedVendor.vendor && (
                  <>
                    <div>
                      <span className="font-semibold">Toko:</span> {selectedVendor.vendor.storeName}
                    </div>
                    <div>
                      <span className="font-semibold">Kategori:</span> {selectedVendor.vendor.category}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedVendor.vendor.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : selectedVendor.vendor.status === 'RESTING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedVendor.vendor.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Rating:</span> {selectedVendor.vendor.rating}
                    </div>
                    <div>
                      <span className="font-semibold">Followers:</span> {selectedVendor.vendor.followerCount}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async () => {
                          try {
                            await adminService.suspendVendor(selectedVendor.vendor.id, 'Disabled by admin');
                            toast.success('Paklek dinonaktifkan');
                            loadVendors();
                          } catch (err) {
                            toast.error('Gagal menonaktifkan');
                          }
                        }}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded text-sm"
                      >
                        Nonaktifkan
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await adminService.unsuspendVendor(selectedVendor.vendor.id);
                            toast.success('Paklek diaktifkan');
                            loadVendors();
                          } catch (err) {
                            toast.error('Gagal mengaktifkan');
                          }
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded text-sm"
                      >
                        Aktifkan
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setPromoData({ ...promoData, vendorId: selectedVendor.vendor.id });
                  setShowPromoModal(true);
                }}
                className="w-full bg-primary text-white py-2 rounded text-sm"
              >
                Buat Promo
              </button>
            </>
          ) : (
            <div className="text-gray-600 text-center">Pilih paklek untuk detail</div>
          )}
        </div>
      </div>

      {/* Promo Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Buat Promo</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Judul Promo</label>
                <input
                  type="text"
                  value={promoData.title}
                  onChange={(e) => setPromoData({ ...promoData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Diskon 30%"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Diskon (%)</label>
                <input
                  type="number"
                  value={promoData.discount}
                  onChange={(e) => setPromoData({ ...promoData, discount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Durasi (hari)</label>
                <input
                  type="number"
                  value={promoData.durationDays}
                  onChange={(e) => setPromoData({ ...promoData, durationDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreatePromo}
                className="flex-1 bg-primary text-white py-2 rounded"
              >
                Buat
              </button>
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
