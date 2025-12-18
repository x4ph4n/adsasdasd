import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { Transaction } from '../types';
import { Plus, ArrowUpRight, ArrowDownLeft, X, Smartphone, Banknote, Loader2 } from 'lucide-react';

const TopUpModal = ({ onClose }: { onClose: () => void }) => {
    const { activeStudent } = useAppContext();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStudent || !amount) return;
        setLoading(true);
        try {
            await Database.requestTopUp(activeStudent.uid, parseFloat(amount), activeStudent.name, activeStudent.walletId);
            alert(paymentMethod === 'gcash' ? "Redirecting to GCash... (Simulation)" : "Top-up request sent! Please pay at the counter.");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to request top-up.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Top Up Balance</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Quick Amounts */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[100, 200, 500, 1000].map(val => (
                            <button 
                                key={val}
                                type="button"
                                onClick={() => setAmount(val.toString())}
                                className={`py-4 rounded-xl font-bold text-lg transition ${amount === val.toString() ? 'bg-primary text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-600'}`}
                            >
                                ₱{val}
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-500 mb-2">Or enter custom amount</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            min="1"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-500 mb-2">Payment Method</label>
                        <div className="space-y-3">
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('gcash')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${paymentMethod === 'gcash' ? 'border-primary bg-green-50 text-primary' : 'border-slate-200 text-slate-600'}`}
                            >
                                <Smartphone size={20} />
                                <span className="font-bold">GCash</span>
                                {paymentMethod === 'gcash' && <div className="ml-auto w-3 h-3 rounded-full bg-primary"></div>}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${paymentMethod === 'cash' ? 'border-primary bg-green-50 text-primary' : 'border-slate-200 text-slate-600'}`}
                            >
                                <Banknote size={20} />
                                <span className="font-bold">Cash</span>
                                {paymentMethod === 'cash' && <div className="ml-auto w-3 h-3 rounded-full bg-primary"></div>}
                            </button>
                        </div>
                        {paymentMethod === 'gcash' && (
                            <p className="text-xs text-textSecondary mt-2">
                                Tapping 'Pay with GCash' will open GCash where you can scan the payment QR.
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-xl shadow-green-100"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (paymentMethod === 'gcash' ? 'Pay with GCash' : 'Request Top-Up')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Wallet() {
  const { activeStudent } = useAppContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    if(activeStudent) {
        Database.getTransactions(activeStudent.uid).then(setTransactions);
    }
  }, [activeStudent]);

  return (
    <div className="pb-32 min-h-screen bg-backgroundSecondary">
       <div className="p-6 pt-8">
          <h1 className="text-[32px] font-bold text-textPrimary">Wallet</h1>
          <p className="text-textSecondary mt-2">Manage your canteen balance</p>
       </div>

       <div className="px-6">
          {/* Balance Card */}
          <div className="bg-primary rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <div className="text-sm opacity-90">Current Balance</div>
                <div className="text-[48px] font-bold mt-2">₱{activeStudent?.walletBalance.toFixed(2)}</div>
                <div className="text-sm opacity-80 mt-2">Linked Card ID: {activeStudent?.rfid_uid || activeStudent?.walletId || 'Not Linked'}</div>
                
                <button 
                   onClick={() => setShowTopUp(true)}
                   className="mt-6 bg-white text-primary rounded-xl h-12 px-6 font-bold flex items-center gap-2 hover:bg-slate-50 transition"
                >
                   <Plus size={20} /> Top Up
                </button>
             </div>
             {/* Decorative circles */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Recent Transactions */}
          <h3 className="text-2xl font-bold text-textPrimary mb-4">Recent Transactions</h3>
          <div className="space-y-4">
             {transactions.length === 0 ? (
                 <p className="text-textSecondary text-center py-4">No transactions yet.</p>
             ) : (
                 transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${txn.type === 'topup' ? 'bg-[#E5F5EC] text-primary' : 'bg-[#FEE2E2] text-danger'}`}>
                             {txn.type === 'topup' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                          </div>
                          <div>
                             <div className="font-bold text-textPrimary text-base">{txn.description}</div>
                             <div className="text-sm text-textSecondary">{new Date(txn.timestamp).toLocaleDateString()}</div>
                          </div>
                       </div>
                       <div className={`text-lg font-bold ${txn.type === 'topup' ? 'text-primary' : 'text-textPrimary'}`}>
                          {txn.type === 'topup' ? '+' : '-'}₱{txn.amount}
                       </div>
                    </div>
                 ))
             )}
          </div>
       </div>

       {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </div>
  );
}