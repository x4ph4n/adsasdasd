import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { User as UserIcon, Mail, Lock, LogOut, Edit2, ChevronLeft, Shield, X, Save, Loader2, ChevronRight } from 'lucide-react';
import { Database } from '../services/db';

const EditProfileModal = ({ onClose }: { onClose: () => void }) => {
    const { user, refreshUser } = useAppContext();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await Database.updateUser(user.uid, { name });
            refreshUser({ ...user, name });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-textPrimary">Edit Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 mb-3"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default function Profile() {
  const { user, activeStudent, logout } = useAppContext();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const links = [
    { icon: UserIcon, label: 'Order History', color: '#22C55E', bg: '#E5F5EC', route: '/student/history' },
  ];

  return (
    <div className="min-h-screen bg-backgroundSecondary pb-32">
       {/* Header */}
       <div className="bg-primaryLight h-[200px] relative rounded-b-[32px] overflow-hidden">
          <div className="flex justify-between items-start p-6 pt-8">
             <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/30 transition">
                <ChevronLeft size={24} />
             </button>
             <h1 className="text-xl font-bold text-white mt-2">Profile</h1>
             <div className="w-10"></div> {/* Spacer for symmetry since Settings button is removed */}
          </div>

          {/* Avatar */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
             <div className="w-[120px] h-[120px] bg-primary rounded-[24px] border-[6px] border-backgroundSecondary flex items-center justify-center shadow-lg">
                <span className="text-white text-[48px] font-bold">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                </span>
             </div>
          </div>
       </div>

       {/* Content */}
       <div className="mt-[80px] px-6">
          {/* Info Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E5F5EC] rounded-xl flex items-center justify-center text-primary">
                   <UserIcon size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="text-xs text-textSecondary font-bold uppercase">Name</div>
                   <div className="font-bold text-textPrimary truncate">{user?.name}</div>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E5F5EC] rounded-xl flex items-center justify-center text-primary">
                   <Mail size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="text-xs text-textSecondary font-bold uppercase">Email</div>
                   <div className="font-bold text-textPrimary truncate">{user?.email}</div>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E5F5EC] rounded-xl flex items-center justify-center text-primary">
                   <Shield size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="text-xs text-textSecondary font-bold uppercase">Linked Card ID</div>
                   <div className="font-bold text-textPrimary truncate">{activeStudent?.rfid_uid || activeStudent?.walletId || 'Not Linked'}</div>
                </div>
             </div>
          </div>

          {/* Quick Links */}
          <h3 className="text-xs font-bold text-textSecondary mb-4 uppercase tracking-wider">Quick Links</h3>
          <div className="space-y-4 mb-8">
             {links.map((link, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate(link.route)}
                  className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-slate-50 transition"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: link.bg, color: link.color }}>
                         <link.icon size={20} />
                      </div>
                      <span className="font-bold text-textPrimary">{link.label}</span>
                   </div>
                   <ChevronRight size={20} className="text-slate-300" />
                </button>
             ))}
          </div>

          <div className="space-y-3">
             <button 
                onClick={() => setShowEditProfile(true)}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
             >
                <Edit2 size={20} /> Edit Profile
             </button>

             <button 
                onClick={logout}
                className="w-full bg-[#FEE2E2] text-danger font-bold py-4 rounded-xl hover:bg-red-200 transition flex items-center justify-center gap-2"
             >
                <LogOut size={20} /> Logout
             </button>
          </div>
       </div>
       
       {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </div>
  );
}
