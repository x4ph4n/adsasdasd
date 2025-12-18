import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { MealType } from '../types';
import { ChevronLeft, MapPin, CreditCard, Banknote, Wallet, Loader2 } from 'lucide-react';

export default function Checkout() {
  const { cart, activeStudent, clearCart } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!activeStudent) return;
    
    if (paymentMethod === 'wallet' && activeStudent.walletBalance < total) {
        alert("Insufficient wallet balance.");
        return;
    }

    setLoading(true);
    try {
        // Assuming default meal type for now or add selection in checkout
        const success = await Database.placeOrder(activeStudent, cart, total, MealType.LUNCH); 
        if (success) {
            clearCart();
            alert("Order placed successfully!");
            navigate('/student'); // Or to order history
        } else {
            alert("Failed to place order.");
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred.");
    } finally {
        setLoading(false);
    }
  };

  if (cart.length === 0) {
      navigate('/student/cart');
      return null;
  }

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-32">
       {/* Header */}
       <div className="bg-primaryLight rounded-b-[32px] p-6 pt-8 h-[180px] relative">
          <div className="flex items-center justify-between">
             <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                <ChevronLeft size={24} />
             </button>
             <h1 className="text-2xl font-bold text-white mt-8">Checkout</h1>
             <div className="w-10"></div>
          </div>
          
          <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
             <div className="bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-medium shadow-sm border border-white/20">
                {totalItems} items • ₱{total.toFixed(2)}
             </div>
          </div>
       </div>

       <div className="mt-12 px-6">
          {/* Pickup Location */}
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex items-start gap-4">
             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                <MapPin size={20} />
             </div>
             <div>
                <div className="text-xs text-textSecondary uppercase font-bold mb-1">Pickup Location</div>
                <div className="font-bold text-textPrimary">Canteen Counter 1</div>
                <div className="text-sm text-textSecondary mt-1">Ready in ~15 minutes</div>
             </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
             <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-primary" />
                <h3 className="font-bold text-textPrimary">Payment Method</h3>
             </div>
             
             <div className="space-y-3">
                <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${paymentMethod === 'cash' ? 'border-primary bg-green-50' : 'border-slate-100 bg-white'}`}
                >
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                      <Banknote size={20} />
                   </div>
                   <div className="text-left flex-1">
                      <div className="font-bold text-textPrimary">Cash</div>
                      <div className="text-xs text-textSecondary">Pay at Counter</div>
                   </div>
                   {paymentMethod === 'cash' && <div className="w-4 h-4 rounded-full bg-primary"></div>}
                </button>

                <button 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${paymentMethod === 'wallet' ? 'border-primary bg-green-50' : 'border-slate-100 bg-white'}`}
                >
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                      <Wallet size={20} />
                   </div>
                   <div className="text-left flex-1">
                      <div className="font-bold text-textPrimary">Wallet</div>
                      <div className="text-xs text-textSecondary">Bal: ₱{activeStudent?.walletBalance.toFixed(2)}</div>
                   </div>
                   {paymentMethod === 'wallet' && <div className="w-4 h-4 rounded-full bg-primary"></div>}
                </button>
             </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
             <div className="space-y-3 mb-4">
                <div className="flex justify-between text-textSecondary text-sm">
                   <span>Subtotal</span>
                   <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-textSecondary text-sm">
                   <span>Tax (5%)</span>
                   <span>₱{tax.toFixed(2)}</span>
                </div>
             </div>
             <div className="h-px bg-slate-100 mb-4"></div>
             <div className="flex justify-between items-center">
                <span className="font-bold text-textPrimary">Total</span>
                <span className="text-2xl font-bold text-primary">₱{total.toFixed(2)}</span>
             </div>
          </div>

          <button 
             onClick={handlePlaceOrder}
             disabled={loading}
             className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin" size={20} /> : `Place Order • ₱${total.toFixed(2)}`}
          </button>
       </div>
    </div>
  );
}
