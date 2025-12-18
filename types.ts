export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY'
}

export enum MealType {
  RECESS = 'RECESS',
  LUNCH = 'LUNCH'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  uid: string;
  name: string;
  email?: string;
  role: UserRole;
  rfid_uid?: string;
  walletBalance: number;
  gradeLevel?: string; // For students
  section?: string; // For students
  walletId?: string; // Sequential ID e.g., 0001
  linkedStudentIds?: string[]; // For parents
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'claimed' | 'cancelled' | 'ready';
  orderTime: number; // Timestamp
  mealType: MealType;
  claimCode: string; // generated code (visual backup to RFID)
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string; // Denormalized for Admin
  userWalletId?: string; // Denormalized for Admin
  type: 'debit' | 'credit' | 'topup';
  amount: number;
  description: string;
  timestamp: number;
  status?: 'pending' | 'approved' | 'declined'; // For top-ups
  approvedAt?: number;
}