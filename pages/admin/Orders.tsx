import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Check, X, Eye, Loader2 } from 'lucide-react';
import { Database } from '../../services/db';
import { Order } from '../../types';

export default function AdminOrders() {
  const [filter, setFilter] = useState('All Orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
        const data = await Database.getAllOrders();
        setOrders(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-[#FEF3C7] text-warning';
          case 'preparing': return 'bg-[#DBEAFE] text-blue-500';
          case 'ready': return 'bg-[#D1FAE5] text-success';
          case 'claimed': return 'bg-[#D1FAE5] text-success';
          case 'cancelled': return 'bg-[#FEE2E2] text-danger';
          default: return 'bg-gray-100 text-gray-500';
      }
  };

  const filteredOrders = filter === 'All Orders' ? orders : orders.filter(o => o.status === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       <div className="bg-white p-6 pt-8 pb-4">
          <h1 className="text-[32px] font-bold text-textPrimary">Order Management</h1>
          <p className="text-textSecondary mt-2">View and manage all incoming orders.</p>
       </div>

       <div className="p-6">
          <div className="relative mb-4">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
             <input 
                type="text" 
                placeholder="Search orders..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
             />
          </div>

          <button className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 flex items-center justify-between mb-4 text-textPrimary font-bold">
             <div className="flex items-center gap-2">
                <Filter size={20} className="text-slate-400" />
                {filter}
             </div>
          </button>

          <button className="w-full bg-slate-100 text-textPrimary font-bold py-3 rounded-xl mb-6 flex items-center justify-center gap-2">
             <Download size={20} /> Export CSV
          </button>

          {loading ? (
             <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
             <div className="space-y-3">
                {filteredOrders.length === 0 && <div className="text-center text-textSecondary py-8">No orders found.</div>}
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-bold text-textPrimary text-lg">{order.userName}</div>
                            <div className="text-xs text-textSecondary">{order.id}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                            {order.status}
                        </div>
                    </div>

                    <div className="text-textSecondary text-sm mb-4">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-primary font-bold text-xl">₱{order.totalAmount.toFixed(2)}</div>
                            <div className="text-xs text-textSecondary">{new Date(order.orderTime).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-textSecondary hover:bg-slate-200 transition">
                                <Eye size={20} />
                            </button>
                            {order.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => Database.updateOrderStatus(order.id, 'cancelled').then(loadOrders)}
                                        className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-danger hover:bg-red-200 transition"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button 
                                        onClick={() => Database.updateOrderStatus(order.id, 'ready').then(loadOrders)}
                                        className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-success hover:bg-green-200 transition"
                                    >
                                        <Check size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}