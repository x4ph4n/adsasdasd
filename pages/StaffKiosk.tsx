import React, { useState, useEffect, useRef } from 'react';
import { Database } from '../services/db';
import { Order } from '../types';
import { Wifi, ScanLine, CheckCircle2, XCircle, RefreshCcw, UserPlus } from 'lucide-react';

export default function StaffKiosk() {
  const [mode, setMode] = useState<'claim' | 'register'>('claim');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Waiting for RFID...');
  
  // Claim Mode Data
  const [claimedOrder, setClaimedOrder] = useState<Order | null>(null);
  
  // Register Mode Data
  const [registrationEmail, setRegistrationEmail] = useState('');
  
  // Input
  const [rfidInput, setRfidInput] = useState('');
  
  useEffect(() => {
      setMessage(mode === 'claim' ? 'Waiting for RFID...' : 'Enter email & Scan Card');
      setRfidInput('');
      setStatus('idle');
  }, [mode]);

  const handleScan = async (uid: string) => {
    if (!uid) return;
    setStatus('processing');
    setMessage('Processing...');

    // Simulate hardware read delay
    setTimeout(async () => {
      if (mode === 'claim') {
          const result = await Database.scanRFID(uid);
          if (result.success && result.order) {
            setStatus('success');
            setMessage(result.message);
            setClaimedOrder(result.order);
          } else {
            setStatus('error');
            setMessage(result.message);
            setClaimedOrder(null);
          }
      } else {
          // Register Mode
          if (!registrationEmail) {
              setStatus('error');
              setMessage("Please enter an email first.");
          } else {
              const result = await Database.registerCard(registrationEmail, uid);
              if (result.success) {
                  setStatus('success');
                  setMessage(result.message);
                  setRegistrationEmail(''); // Clear logic
              } else {
                  setStatus('error');
                  setMessage(result.message);
              }
          }
      }
      
      // Reset after delay
      setTimeout(() => {
        setStatus('idle');
        setMessage(mode === 'claim' ? 'Waiting for RFID...' : 'Enter email & Scan Card');
        setClaimedOrder(null);
        setRfidInput('');
      }, 4000);
    }, 800);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(rfidInput);
  };

  return (
    <div className="max-w-2xl mx-auto h-[85vh] flex flex-col">
        {/* Status Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Kiosk Terminal #01</h1>
                <p className="text-slate-500">Recess / Lunch Redemption</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setMode(mode === 'claim' ? 'register' : 'claim')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                        mode === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                >
                    {mode === 'claim' ? <UserPlus size={16} /> : <ScanLine size={16} />}
                    {mode === 'claim' ? 'Register Card' : 'Back to Claims'}
                </button>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium">
                    <Wifi size={16} /> Online
                </div>
            </div>
        </div>

        {/* Register Email Input */}
        {mode === 'register' && (
            <div className="mb-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in slide-in-from-top duration-300">
                <label className="block text-xs font-bold text-indigo-800 mb-1 ml-1 uppercase">Student Email</label>
                <input 
                    type="email" 
                    value={registrationEmail}
                    onChange={(e) => setRegistrationEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900 placeholder-indigo-300 font-medium"
                    autoFocus
                />
                <p className="text-xs text-indigo-400 mt-2 ml-1">Type email, then scan the card below.</p>
            </div>
        )}

        {/* Main Display Area */}
        <div className={`flex-1 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 shadow-xl overflow-hidden relative ${
            status === 'idle' ? (mode === 'register' ? 'bg-indigo-900 text-white' : 'bg-slate-900 text-white') :
            status === 'processing' ? 'bg-blue-600 text-white' :
            status === 'success' ? 'bg-emerald-500 text-white' :
            'bg-red-500 text-white'
        }`}>
            
            <div className="mb-6 transform scale-150 relative z-10">
                {status === 'idle' && <ScanLine size={48} className="animate-pulse" />}
                {status === 'processing' && <RefreshCcw size={48} className="animate-spin" />}
                {status === 'success' && <CheckCircle2 size={64} />}
                {status === 'error' && <XCircle size={64} />}
            </div>

            <h2 className="text-3xl font-bold mb-2 relative z-10">{message}</h2>
            
            {status === 'idle' && (
                <p className="text-slate-400 relative z-10">
                    {mode === 'claim' ? 'Tap student ID card on the reader' : 'Tap card to link to entered email'}
                </p>
            )}

            {/* Success Order Details */}
            {status === 'success' && claimedOrder && mode === 'claim' && (
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md text-left border border-white/20 animate-in slide-in-from-bottom duration-500">
                    <div className="text-emerald-100 text-sm mb-1">Student</div>
                    <div className="font-bold text-xl mb-4">{claimedOrder.userName}</div>
                    
                    <div className="space-y-2 mb-4">
                        {claimedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-white/10 pb-1">
                                <span>{item.quantity}x {item.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-right text-2xl font-bold">
                        TOTAL: ₱{claimedOrder.totalAmount}
                    </div>
                </div>
            )}

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>
        </div>

        {/* Manual Input (For Demo Purposes) */}
        <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Hardware Simulator</h3>
            <form onSubmit={handleManualSubmit} className="flex gap-4">
                <input 
                    type="text" 
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="Enter RFID UID"
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
                <button 
                    type="submit"
                    disabled={status !== 'idle'}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition"
                >
                    Simulate Scan
                </button>
            </form>
        </div>
    </div>
  );
}