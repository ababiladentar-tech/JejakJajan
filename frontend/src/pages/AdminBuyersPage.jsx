import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(1, 100);
      const buyersList = res.data.users.filter((u) => u.role === 'BUYER');
      setBuyers(buyersList);
    } catch (err) {
      console.error(err);
      toast.error('Gagal load pembeli');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Buyers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Buyer List */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedBuyer(buyer)}
              >
                <div className="font-semibold">{buyer.name}</div>
                <div className="text-sm text-gray-600">{buyer.email}</div>
                {buyer.phone && <div className="text-sm text-gray-500">{buyer.phone}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Buyer Detail */}
        <div className="bg-white p-4 rounded shadow">
          {selectedBuyer ? (
            <>
              <h2 className="font-bold mb-4">{selectedBuyer.name}</h2>
              <div className="text-sm space-y-3">
                <div>
                  <span className="font-semibold block mb-1">Email</span>
                  {selectedBuyer.email}
                </div>
                {selectedBuyer.phone && (
                  <div>
                    <span className="font-semibold block mb-1">Telepon</span>
                    {selectedBuyer.phone}
                  </div>
                )}
                <div>
                  <span className="font-semibold block mb-1">Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedBuyer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedBuyer.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold block mb-1">Bergabung</span>
                  {new Date(selectedBuyer.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-600 text-center">Pilih pembeli untuk detail</div>
          )}
        </div>
      </div>
    </div>
  );
}
