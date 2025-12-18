import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { ShoppingCart, ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useAppContext();
  const navigate = useNavigate();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax example from JSON (though school canteens usually don't have tax visible, but following JSON)
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-backgroundSecondary flex flex-col items-center justify-center p-6 pb-24">
         <div className="w-[120px] h-[120px] bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={48} className="text-slate-300" />
         </div>
         <h2 className="text-2xl font-bold text-textPrimary mb-2">Your cart is empty</h2>
         <p className="text-textSecondary text-center mb-8">Add items from the menu to get started</p>
         <button 
           onClick={() => navigate('/student/menu')}
           className="bg-primary text-white font-bold h-14 px-12 rounded-xl flex items-center justify-center hover:bg-green-600 transition shadow-lg shadow-green-100"
         >
           Browse Menu
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-32">
       {/* Header */}
       <div className="bg-primaryLight rounded-b-[32px] p-6 pt-8 h-[200px] relative">
          <div className="flex items-center justify-between mb-4">
             <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                <ChevronLeft size={24} />
             </button>
             <h1 className="text-2xl font-bold text-white">My Cart</h1>
             <div className="w-10"></div> {/* Spacer */}
          </div>
          
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
             <div className="bg-white p-4 rounded-full shadow-lg relative">
                <ShoppingCart size={40} className="text-primary" />
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                   {totalItems}
                </div>
             </div>
          </div>
       </div>

       {/* Content */}
       <div className="mt-16 px-6">
          <p className="text-center text-textSecondary mb-6">You have {totalItems} items in your cart</p>

          <div className="space-y-4 mb-8">
             {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                   <div className="w-[60px] h-[60px] bg-yellow-100 rounded-xl flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                   
                   <div className="flex-1">
                      <div className="font-bold text-textPrimary text-sm mb-1">{item.name}</div>
                      <div className="text-primary font-bold">₱{item.price}</div>
                   </div>

                   <div className="flex items-center bg-slate-100 rounded-lg h-8">
                      <button 
                         onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                         className="px-2 h-full text-slate-500 hover:text-slate-700 flex items-center justify-center"
                      >
                         <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-textPrimary px-2">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         className="px-2 h-full text-slate-500 hover:text-slate-700 flex items-center justify-center"
                      >
                         <Plus size={14} />
                      </button>
                   </div>
                </div>
             ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
             <h3 className="font-bold text-textPrimary mb-4">Order Summary</h3>
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
             onClick={() => navigate('/student/checkout')}
             className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-100"
          >
             Proceed to Checkout
          </button>
       </div>
    </div>
  );
}