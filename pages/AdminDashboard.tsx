import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, AlertTriangle, ChevronRight, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
      sales: 24580,
      users: 342,
      pendingOrders: 18,
      lowStock: 4
  });
  const [topSelling, setTopSelling] = useState<Product[]>([]);

  useEffect(() => {
    // In a real app, fetch these stats from DB
    Database.getMenu().then(items => setTopSelling(items.slice(0, 2)));
  }, []);

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       {/* Header */}
       <div className="bg-white p-6 pt-8 pb-4">
          <h1 className="text-[32px] font-bold text-textPrimary">Good Morning, Admin!</h1>
          <p className="text-textSecondary mt-2">Here's your canteen overview for today</p>
       </div>

       <div className="p-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             {/* Total Sales */}
             <div 
               onClick={() => navigate('/admin/analytics')}
               className="bg-white p-4 rounded-2xl border-l-4 border-primary shadow-sm cursor-pointer hover:bg-slate-50 transition"
             >
                <div className="flex items-start justify-between mb-2">
                   <div className="text-textSecondary text-sm font-bold">Total Sales</div>
                   <div className="w-8 h-8 bg-[#E5F5EC] rounded-lg flex items-center justify-center text-primary">
                      <DollarSign size={16} />
                   </div>
                </div>
                <div className="text-2xl font-bold text-textPrimary mb-1">₱{stats.sales.toLocaleString()}</div>
                <div className="text-xs font-bold text-primary flex items-center gap-1">
                   <TrendingUp size={12} /> +12%
                </div>
             </div>

             {/* Active Users */}
             <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-2">
                   <div className="text-textSecondary text-sm font-bold">Active Users</div>
                   <div className="w-8 h-8 bg-[#E5F5EC] rounded-lg flex items-center justify-center text-primary">
                      <Users size={16} />
                   </div>
                </div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{stats.users}</div>
                <div className="text-xs font-bold text-primary flex items-center gap-1">
                   <TrendingUp size={12} /> +8%
                </div>
             </div>

             {/* Pending Orders */}
             <div 
               onClick={() => navigate('/admin/orders')}
               className="bg-white p-4 rounded-2xl border-l-4 border-warning shadow-sm cursor-pointer hover:bg-slate-50 transition"
             >
                <div className="flex items-start justify-between mb-2">
                   <div className="text-textSecondary text-sm font-bold">Pending Orders</div>
                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-lg flex items-center justify-center text-warning">
                      <Clock size={16} />
                   </div>
                </div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{stats.pendingOrders}</div>
             </div>

             {/* Low Stock */}
             <div 
               onClick={() => navigate('/admin/inventory')}
               className="bg-white p-4 rounded-2xl border-l-4 border-warning shadow-sm cursor-pointer hover:bg-slate-50 transition"
             >
                <div className="flex items-start justify-between mb-2">
                   <div className="text-textSecondary text-sm font-bold">Low Stock</div>
                   <div className="w-8 h-8 bg-[#FEF3C7] rounded-lg flex items-center justify-center text-warning">
                      <AlertTriangle size={16} />
                   </div>
                </div>
                <div className="text-2xl font-bold text-textPrimary mb-1">{stats.lowStock}</div>
             </div>
          </div>

          {/* Top Selling */}
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-textPrimary">Top Selling This Week</h3>
             <button 
               onClick={() => navigate('/admin/inventory')}
               className="text-primary text-sm font-bold flex items-center gap-1"
             >
               View Inventory <ChevronRight size={16} />
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {topSelling.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm">
                   <div className="w-full h-[140px] bg-slate-100 rounded-xl mb-3 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="font-bold text-textPrimary mb-2">{item.name}</div>
                   <div className="flex items-center justify-between">
                      <div className="text-xs text-textSecondary flex items-center gap-1">
                         <TrendingUp size={12} /> 24 sold
                      </div>
                      <div className="font-bold text-primary">₱{(item.price * 24).toLocaleString()}</div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}