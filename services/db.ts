import { db, storage } from './firebaseConfig';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, runTransaction, orderBy, addDoc, increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, UserRole, Product, Order, MealType, CartItem, Transaction } from '../types';

export const Database = {
  // --- Wallet & Top-Up ---

  /**
   * Helper to generate sequential Wallet ID (e.g., 0001)
   */
  assignWalletId: async (transaction: any): Promise<string> => {
    const counterRef = doc(db, 'counters', 'users');
    const counterDoc = await transaction.get(counterRef);
    
    let nextId = 1;
    if (counterDoc.exists()) {
      nextId = counterDoc.data().count + 1;
    }
    
    transaction.set(counterRef, { count: nextId }, { merge: true });
    return nextId.toString().padStart(4, '0');
  },

  /**
   * Request a Top-Up (Creates a pending transaction)
   */
  requestTopUp: async (userId: string, amount: number, userName: string, walletId?: string): Promise<boolean> => {
    try {
      await addDoc(collection(db, 'transactions'), {
        userId,
        userName,
        userWalletId: walletId || 'N/A',
        type: 'topup',
        amount,
        status: 'pending',
        timestamp: Date.now(),
        description: 'Wallet Top-Up Request'
      });
      return true;
    } catch (error) {
      console.error("Top-up request failed:", error);
      return false;
    }
  },

  /**
   * Get transactions for a user
   */
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  },

  /**
   * Get pending top-ups for Admin
   */
  getPendingTopUps: async (): Promise<Transaction[]> => {
    try {
      const q = query(collection(db, 'transactions'), where('type', '==', 'topup'), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error("Error fetching pending top-ups:", error);
      return [];
    }
  },

  /**
   * Approve Top-Up
   */
  approveTopUp: async (transactionId: string): Promise<boolean> => {
    try {
      await runTransaction(db, async (transaction) => {
        const txnRef = doc(db, 'transactions', transactionId);
        const txnDoc = await transaction.get(txnRef);

        if (!txnDoc.exists()) throw new Error("Transaction not found");
        const txnData = txnDoc.data();

        if (txnData.status !== 'pending') throw new Error("Transaction already processed");

        const userRef = doc(db, 'users', txnData.userId);
        
        // Update User Balance
        transaction.update(userRef, {
          walletBalance: increment(txnData.amount)
        });

        // Update Transaction Status
        transaction.update(txnRef, {
          status: 'approved',
          approvedAt: Date.now()
        });
      });
      return true;
    } catch (error) {
      console.error("Error approving top-up:", error);
      return false;
    }
  },

  /**
   * Decline Top-Up
   */
  declineTopUp: async (transactionId: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'declined',
        approvedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error("Error declining top-up:", error);
      return false;
    }
  },

  // --- Users ---

  getUser: async (uid: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) return userSnap.data() as User;
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  getUsers: async (uids: string[]): Promise<User[]> => {
    try {
      if (!uids || uids.length === 0) return [];
      const q = query(collection(db, 'users'), where('uid', 'in', uids));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error("Error fetching linked users:", error);
      return [];
    }
  },

  subscribeToUser: (uid: string, callback: (user: User | null) => void): (() => void) => {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as User);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Error subscribing to user:", error);
      callback(null);
    });
  },

  /**
   * Modified registerUser to assign Wallet ID
   */
  registerUser: async (user: User): Promise<void> => {
    try {
      // walletId will be assigned when card is registered
      await setDoc(doc(db, 'users', user.uid), user);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  updateUser: async (uid: string, data: Partial<User>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  findUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email)); // Removed role filter to allow Staff linking
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data() as User;
      return null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },

  registerCard: async (email: string, rfid: string): Promise<{ success: boolean; message: string }> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return { success: false, message: 'User not found.' };

      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { 
        rfid_uid: rfid,
        walletId: rfid // Set walletId to be the same as RFID UID
      });

      return { success: true, message: `Card linked to ${userDoc.data().name}!` };
    } catch (error) {
      console.error("Error registering card:", error);
      return { success: false, message: "System error." };
    }
  },

  // --- Products & Orders ---

  uploadProductImage: async (file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  getMenu: async (): Promise<Product[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error("Error fetching menu:", error);
      return [];
    }
  },

  addProduct: async (productData: Omit<Product, 'id'>, imageFile?: File): Promise<void> => {
    try {
      let imageUrl = productData.image;
      if (imageFile) imageUrl = await Database.uploadProductImage(imageFile);
      await addDoc(collection(db, 'products'), { ...productData, image: imageUrl });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>, imageFile?: File): Promise<void> => {
    try {
      let imageUrl = productData.image;
      if (imageFile) imageUrl = await Database.uploadProductImage(imageFile);
      
      const updateData = { ...productData };
      if (imageUrl) updateData.image = imageUrl;

      await updateDoc(doc(db, 'products', id), updateData);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'products', id));
  },

  placeOrder: async (user: User, items: CartItem[], total: number, mealType: MealType): Promise<boolean> => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) throw new Error("User does not exist!");
        
        const currentBalance = userDoc.data().walletBalance;
        if (currentBalance < total) throw new Error("Insufficient funds!");

        transaction.update(userRef, { walletBalance: currentBalance - total });

        const newOrderRef = doc(collection(db, 'orders'));
        const newOrder: Order = {
          id: newOrderRef.id,
          userId: user.uid,
          userName: user.name,
          items,
          totalAmount: total,
          status: 'pending',
          orderTime: Date.now(),
          mealType,
          claimCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        transaction.set(newOrderRef, newOrder);

        const newTxnRef = doc(collection(db, 'transactions'));
        transaction.set(newTxnRef, {
          userId: user.uid,
          type: 'debit',
          amount: total,
          description: `Order for ${items.length} items`,
          timestamp: Date.now()
        });
      });
      return true;
    } catch (error) {
      console.error("Order failed:", error);
      return false;
    }
  },

  getOrders: async (userId?: string): Promise<Order[]> => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('orderTime', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Order);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  getAllOrders: async (): Promise<Order[]> => {
    try {
      const q = query(collection(db, 'orders'), orderBy('orderTime', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Order);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  },

  updateOrderStatus: async (orderId: string, status: 'pending' | 'claimed' | 'cancelled' | 'ready'): Promise<void> => {
     await updateDoc(doc(db, 'orders', orderId), { status });
  },

  scanRFID: async (rfid: string): Promise<{ success: boolean; message: string; order?: Order }> => {
    try {
      const usersQ = query(collection(db, 'users'), where('rfid_uid', '==', rfid));
      const userSnapshot = await getDocs(usersQ);

      if (userSnapshot.empty) return { success: false, message: 'Card not registered.' };
      const user = userSnapshot.docs[0].data() as User;

      const ordersQ = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid), 
        where('status', '==', 'pending') // Or 'ready'
      );
      const ordersSnapshot = await getDocs(ordersQ);

      if (ordersSnapshot.empty) return { success: false, message: `No pending orders for ${user.name}.` };

      const orderDoc = ordersSnapshot.docs[0];
      const orderData = orderDoc.data() as Order;

      await updateDoc(doc(db, 'orders', orderDoc.id), { status: 'claimed' });

      return { success: true, message: `Order claimed for ${user.name}!`, order: { ...orderData, status: 'claimed' } };
    } catch (error) {
      console.error("RFID Scan error:", error);
      return { success: false, message: "System error during scan." };
    }
  },
  
  /**
   * Real Sales Data Aggregation
   * Aggregates by day of week based on timestamp
   */
  getSalesData: async () => {
    try {
      // Fetch all 'ready' or 'claimed' orders (completed sales)
      // Note: For large datasets, this should be a scheduled cloud function updating a stats document.
      // For this size, client-side aggregation is acceptable.
      const q = query(collection(db, 'orders'), where('status', 'in', ['ready', 'claimed']));
      const snapshot = await getDocs(q);
      
      const salesByDay: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      snapshot.docs.forEach(doc => {
        const data = doc.data() as Order;
        const date = new Date(data.orderTime);
        const dayName = days[date.getDay()];
        if (salesByDay[dayName] !== undefined) {
          salesByDay[dayName] += data.totalAmount;
        }
      });

      return Object.keys(salesByDay).map(day => ({ name: day, sales: salesByDay[day] }));
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }
  }
};