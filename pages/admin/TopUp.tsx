import React, { useState, useEffect } from 'react';
import { Search, Check, X, Loader2 } from 'lucide-react';
import { Database } from '../../services/db';
import { Transaction } from '../../types';

export default function AdminTopUp() {
  const [requests, setRequests] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
        const data = await Database.getPendingTopUps();
        setRequests(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'decline') => {
      const confirmMsg = action === 'approve' ? "Approve this top-up?" : "Decline this top-up?";
      if (!confirm(confirmMsg)) return;

      try {
          let success = false;
          if (action === 'approve') success = await Database.approveTopUp(id);
          else success = await Database.declineTopUp(id);

          if (success) {
              alert(`Request ${action}d successfully.`);
              loadRequests();
          } else {
              alert("Action failed.");
          }
      } catch (e) {
          console.error(e);
          alert("Error processing request.");
      }
  };

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-24">
       <div className="bg-white p-6 pt-8 pb-4">
          <h1 className="text-[32px] font-bold text-textPrimary">Top-Up Requests</h1>
          <p className="text-textSecondary mt-2">Manage student balance top-up requests.</p>
       </div>

       <div className="p-6">
          <div className="relative mb-6">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
             <input 
                type="text" 
                placeholder="Search by name or ID..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
             />
          </div>

          {loading ? (
             <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
             <div className="space-y-3">
                {requests.length === 0 && <div className="text-center text-textSecondary py-8">No pending requests.</div>}
                {requests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-bold text-textPrimary text-lg">{req.userName || 'Unknown User'}</div>
                            <div className="text-xs text-textSecondary">Wallet ID: {req.userWalletId}</div>
                        </div>
                        <div className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-[#FEF3C7] text-warning">
                            {req.status}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="text-2xl font-bold text-primary">₱{req.amount.toFixed(2)}</div>
                        <div className="text-xs text-textSecondary font-bold uppercase tracking-wider">Top-Up Request</div>
                        <div className="text-xs text-textSecondary mt-1">{new Date(req.timestamp).toLocaleString()}</div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => handleAction(req.id, 'decline')}
                            className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-danger hover:bg-red-200 transition"
                        >
                            <X size={24} />
                        </button>
                        <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            className="w-12 h-12 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-success hover:bg-green-200 transition"
                        >
                            <Check size={24} />
                        </button>
                    </div>
                    </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}