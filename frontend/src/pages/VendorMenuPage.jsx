import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../context/store';
import { vendorService, menuService } from '../services/api';
import { getAssetUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function VendorMenuPage() {
  const user = useAuthStore((state) => state.user);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    imageFile: null,
    imagePreview: '',
  });

  useEffect(() => {
    if (user?.vendor) {
      loadMenus();
    }
  }, [user]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const res = await menuService.getVendorMenus(user.vendor.id);
      setMenus(res.data.menus || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Nama & harga wajib diisi');
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      if (editingMenu) {
        await menuService.update(editingMenu.id, payload);
        toast.success('Menu berhasil diupdate');
      } else {
        await menuService.create(payload);
        toast.success('Menu berhasil ditambah');
      }
      setShowModal(false);
      setFormData({ name: '', description: '', price: 0, image: '', imageFile: null, imagePreview: '' });
      setEditingMenu(null);
      loadMenus();
    } catch (err) {
      console.error(err);
      toast.error('Gagal simpan menu');
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('Hapus menu ini?')) return;
    try {
      await menuService.delete(menuId);
      toast.success('Menu berhasil dihapus');
      loadMenus();
    } catch (err) {
      console.error(err);
      toast.error('Gagal hapus menu');
    }
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      image: menu.image || '',
      imageFile: null,
      imagePreview: menu.image || '',
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Manage Menu</h1>
      <p className="text-gray-600 mb-6">Toko: {user?.vendor?.storeName}</p>

      <button
        onClick={() => {
          setEditingMenu(null);
          setFormData({ name: '', description: '', price: 0, image: '' });
          setShowModal(true);
        }}
        className="bg-primary text-white px-4 py-2 rounded mb-4"
      >
        + Tambah Menu
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <div key={menu.id} className="bg-white p-4 rounded shadow">
            {menu.image && (
              <img
                src={getAssetUrl(menu.image)}
                alt={menu.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-semibold mb-1">{menu.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-primary">Rp {menu.price.toLocaleString('id-ID')}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  menu.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {menu.isAvailable ? 'Tersedia' : 'Habis'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditMenu(menu)}
                className="flex-1 bg-blue-500 text-white py-2 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteMenu(menu.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingMenu ? 'Edit Menu' : 'Tambah Menu'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Soto Ayam"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows="2"
                  placeholder="Deskripsi menu..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Foto Menu</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFormData((prev) => ({
                      ...prev,
                      imageFile: file || null,
                      imagePreview: file ? URL.createObjectURL(file) : prev.image,
                    }));
                  }}
                  className="w-full text-sm"
                />
                {formData.imagePreview && (
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded"
                    />
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveMenu}
                className="flex-1 bg-primary text-white py-2 rounded"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
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
