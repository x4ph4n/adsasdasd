import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { Database } from '../services/db';
import { Product, MealType } from '../types';
import { Search, Grid, List as ListIcon, Star, Plus, Minus, X } from 'lucide-react';

const ItemDetailModal = ({ item, quantity, setQuantity, onClose, onAdd }: { item: Product, quantity: number, setQuantity: (q: number) => void, onClose: () => void, onAdd: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg mb-4 bg-slate-100">
                        <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">{item.name}</h2>
                    <div className="text-primary font-bold text-lg">₱{item.price}</div>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                    >
                        <Minus size={20} />
                    </button>
                    <span className="text-3xl font-bold text-slate-800 w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                      className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <button 
                    onClick={onAdd}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-xl shadow-green-100"
                >
                    Add to Cart - ₱{(item.price * quantity).toFixed(2)}
                </button>
            </div>
        </div>
    );
};

export default function Menu() {
  const { addToCart } = useAppContext();
  const [menu, setMenu] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 'all', 'Recess', 'Lunch'
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    Database.getMenu().then(setMenu);
  }, []);

  const handleAddToCart = () => {
    if (selectedItem) {
        addToCart({ ...selectedItem, quantity: itemQuantity });
        setSelectedItem(null);
        setItemQuantity(1);
    }
  };

  const filteredMenu = menu.filter((item: Product) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    // Assuming 'category' field might map to Recess/Lunch or we filter by some other property.
    // Since 'Product' interface has 'category' (e.g. Rice Meals, Snacks), but 'MealType' is RECESS/LUNCH.
    // For now, I'll assume all items are available or filter by the 'category' string if it matches 'Recess' or 'Lunch'.
    // Or I'll just filter by search for now as the 'category' data might not perfectly align with 'Recess'/'Lunch' tabs yet.
    return matchesSearch;
  });

  return (
    <div className="pb-32 min-h-screen bg-backgroundSecondary">
      {/* Header */}
      <div className="bg-white p-6 sticky top-0 z-10 shadow-sm">
         {/* Search */}
         <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#E5F5EC] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-textPrimary placeholder:text-slate-400"
            />
         </div>

         {/* Category Tabs */}
         <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Recess', 'Lunch'].map(cat => (
               <button 
                 key={cat}
                 onClick={() => setSelectedCategory(cat.toLowerCase())}
                 className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.toLowerCase() 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 text-slate-500'
                 }`}
               >
                 {cat}
               </button>
            ))}
         </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center px-6 py-4">
         <div className="text-primary font-bold text-sm">Sort By Popular</div>
         <div className="flex bg-slate-200 rounded-lg p-1">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
             >
                <Grid size={18} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
             >
                <ListIcon size={18} />
             </button>
         </div>
      </div>

      {/* Content */}
      <div className="px-6">
         <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
            {filteredMenu.map((item) => (
                <div 
                   key={item.id} 
                   onClick={() => { setSelectedItem(item); setItemQuantity(1); }}
                   className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 active:scale-95 transition-transform ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row gap-4 items-center'}`}
                >
                   <img 
                      src={item.image} 
                      alt={item.name} 
                      className={`${viewMode === 'grid' ? 'w-full h-[140px]' : 'w-[80px] h-[80px]'} object-cover rounded-xl bg-slate-100 ${viewMode === 'grid' ? 'mb-3' : ''}`} 
                   />
                   
                   <div className="flex-1 w-full">
                      <div className="font-bold text-textPrimary text-sm mb-1">{item.name}</div>
                      {viewMode === 'list' && <div className="text-xs text-textSecondary line-clamp-1 mb-2">{item.category}</div>}
                      
                      <div className="flex items-center gap-1 mb-2">
                         <div className="bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-green-600">4.5</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                         <div className="text-lg font-bold text-primary">₱{item.price}</div>
                         <div className={`flex items-center justify-center bg-primary text-white rounded-xl ${viewMode === 'grid' ? 'w-10 h-10' : 'w-12 h-12'}`}>
                            <Plus size={20} />
                         </div>
                      </div>
                   </div>
                </div>
            ))}
         </div>
      </div>

      {selectedItem && (
          <ItemDetailModal 
              item={selectedItem} 
              quantity={itemQuantity} 
              setQuantity={setItemQuantity} 
              onClose={() => setSelectedItem(null)} 
              onAdd={handleAddToCart}
          />
      )}
    </div>
  );
}