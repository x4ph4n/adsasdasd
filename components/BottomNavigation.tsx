import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Menu, Wallet, ShoppingCart, User, Grid, Package, CreditCard, Bell } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavigationProps {
  role: UserRole;
  cartItemCount?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ role, cartItemCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getItems = () => {
    if (role === UserRole.ADMIN) {
      return [
        { id: 'home', label: 'Home', icon: Grid, route: '/admin' },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, route: '/admin/orders' },
        { id: 'topup', label: 'Top-Up', icon: CreditCard, route: '/admin/topup' },
        { id: 'inventory', label: 'Inventory', icon: Package, route: '/admin/inventory' },
        { id: 'alerts', label: 'Alerts', icon: Bell, route: '/admin/notifications', badge: 3 },
        { id: 'profile', label: 'Profile', icon: User, route: '/admin/profile' },
      ];
    } else {
      // Student items
      return [
        { id: 'home', label: 'Home', icon: Home, route: '/student' },
        { id: 'menu', label: 'Menu', icon: Menu, route: '/student/menu' },
        { id: 'wallet', label: 'Wallet', icon: Wallet, route: '/student/wallet' },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, route: '/student/cart' },
        { id: 'profile', label: 'Profile', icon: User, route: '/student/profile' },
      ];
    }
  };

  const items = getItems();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
      <div className="bg-primary rounded-full shadow-2xl pointer-events-auto flex items-center p-2 gap-2 max-w-full overflow-x-auto no-scrollbar">
        {items.map((item) => {
          const isActive = location.pathname === item.route;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-full transition-all duration-300 ${
                isActive ? 'bg-white text-primary shadow-sm transform scale-105' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="relative -mt-1">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border-[1.5px] border-primary">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-bold mt-0.5 leading-none ${isActive ? 'text-primary' : 'text-white/90'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;