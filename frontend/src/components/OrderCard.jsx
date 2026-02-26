import React from 'react';
import { useAuthStore } from '../context/store';
import { formatCurrency } from '../utils/helpers';

export default function OrderCard({ order, onView, onRate }) {
  const user = useAuthStore((state) => state.user);

  const getStatusColor = (status) => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{order.vendor?.storeName || 'Order'}</h4>
          <p className="text-xs text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-1">Items:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {order.items?.slice(0, 2).map((item) => (
            <li key={item.id}>
              • {item.menu?.name} x{item.quantity} ({formatCurrency(item.price)})
            </li>
          ))}
          {order.items?.length > 2 && <li className="text-gray-600">+{order.items.length - 2} more</li>}
        </ul>
      </div>

      <div className="border-t pt-2 mb-3 flex justify-between items-center">
        <span className="text-gray-700 font-semibold">Total:</span>
        <span className="text-lg font-bold text-primary">{formatCurrency(order.totalPrice)}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(order.id)}
          className="flex-1 bg-secondary text-white py-2 rounded font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        {order.status === 'COMPLETED' && !order.review && (
          <button
            onClick={() => onRate(order.id)}
            className="flex-1 bg-primary text-white py-2 rounded font-semibold text-sm hover:bg-orange-600 transition-colors"
          >
            Rate
          </button>
        )}
      </div>
    </div>
  );
}
