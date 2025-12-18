import React, { useEffect, useState } from 'react';
import { Search, Plus, AlertTriangle, Edit2 } from 'lucide-react';
import { Database } from '../../services/db';
import { Product } from '../../types';

export default function AdminInventory() {
  const [inventory, setInventory] = useState<Product[]>([]);

  useEffect(() => {
     Database.getMenu().then(setInventory);
  }, []);

  const getStockColor = (stock: number) => {
      if (stock <= 5) return 'text-danger';
      if (stock <= 20) return 'text-warning';
      return 'text-success';
  };
  
  const getProgressColor = (stock: number) => {
      if (stock <= 5) return 'bg-danger';
      if (stock <= 20) return 'bg-warning';
      return 'bg-success';
  };

  const lowStockCount = inventory.filter(i => i.stock <= 5).length;

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       <div className="bg-white p-6 pt-8 pb-4">
          <h1 className="text-[32px] font-bold text-textPrimary">Inventory</h1>
          <p className="text-textSecondary mt-2">Track and manage your canteen inventory.</p>
       </div>

       <div className="p-6">
          <div className="relative mb-4">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
             <input 
                type="text" 
                placeholder="Search inventory..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
             />
          </div>

          <button className="w-full bg-primary text-white font-bold py-3.5 rounded-xl mb-4 flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg shadow-green-100">
             <Plus size={20} /> Add Item
          </button>

          {lowStockCount > 0 && (
             <div className="bg-[#FEF3C7] text-warning p-4 rounded-xl flex items-center gap-3 mb-6 border border-yellow-200">
                <AlertTriangle size={24} />
                <span className="font-bold text-sm">{lowStockCount} items are critically low on stock.</span>
             </div>
          )}

          <div className="space-y-3">
             {inventory.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <div className="font-bold text-textPrimary text-xl">{item.name}</div>
                         <div className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs text-textSecondary font-bold mt-1 uppercase">
                            {item.category}
                         </div>
                      </div>
                      <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-textSecondary hover:bg-slate-200 transition">
                         <Edit2 size={18} />
                      </button>
                   </div>

                   <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                         <div className={`text-2xl font-bold ${getStockColor(item.stock)}`}>{item.stock}</div>
                         <div className="text-xs text-textSecondary font-bold">{Math.min(100, (item.stock / 50) * 100).toFixed(0)}%</div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                            className={`h-full rounded-full ${getProgressColor(item.stock)}`} 
                            style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                         ></div>
                      </div>
                   </div>

                   <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <div className="font-bold text-primary text-lg">₱{item.price.toFixed(2)}</div>
                      <div className="text-xs text-textSecondary">Updated today</div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}