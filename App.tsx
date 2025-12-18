import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, CartItem } from './types';
import { auth, googleProvider } from './services/firebaseConfig';
import { Database } from './services/db';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2, User as UserIcon, LogOut, Utensils, Monitor, ShieldCheck, Building, Mail, Lock, Info, KeyRound, GraduationCap, Users, UserCog, Briefcase, ScanLine } from 'lucide-react';
import { GRADE_LEVELS, isRestrictedStudent } from './config/gradeLevels';

// Pages
import StudentDashboard from './pages/StudentDashboard';
import StaffKiosk from './pages/StaffKiosk';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

// New Pages
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import History from './pages/History';
import AdminOrders from './pages/admin/Orders';
import AdminTopUp from './pages/admin/TopUp';
import AdminInventory from './pages/admin/Inventory';
import AdminProfile from './pages/admin/AdminProfile';
import Analytics from './pages/admin/Analytics';
import Notifications from './pages/admin/Notifications';

import BottomNavigation from './components/BottomNavigation';

// Context
interface AppContextType {
  user: User | null | undefined;
  authUser: FirebaseUser | null;
  loadingAuth: boolean;
  loginEmail: (e: string, p: string) => Promise<void>;
  registerUserAndProfile: (e: string, p: string, data: any) => Promise<void>;
  registerEmail: (e: string, p: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  removeMultipleFromCart: (ids: string[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  refreshUser: (user: User) => void;
  activeStudent: User | null;
  linkedStudents: User[];
  switchStudent: (studentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

const LoginScreen = () => {
  const { loginEmail, registerUserAndProfile, loginGoogle, loadingAuth } = useAppContext();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.STUDENT);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState('');
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[0].value);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegistering) {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!fullName) {
            setError("Please enter your full name.");
            return;
        }
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        const profileData = {
            name: fullName,
            role: activeTab,
            gradeLevel: activeTab === UserRole.STUDENT ? gradeLevel : undefined,
            section: activeTab === UserRole.STUDENT ? section : undefined,
            walletBalance: 0
        };
        await registerUserAndProfile(email, password, profileData);
      } else {
        await loginEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
      setError('');
      try {
          await loginGoogle();
      } catch (err: any) {
          setError("Google login failed.");
          console.error(err);
      }
  }

  const TabButton = ({ role, icon: Icon, label }: { role: UserRole, icon: any, label: string }) => (
      <button 
          type="button"
          onClick={() => setActiveTab(role)}
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border-2 ${
              activeTab === role 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
              : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
          }`}
      >
          <Icon size={20} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
        
        <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg">
                <Building size={28} />
            </div>
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Smart Canteen</h1>
            <h2 className="text-xl font-bold text-slate-800">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
        </div>

        {/* Role Tabs */}
        {isRegistering && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <TabButton role={UserRole.STUDENT} icon={GraduationCap} label="Student" />
                <TabButton role={UserRole.PARENT} icon={Users} label="Parent" />
                <TabButton role={UserRole.STAFF} icon={ScanLine} label="Staff" />
                <TabButton role={UserRole.ADMIN} icon={UserCog} label="Admin" />
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Juan Dela Cruz"
                                className="w-full bg-slate-100 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {activeTab === UserRole.STUDENT && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Grade</label>
                                <select 
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition appearance-none"
                                >
                                    {GRADE_LEVELS.map(g => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Section</label>
                                <input 
                                    type="text" 
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    placeholder="e.g. A"
                                    className="w-full bg-slate-100 border-none rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@school.edu"
                        className="w-full bg-slate-100 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-100 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        required
                    />
                </div>
            </div>

            {isRegistering && (
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-100 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            required
                        />
                    </div>
                </div>
            )}

            {error && <div className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</div>}

            <button 
                type="submit"
                disabled={isSubmitting || loadingAuth}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Create Account' : 'Log In')}
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                {isRegistering ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setEmail('');
                    setPassword('');
                }}
                className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition"
            >
                {isRegistering ? "Already have an account? Log In" : "Don't have an account? Register"}
            </button>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, cart, logout } = useAppContext();
  const navigate = useNavigate();

  // Show default header for Staff or Parent (if we haven't redesigned them yet)
  // For Admin and Student, we use the new design which has screen-specific headers or custom headers
  const showDefaultHeader = user?.role === UserRole.STAFF || user?.role === UserRole.PARENT;

  return (
    <div className="min-h-screen flex flex-col bg-backgroundSecondary pb-24">
      {showDefaultHeader && (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                <Utensils size={18} />
                </div>
                <span className="font-bold text-slate-800 hidden sm:block">SmartCanteen</span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role}</div>
                </div>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition">
                <LogOut size={20} />
                </button>
            </div>
            </div>
        </header>
      )}
      <main className={`flex-1 w-full ${showDefaultHeader ? 'max-w-5xl mx-auto p-4' : ''}`}>
        {children}
      </main>

      {user && (user.role === UserRole.STUDENT || user.role === UserRole.ADMIN) && (
          <BottomNavigation role={user.role} cartItemCount={cart.reduce((acc, i) => acc + i.quantity, 0)} />
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Parent/Student Context
  const [linkedStudents, setLinkedStudents] = useState<User[]>([]);
  const [activeStudent, setActiveStudent] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Unsubscribe from previous listener if any
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = undefined;
      }

      if (firebaseUser) {
        setAuthUser(firebaseUser);
        
        try {
            // 1. Initial One-Time Fetch
            let dbUser = await Database.getUser(firebaseUser.uid);
            
            // Auto-Register Google User if missing
            if (!dbUser) {
                const newUser: User = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email || undefined,
                    role: UserRole.STUDENT, // Default to Student
                    walletBalance: 0,
                    gradeLevel: 'Grade 7', // Default
                    section: 'A' // Default
                };
                await Database.registerUser(newUser);
                dbUser = newUser;
            }

            setUser(dbUser); // Will be User or null
            
            // Handle Initial Parent Logic
            if (dbUser && dbUser.role === UserRole.PARENT && dbUser.linkedStudentIds && dbUser.linkedStudentIds.length > 0) {
                const students = await Database.getUsers(dbUser.linkedStudentIds);
                setLinkedStudents(students);
                if (students.length > 0) setActiveStudent(students[0]);
            } else if (dbUser) {
                setActiveStudent(dbUser);
                setLinkedStudents([]);
            }

            // 2. Set up Real-time Subscription
            unsubscribeUser = Database.subscribeToUser(firebaseUser.uid, async (updatedUser) => {
                setUser(updatedUser);
                
                if (updatedUser && updatedUser.role === UserRole.PARENT && updatedUser.linkedStudentIds && updatedUser.linkedStudentIds.length > 0) {
                    try {
                        const students = await Database.getUsers(updatedUser.linkedStudentIds);
                        setLinkedStudents(students);
                        setActiveStudent(prev => {
                            if (prev && students.find(s => s.uid === prev.uid)) return students.find(s => s.uid === prev.uid) || students[0];
                            return students[0];
                        });
                    } catch (e) {
                        console.error("Error fetching linked students", e);
                    }
                } else if (updatedUser) {
                    setActiveStudent(updatedUser);
                    setLinkedStudents([]);
                }
            });

        } catch (e) {
            console.error("Auth fetch error", e);
            setUser(null);
        }
        
        setTimeout(() => {
            setLoadingAuth(false);
        }, 1000);

      } else {
        setAuthUser(null);
        setUser(null);
        setActiveStudent(null);
        setLinkedStudents([]);
        setLoadingAuth(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };
  
  // Updated: Creates Auth User AND Profile in one go
  const registerUserAndProfile = async (email: string, pass: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        ...profileData
    };
    await Database.registerUser(newUser);
    setUser(newUser); // Set immediately to avoid flash or delay
  };

  const registerEmail = async (email: string, pass: string) => {
      // Fallback
      await createUserWithEmailAndPassword(auth, email, pass);
  }

  const loginGoogle = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const logout = () => {
    signOut(auth);
    setCart([]);
    setLinkedStudents([]);
    setActiveStudent(null);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const removeMultipleFromCart = (ids: string[]) => {
    setCart(prev => prev.filter(i => !ids.includes(i.id)));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i));
  };

  const clearCart = () => setCart([]);

  const switchStudent = (studentId: string) => {
      const student = linkedStudents.find(s => s.uid === studentId);
      if (student) setActiveStudent(student);
  };

  const refreshUser = (newUser: User) => {
      setUser(newUser);
      if (activeStudent && activeStudent.uid === newUser.uid) {
          setActiveStudent(newUser);
      }
  }

  if (loadingAuth) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      )
  }

  return (
    <AppContext.Provider value={{ 
        user, authUser, loadingAuth, loginEmail, registerEmail, registerUserAndProfile, loginGoogle, logout, 
        cart, addToCart, removeFromCart, removeMultipleFromCart, updateQuantity, clearCart, refreshUser,
        activeStudent, linkedStudents, switchStudent
    }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            !authUser ? <LoginScreen /> : 
            user === undefined ? (
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <Loader2 className="animate-spin text-emerald-600" size={32} />
              </div>
            ) :
            user === null ? <LoginScreen /> : // If Google login failed to create profile (rare), show Login
            user.role === UserRole.STAFF ? <Navigate to="/kiosk" /> :
            user.role === UserRole.ADMIN ? <Navigate to="/admin" /> :
            <Navigate to="/student" />
          } />

          {/* Fallback route - now less critical due to auto-registration */}
          <Route path="/register" element={
            authUser && user === null ? (
                <Register 
                    authUser={{ uid: authUser.uid, email: authUser.email, displayName: authUser.displayName }} 
                    onRegisterSuccess={refreshUser} 
                />
            ) : (
                <Navigate to="/" />
            )
          } />
          
          <Route path="/student" element={
            user ? <Layout><StudentDashboard /></Layout> : <Navigate to="/" />
          } />
          
          <Route path="/student/menu" element={
            user ? <Layout><Menu /></Layout> : <Navigate to="/" />
          } />
          
           <Route path="/student/cart" element={
            user ? <Layout><Cart /></Layout> : <Navigate to="/" />
          } />

          <Route path="/student/checkout" element={
            user ? <Layout><Checkout /></Layout> : <Navigate to="/" />
          } />

          <Route path="/student/history" element={
            user ? <Layout><History /></Layout> : <Navigate to="/" />
          } />
          
           <Route path="/student/profile" element={
            user ? <Layout><Profile /></Layout> : <Navigate to="/" />
          } />
          
           <Route path="/student/wallet" element={
            user ? <Layout><Wallet /></Layout> : <Navigate to="/" />
          } />

          <Route path="/kiosk" element={
            user && user.role === UserRole.STAFF ? <Layout><StaffKiosk /></Layout> : <Navigate to="/" />
          } />
          
                     <Route path="/admin" element={
                      user && user.role === UserRole.ADMIN ? <Layout><AdminDashboard /></Layout> : <Navigate to="/" />
                    } />
          
                    <Route path="/admin/analytics" element={
                      user && user.role === UserRole.ADMIN ? <Layout><Analytics /></Layout> : <Navigate to="/" />
                    } />
          
                     <Route path="/admin/orders" element={            user && user.role === UserRole.ADMIN ? <Layout><AdminOrders /></Layout> : <Navigate to="/" />
          } />

           <Route path="/admin/topup" element={
            user && user.role === UserRole.ADMIN ? <Layout><AdminTopUp /></Layout> : <Navigate to="/" />
          } />

           <Route path="/admin/inventory" element={
            user && user.role === UserRole.ADMIN ? <Layout><AdminInventory /></Layout> : <Navigate to="/" />
          } />

          <Route path="/admin/notifications" element={
            user && user.role === UserRole.ADMIN ? <Layout><Notifications /></Layout> : <Navigate to="/" />
          } />

           <Route path="/admin/profile" element={
            user && user.role === UserRole.ADMIN ? <Layout><AdminProfile /></Layout> : <Navigate to="/" />
          } />

        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}