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
  if (error) return <div className="text-red-500">{error}</div>;

  const { stats, recentOrders, topVendors } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold">👑 Admin Dashboard</h1>
        <p className="text-indigo-100 mt-2">Platform Management & Analytics</p>
      </div>

      <div className="p-8">
        {/* Navigation buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform duration-200"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/vendors')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform duration-200"
          >
            🏪 Manage Vendors
          </button>
          <button
            onClick={() => navigate('/admin/buyers')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform duration-200"
          >
            👥 Manage Buyers
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-purple-100 text-sm font-semibold">Total Users</div>
            <div className="text-4xl font-bold mt-2">{stats.totalUsers}</div>
            <div className="text-purple-200 text-xs mt-2">👥 Registered users</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-blue-100 text-sm font-semibold">Active Vendors</div>
            <div className="text-4xl font-bold mt-2">{stats.totalVendors}</div>
            <div className="text-blue-200 text-xs mt-2">🏪 On platform</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-orange-100 text-sm font-semibold">Total Orders</div>
            <div className="text-4xl font-bold mt-2">{stats.totalOrders}</div>
            <div className="text-orange-200 text-xs mt-2">📦 Completed</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
            <div className="text-green-100 text-sm font-semibold">Total Revenue</div>
            <div className="text-3xl font-bold mt-2 break-words">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-green-200 text-xs mt-2">💰 Generated</div>
          </div>
        </div>

        {/* Top Vendors Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">⭐ Top Vendors</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-400 to-transparent rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topVendors.map((v, idx) => (
              <div key={v.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-orange-500">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">#{idx + 1}</div>
                      <h3 className="font-bold text-gray-800 mt-1 text-lg">{v.storeName}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">⭐ Rating</span>
                    <span className="font-bold text-orange-600">{v.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">📦 Total Sales</span>
                    <span className="font-bold text-blue-600">{v.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">👥 Followers</span>
                    <span className="font-bold text-green-600">{v.followerCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📋 Recent Orders</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-400 to-transparent rounded"></div>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o, idx) => (
              <div
                key={o.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500 flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-800">Order #{o.id.slice(-6)}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-purple-600">{o.buyer.name}</span> → <span className="font-semibold text-orange-600">{o.vendor.storeName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded">
                    {formatDate(o.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
