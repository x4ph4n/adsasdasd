import React from 'react';
import { Bell, Package, Wallet, AlertTriangle, Check, Clock } from 'lucide-react';

export default function Notifications() {
  const notifications = [
      { id: 1, type: 'newOrder', title: 'New Order Received', description: 'Student One placed an order #ORD-001', time: '2m ago', read: false },
      { id: 2, type: 'topUpRequest', title: 'Top-Up Request', description: 'Student Two requested ₱500 top-up', time: '15m ago', read: false },
      { id: 3, type: 'lowStock', title: 'Low Stock Alert', description: 'Burger buns are running low (5 left)', time: '1h ago', read: false },
      { id: 4, type: 'orderCompleted', title: 'Order Completed', description: 'Order #ORD-003 has been claimed', time: '2h ago', read: true },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'newOrder': return <Package size={24} className="text-primary" />;
          case 'topUpRequest': return <Wallet size={24} className="text-primary" />;
          case 'lowStock': return <AlertTriangle size={24} className="text-warning" />;
          case 'orderCompleted': return <Check size={24} className="text-primary" />;
          default: return <Bell size={24} className="text-textSecondary" />;
      }
  };

  const getBgColor = (type: string) => {
      if (type === 'lowStock') return 'bg-[#FEF3C7]';
      return 'bg-[#E5F5EC]';
  };

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       <div className="bg-white p-6 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
             <h1 className="text-[32px] font-bold text-textPrimary">Notifications</h1>
             <button className="text-primary font-bold text-sm flex items-center gap-1">
                <Check size={16} /> Mark all read
             </button>
          </div>
          <p className="text-textSecondary">3 unread notifications</p>
       </div>

       <div className="p-6 space-y-3">
          {notifications.map((notif) => (
             <div key={notif.id} className={`p-4 rounded-2xl flex gap-4 ${notif.read ? 'bg-white' : 'bg-[#F0FDF4]'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgColor(notif.type)}`}>
                   {getIcon(notif.type)}
                </div>
                <div className="flex-1 relative">
                   <div className="font-bold text-textPrimary text-base mb-1 pr-4">{notif.title}</div>
                   <div className="text-sm text-textSecondary mb-2">{notif.description}</div>
                   <div className="flex items-center gap-1 text-xs text-textSecondary">
                      <Clock size={12} /> {notif.time}
                   </div>
                   {!notif.read && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"></div>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
