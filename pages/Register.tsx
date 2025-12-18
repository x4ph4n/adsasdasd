import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Database } from '../services/db';
import { GRADE_LEVELS, isRestrictedStudent } from '../config/gradeLevels';
import { User as UserIcon, GraduationCap, Users, Plus, X, Loader2, Search, AlertTriangle, Briefcase, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  authUser: { uid: string; email: string | null; displayName: string | null };
  onRegisterSuccess: (user: User) => void;
}

export default function Register({ authUser, onRegisterSuccess }: RegisterProps) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common Form State
  const [fullName, setFullName] = useState(authUser.displayName || '');

  // Student Form State
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[0].value);
  const [section, setSection] = useState('');

  // Parent Form State
  const [studentEmail, setStudentEmail] = useState('');
  const [linkedStudents, setLinkedStudents] = useState<User[]>([]);
  const [searchingStudent, setSearchingStudent] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!role) return;
    if (!fullName) {
        setError("Please enter your full name.");
        return;
    }
    
    setLoading(true);
    setError('');

    try {
      const newUser: User = {
        uid: authUser.uid,
        name: fullName,
        email: authUser.email || undefined,
        role: role,
        walletBalance: 0,
      };

      if (role === UserRole.STUDENT) {
        newUser.gradeLevel = gradeLevel;
        newUser.section = section;
      } else if (role === UserRole.FACULTY) {
        newUser.gradeLevel = 'Faculty';
      }

      if (role === UserRole.PARENT) {
        newUser.linkedStudentIds = linkedStudents.map(s => s.uid);
      }

      // Sanitize undefined values for Firestore
      const sanitizedUser = JSON.parse(JSON.stringify(newUser));

      await Database.registerUser(sanitizedUser);
      onRegisterSuccess(newUser);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentEmail) return;
    setSearchingStudent(true);
    setError('');

    try {
      const student = await Database.findUserByEmail(studentEmail);
      if (student) {
        if (linkedStudents.some(s => s.uid === student.uid)) {
            setError("Student already added.");
        } else {
            setLinkedStudents([...linkedStudents, student]);
            setStudentEmail('');
        }
      } else {
        setError("Student not found. Ensure they are registered first.");
      }
    } catch (err) {
      setError("Error finding student.");
    } finally {
      setSearchingStudent(false);
    }
  };

  const removeStudent = (uid: string) => {
    setLinkedStudents(linkedStudents.filter(s => s.uid !== uid));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Complete Your Profile</h1>
            <p className="text-slate-500">Tell us how you'll use the canteen app</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-center justify-center">
                {error}
            </div>
        )}

        {!role ? (
            <div className="grid gap-4">
                <button 
                    onClick={() => setRole(UserRole.STUDENT)}
                    className="p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center gap-4 text-left group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition">
                        <GraduationCap className="text-slate-600 group-hover:text-emerald-700" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">I am a Student</h3>
                        <p className="text-sm text-slate-500">I want to buy food for myself</p>
                    </div>
                </button>

                <button 
                    onClick={() => setRole(UserRole.FACULTY)}
                    className="p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4 text-left group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
                        <Briefcase className="text-slate-600 group-hover:text-purple-700" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">I am Faculty</h3>
                        <p className="text-sm text-slate-500">I am a teacher or staff member</p>
                    </div>
                </button>

                <button 
                    onClick={() => setRole(UserRole.PARENT)}
                    className="p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 text-left group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                        <Users className="text-slate-600 group-hover:text-blue-700" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">I am a Parent</h3>
                        <p className="text-sm text-slate-500">I want to manage my child's meals</p>
                    </div>
                </button>

                <button 
                    onClick={() => setRole(UserRole.STAFF)}
                    className="p-6 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition flex items-center gap-4 text-left group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition">
                        <ScanLine className="text-slate-600 group-hover:text-orange-700" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">I am Canteen Staff</h3>
                        <p className="text-sm text-slate-500">I manage orders and the kiosk</p>
                    </div>
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <button onClick={() => setRole(null)} className="hover:text-slate-800 hover:underline">Change Role</button>
                    <span>&bull;</span>
                    <span className="font-bold text-emerald-600">{role}</span>
                </div>

                {/* Common Fields */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Juan Dela Cruz"
                            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {role === UserRole.STUDENT && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Grade Level</label>
                                <select 
                                    value={gradeLevel} 
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {GRADE_LEVELS.map(g => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Section / Course</label>
                                <input 
                                    type="text" 
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    placeholder="e.g. STEM A"
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        
                        {isRestrictedStudent(gradeLevel) && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                                <div className="text-xs text-amber-700">
                                    <span className="font-bold">Parent Account Required</span>
                                    <p className="mt-1">Students in this grade level cannot order directly. Please ask your parent to create an account and link your profile to manage your meals.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {role === UserRole.FACULTY && (
                    <div className="p-4 bg-purple-50 rounded-xl text-purple-800 text-sm">
                        <p>Welcome, Faculty Member! Your account will be set up for personal ordering.</p>
                    </div>
                )}

                {role === UserRole.STAFF && (
                    <div className="p-4 bg-orange-50 rounded-xl text-orange-800 text-sm">
                        <p>Welcome, Canteen Staff! You will have access to the Kiosk for scanning IDs and managing claims.</p>
                    </div>
                )}

                {role === UserRole.PARENT && (
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">Link Students</label>
                        <p className="text-xs text-slate-500 -mt-1">Enter your child's registered email address to link them.</p>
                        
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="email" 
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    placeholder="student@school.edu"
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <button 
                                onClick={handleAddStudent}
                                disabled={searchingStudent || !studentEmail}
                                className="bg-emerald-600 text-white rounded-xl px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 flex items-center"
                            >
                                {searchingStudent ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                            </button>
                        </div>

                        {linkedStudents.length > 0 && (
                            <div className="space-y-2">
                                {linkedStudents.map(student => (
                                    <div key={student.uid} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800">{student.name}</div>
                                                <div className="text-xs text-slate-500">{student.gradeLevel}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeStudent(student.uid)} className="text-slate-400 hover:text-red-500">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button 
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}