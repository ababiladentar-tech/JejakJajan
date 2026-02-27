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
      setError('Gagal memuat profil paklek');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await vendorService.updateStatus(newStatus);
      setProfile({ ...profile, status: newStatus });
      toast.success(`Status diubah menjadi ${newStatus}`);
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
  if (!profile) return <div className="p-8">Tidak ada data paklek</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-2">
          <p className="text-sm uppercase tracking-wide text-orange-100">Dashboard</p>
          <h1 className="text-3xl font-bold">Paklek Center</h1>
          <p className="text-orange-100">Kelola toko, status, dan menu dengan cepat.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/vendor/menus')}
              className="bg-white text-orange-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-50 transition"
            >
              Kelola Menu
            </button>
            <button
              onClick={loadProfile}
              className="border border-white/70 px-4 py-2 rounded-lg font-semibold text-white hover:bg-white/10 transition"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Store summary */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Toko</p>
              <h2 className="text-2xl font-bold text-gray-900">{profile.storeName}</h2>
              <p className="text-gray-600 mt-2">{profile.category}</p>
              <p className="text-gray-500 mt-2">
                {profile.description || `Lokasi: ${profile.latitude?.toFixed(4)}, ${profile.longitude?.toFixed(4)}`}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm ${statusOptions.find(s => s.value === profile.status)?.color}`}>
                {statusOptions.find(s => s.value === profile.status)?.label}
              </span>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Toko</h3>
          <div className="flex gap-3 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-5 py-3 rounded-lg font-semibold transition ${
                  profile.status === opt.value
                    ? `${opt.color} border border-gray-300 shadow`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="Rating" value={profile.rating} accent="from-amber-500 to-amber-600" />
          <MiniStat label="Followers" value={profile.followerCount} accent="from-slate-500 to-slate-700" />
          <MiniStat label="Total Penjualan" value={profile.totalSales} accent="from-emerald-500 to-emerald-700" />
          <MiniStat label="Menu Aktif" value={profile.menus?.length || 0} accent="from-blue-500 to-blue-700" />
        </section>

        {/* Verification / Suspension */}
        {profile.isVerified && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
            <div className="font-semibold">Akun Terverifikasi</div>
            <p className="text-sm mt-1">Akun Anda siap menerima pesanan.</p>
          </div>
        )}
        {profile.isSuspended && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
            <div className="font-semibold">Akun Ditangguhkan</div>
            <p className="text-sm mt-1">{profile.suspendReason || 'Hubungi admin untuk info lebih lanjut.'}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className={`bg-gradient-to-br ${accent} rounded-xl p-5 text-white shadow`}>
      <div className="text-sm text-white/80">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
