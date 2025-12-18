import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { Product, MealType } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, Coffee, Utensils, Flame, ChevronRight, Wallet
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, activeStudent } = useAppContext();
  const navigate = useNavigate();
  const [popularItems, setPopularItems] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch popular items (simulated by taking first 5 items from menu for now)
    Database.getMenu().then(menu => {
        setPopularItems(menu.slice(0, 5));
    });
  }, []);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-[32px] font-bold text-textPrimary">Good Morning, {user?.name?.split(' ')[0] || 'Student'}!</h1>
        <p className="text-textSecondary mt-2">Start your day with a delicious meal!</p>
      </div>

      <div className="px-6 pb-6">
        {/* Wallet Card */}
        <div className="bg-primary rounded-2xl p-6 mb-6 relative overflow-hidden text-white shadow-lg">
           <div className="relative z-10">
              <div className="text-sm opacity-90">Wallet Balance</div>
              <div className="text-[40px] font-bold mt-2">₱{activeStudent?.walletBalance.toFixed(2) || '0.00'}</div>
              <button 
                onClick={() => navigate('/student/wallet')}
                className="mt-4 bg-white/20 backdrop-blur-sm text-white flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-bold hover:bg-white/30 transition"
              >
                Top Up Balance <ChevronRight size={16} />
              </button>
           </div>
           <Wallet className="absolute top-4 right-4 text-white/20" size={64} />
        </div>

        {/* Today's Schedule */}
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4">
             <Clock size={20} /> Today's Schedule
          </h3>
          <div className="space-y-3">
             <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
                   <Coffee size={24} />
                </div>
                <div>
                   <div className="font-bold text-textPrimary">Recess</div>
                   <div className="text-sm text-textSecondary">10:00 AM - 10:30 AM</div>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-500">
                   <Utensils size={24} />
                </div>
                <div>
                   <div className="font-bold text-textPrimary">Lunch</div>
                   <div className="text-sm text-textSecondary">12:00 PM - 1:00 PM</div>
                </div>
             </div>
          </div>
        </div>

        {/* Popular This Week */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-danger">
                 <Flame size={20} /> Popular This Week
              </h3>
              <button 
                onClick={() => navigate('/student/menu')}
                className="text-primary text-sm font-bold"
              >
                View Menu
              </button>
           </div>
           
           <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 scrollbar-hide">
              {popularItems.map((item) => (
                 <div key={item.id} className="flex-shrink-0 w-[180px] bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-[140px] object-cover rounded-xl bg-slate-100 mb-3" />
                    <div className="font-bold text-textPrimary truncate">{item.name}</div>
                    <div className="flex items-center gap-1 mt-1 mb-2">
                       <div className="bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="text-xs font-bold text-green-600">4.5</span>
                       </div>
                    </div>
                    <div className="text-lg font-bold text-primary">₱{item.price}</div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
