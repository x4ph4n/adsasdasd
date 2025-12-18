import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChevronLeft, DollarSign, TrendingUp } from 'lucide-react';

const dataDaily = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6200 },
  { name: 'Sat', value: 2000 },
  { name: 'Sun', value: 1500 },
];

const dataWeekly = [
  { name: 'Week 1', value: 15000 },
  { name: 'Week 2', value: 22000 },
  { name: 'Week 3', value: 18000 },
  { name: 'Week 4', value: 26000 },
];

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       {/* Header */}
       <div className="bg-white p-6 pt-8 pb-4">
          <button 
             onClick={() => navigate(-1)} 
             className="flex items-center gap-2 text-textSecondary hover:text-textPrimary mb-4 font-bold text-sm"
          >
             <ChevronLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-[32px] font-bold text-textPrimary">Total Sales</h1>
          <p className="text-textSecondary mt-2">Track your canteen sales performance</p>
       </div>

       <div className="p-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-white p-4 rounded-2xl border-l-4 border-primary shadow-sm">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs font-bold text-textSecondary">This Week</div>
                   <div className="w-6 h-6 bg-[#E5F5EC] rounded flex items-center justify-center text-primary">
                      <DollarSign size={14} />
                   </div>
                </div>
                <div className="text-xl font-bold text-textPrimary mb-1">₱24,580</div>
                <div className="text-[10px] font-bold text-primary bg-green-50 w-fit px-2 py-0.5 rounded-full">
                   +12.0% from last week
                </div>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs font-bold text-textSecondary">Last Week</div>
                   <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-textSecondary">
                      <DollarSign size={14} />
                   </div>
                </div>
                <div className="text-xl font-bold text-textPrimary">₱21,950</div>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs font-bold text-textSecondary">Daily Average</div>
                   <div className="w-6 h-6 bg-[#E5F5EC] rounded flex items-center justify-center text-primary">
                      <TrendingUp size={14} />
                   </div>
                </div>
                <div className="text-xl font-bold text-textPrimary">₱3,511</div>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                   <div className="text-xs font-bold text-textSecondary">Best Day</div>
                   <div className="w-6 h-6 bg-[#FEF3C7] rounded flex items-center justify-center text-warning">
                      <TrendingUp size={14} />
                   </div>
                </div>
                <div className="text-xl font-bold text-textPrimary mb-1">₱6,200</div>
                <div className="text-xs text-textSecondary">Friday</div>
             </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-8">
             <h3 className="font-bold text-textPrimary mb-6">Daily Sales (This Week)</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={dataDaily}>
                      <defs>
                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(value) => `₱${value/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
             <h3 className="font-bold text-textPrimary mb-6">Weekly Sales (This Month)</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={dataWeekly}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(value) => `₱${value/1000}k`} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Bar dataKey="value" fill="#22C55E" radius={[8, 8, 0, 0]} barSize={40} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  );
}
