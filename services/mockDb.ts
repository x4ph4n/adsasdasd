import { User, UserRole, Product, Order, Transaction, MealType } from '../types';

// --- Mock Data ---

const MOCK_USERS: User[] = [
  {
    uid: 'student1',
    name: 'Alex Rivera',
    role: UserRole.STUDENT,
    rfid_uid: '12345678', // The magic RFID number for testing
    walletBalance: 250.00,
    gradeLevel: 'Grade 10'
  },
  {
    uid: 'parent1',
    name: 'Mrs. Santos',
    role: UserRole.PARENT,
    walletBalance: 500.00
  },
  {
    uid: 'staff1',
    name: 'Canteen Manager',
    role: UserRole.STAFF,
    walletBalance: 0
  },
  {
    uid: 'admin1',
    name: 'System Admin',
    role: UserRole.ADMIN,
    walletBalance: 0
  }
];

const MOCK_MENU: Product[] = [
  { id: 'p1', name: 'Chicken Teriyaki Rice', price: 85, category: 'Rice Meals', image: 'https://picsum.photos/200/200?random=1', calories: 450, available: true, stock: 50 },
  { id: 'p2', name: 'Spaghetti Bolognese', price: 60, category: 'Pasta', image: 'https://picsum.photos/200/200?random=2', calories: 380, available: true, stock: 40 },
  { id: 'p3', name: 'Ham & Cheese Sandwich', price: 45, category: 'Snacks', image: 'https://picsum.photos/200/200?random=3', calories: 220, available: true, stock: 100 },
  { id: 'p4', name: 'Fresh Orange Juice', price: 35, category: 'Drinks', image: 'https://picsum.photos/200/200?random=4', calories: 120, available: true, stock: 80 },
  { id: 'p5', name: 'Chocolate Chip Cookie', price: 20, category: 'Dessert', image: 'https://picsum.photos/200/200?random=5', calories: 180, available: true, stock: 60 },
];

// --- In-Memory State ---
let orders: Order[] = [];
let transactions: Transaction[] = [];

// --- Service Methods ---

export const MockAuth = {
  login: async (role: UserRole): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
        resolve(user);
      }, 500);
    });
  }
};

export const MockDatabase = {
  getMenu: async (): Promise<Product[]> => {
    return Promise.resolve(MOCK_MENU);
  },

  getUser: async (uid: string): Promise<User | undefined> => {
    return MOCK_USERS.find(u => u.uid === uid);
  },

  placeOrder: async (user: User, items: any[], total: number, mealType: MealType): Promise<boolean> => {
    if (user.walletBalance < total) return false;

    // Deduct balance (In a real app, use transactions)
    const userIndex = MOCK_USERS.findIndex(u => u.uid === user.uid);
    if (userIndex >= 0) {
      MOCK_USERS[userIndex].walletBalance -= total;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.uid,
      userName: user.name,
      items,
      totalAmount: total,
      status: 'pending',
      orderTime: Date.now(),
      mealType,
      claimCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    orders.push(newOrder);
    
    // Add transaction record
    transactions.push({
      id: `txn-${Date.now()}`,
      type: 'debit',
      amount: total,
      description: `Order for ${items.length} items`,
      timestamp: Date.now()
    });

    return true;
  },

  getOrders: async (userId?: string): Promise<Order[]> => {
    if (userId) {
      return orders.filter(o => o.userId === userId).sort((a, b) => b.orderTime - a.orderTime);
    }
    return orders; // Admin/Staff sees all
  },

  scanRFID: async (rfid: string): Promise<{ success: boolean; message: string; order?: Order }> => {
    // 1. Find user by RFID
    const user = MOCK_USERS.find(u => u.rfid_uid === rfid);
    if (!user) {
      return { success: false, message: 'Card not registered.' };
    }

    // 2. Find pending orders for this user
    const pendingOrder = orders.find(o => o.userId === user.uid && o.status === 'pending');

    if (!pendingOrder) {
      return { success: false, message: `No pending orders for ${user.name}.` };
    }

    // 3. Mark as claimed
    pendingOrder.status = 'claimed';
    return { success: true, message: `Order claimed for ${user.name}!`, order: pendingOrder };
  },
  
  // For admin charts
  getSalesData: async () => {
    return [
      { name: 'Mon', sales: 4000 },
      { name: 'Tue', sales: 3000 },
      { name: 'Wed', sales: 2000 },
      { name: 'Thu', sales: 2780 },
      { name: 'Fri', sales: 1890 },
    ];
  }
};