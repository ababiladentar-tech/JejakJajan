import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSkeleton count={4} type="card" />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!data) return null;

  const { stats, recentOrders, topVendors } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-100">Dashboard</p>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-indigo-100">Pantau performa platform secara ringkas.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/admin/vendors')}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-50 transition"
            >
              Kelola Paklek
            </button>
            <button
              onClick={() => navigate('/admin/buyers')}
              className="border border-white/70 px-4 py-2 rounded-lg font-semibold text-white hover:bg-white/10 transition"
            >
              Kelola Pembeli
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Users" value={stats.totalUsers} accent="from-slate-500 to-slate-700" />
          <StatCard label="Paklek Aktif" value={stats.totalVendors} accent="from-blue-500 to-blue-700" />
          <StatCard label="Total Pesanan" value={stats.totalOrders} accent="from-amber-500 to-amber-700" />
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} accent="from-emerald-500 to-emerald-700" />
        </div>

        {/* Recent Orders */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pesanan Terbaru</h2>
              <p className="text-gray-500 text-sm">Ringkasan transaksi terakhir</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="py-2">ID</th>
                  <th className="py-2">Pembeli</th>
                  <th className="py-2">Paklek</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Waktu</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-none">
                    <td className="py-2">{o.id.slice(0, 6)}...</td>
                    <td className="py-2">{o.buyer.name}</td>
                    <td className="py-2">{o.vendor.storeName}</td>
                    <td className="py-2 font-semibold text-gray-900">Rp {o.totalPrice.toLocaleString('id-ID')}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Vendors */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Top Paklek</h2>
              <p className="text-gray-500 text-sm">Performa terbaik minggu ini</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topVendors.map((v, idx) => (
              <div key={v.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <div className="text-sm text-gray-500 mb-1">#{idx + 1}</div>
                <div className="font-semibold text-gray-900">{v.storeName}</div>
                <div className="text-sm text-gray-600">Kategori: {v.category}</div>
                <div className="mt-2 text-sm text-gray-700">Rating {v.rating} · {v.totalReviews} ulasan</div>
                <div className="mt-2 text-sm text-gray-700">Penjualan {v.totalSales}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-gradient-to-br ${accent} rounded-xl p-5 text-white shadow`}>
      <div className="text-sm text-white/80">{label}</div>
      <div className="text-3xl font-bold mt-2 break-words">{value}</div>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
