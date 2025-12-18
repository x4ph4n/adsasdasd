import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { Order } from '../types';
import { ChevronLeft, Clock, CheckCircle, XCircle, Utensils } from 'lucide-react';

export default function History() {
  const { activeStudent } = useAppContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (activeStudent) {
      Database.getOrders(activeStudent.uid).then(setOrders);
    }
  }, [activeStudent]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-success" />;
      case 'claimed': return <CheckCircle size={20} className="text-success" />;
      case 'cancelled': return <XCircle size={20} className="text-danger" />;
      default: return <Clock size={20} className="text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#D1FAE5] text-success';
      case 'claimed': return 'bg-[#D1FAE5] text-success';
      case 'cancelled': return 'bg-[#FEE2E2] text-danger';
      default: return 'bg-[#FEF3C7] text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-32">
       {/* Header */}
       <div className="bg-white p-6 pt-8 pb-4 sticky top-0 z-10 shadow-sm">
          <button 
             onClick={() => navigate(-1)} 
             className="flex items-center gap-2 text-textSecondary hover:text-textPrimary mb-4 font-bold text-sm"
          >
             <ChevronLeft size={20} /> Back
          </button>
          <h1 className="text-[32px] font-bold text-textPrimary">Order History</h1>
          <p className="text-textSecondary mt-2">View your past orders</p>
       </div>

       <div className="p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center text-textSecondary py-8 flex flex-col items-center">
              <Utensils size={48} className="opacity-20 mb-4" />
              <p>No orders yet.</p>
            </div>
          ) : (
            orders.map((order) => (
               <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(order.status)}
                              <span className="font-bold text-textPrimary capitalize">{order.status}</span>
                          </div>
                          <div className="text-xs text-textSecondary">ID: {order.id.slice(-6)}</div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-textPrimary text-lg">₱{order.totalAmount.toFixed(2)}</div>
                          <div className="text-xs text-textSecondary">{new Date(order.orderTime).toLocaleDateString()}</div>
                      </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                      {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-textSecondary">
                              <span>{i.quantity}x {i.name}</span>
                              <span className="font-medium">₱{(i.price * i.quantity).toFixed(2)}</span>
                          </div>
                      ))}
                  </div>

                  {(order.status === 'pending' || order.status === 'ready') && (
                      <div className="mt-4 bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-200">
                          <div className="text-xs text-textSecondary font-bold">Show this code to staff</div>
                          <div className="font-mono font-bold text-xl tracking-widest text-primary">{order.claimCode}</div>
                      </div>
                  )}
               </div>
            ))
          )}
       </div>
    </div>
  );
}
