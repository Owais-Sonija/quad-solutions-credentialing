import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Shield, User as UserIcon, Activity, Key, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const Profile = () => {
  const { user, token, login } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      setProfileData(res.data.user);
      setStats(res.data.stats);
      setEditForm({ name: res.data.user.name || '', phone: res.data.user.phone || '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.patch('/user/profile', editForm);
      setProfileData(res.data.user);
      if (user && token) {
        login({ ...user, name: res.data.user.name }, token);
      }
      showToast('Profile updated successfully', 'success');
      setIsEditMode(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) return { label: '', color: '' };
    if (password.length < 8) return { label: 'Weak', color: 'text-red-500' };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (hasUpper && hasNumber && password.length >= 8) return { label: 'Strong', color: 'text-green-500' };
    return { label: 'Medium', color: 'text-yellow-500' };
  };

  const currentStrength = calculatePasswordStrength(passForm.newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (!/[A-Z]/.test(passForm.newPassword) || !/[0-9]/.test(passForm.newPassword)) {
      showToast('Password must contain at least one uppercase letter and one number', 'error');
      return;
    }

    setSavingPass(true);
    try {
      await api.patch('/user/profile/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      showToast('Password changed successfully', 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar />
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">Failed to load profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 tracking-wider shadow-md">
                {getInitials(profileData.name)}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{profileData.name}</h2>
              <p className="text-sm text-slate-500 mb-3 truncate" title={profileData.email}>{profileData.email}</p>
              <div className="inline-flex items-center text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full mb-6 border border-slate-200">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Member since {formatDate(profileData.created_at)}
              </div>
              
              <button 
                onClick={() => {
                  if (isEditMode) {
                    setEditForm({ name: profileData.name || '', phone: profileData.phone || '' });
                  }
                  setIsEditMode(!isEditMode);
                }}
                className={`w-full py-2.5 px-4 rounded-md text-sm font-bold transition-colors ${isEditMode ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent'}`}
              >
                {isEditMode ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            {/* My Activity Card */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">My Activity</h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Total Requests</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{stats?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 flex items-center"><Clock className="w-4 h-4 mr-1.5 text-yellow-500"/> Pending</span>
                  <span className="font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">{stats?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 flex items-center"><Clock className="w-4 h-4 mr-1.5 text-blue-500"/> In Review</span>
                  <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{stats?.in_review || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1.5 text-green-500"/> Approved</span>
                  <span className="font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">{stats?.approved || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1.5 text-red-500"/> Rejected</span>
                  <span className="font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">{stats?.rejected || 0}</span>
                </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
                <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center">
                  View All Requests <span className="ml-1 text-lg mb-0.5">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Information Card */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
               <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
              </div>
              <div className="p-6">
                {!isEditMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Name</p>
                      <p className="text-base font-medium text-slate-900">{profileData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</p>
                      <p className="text-base font-medium text-slate-900">{profileData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</p>
                      <p className="text-base font-medium text-slate-900">{profileData.phone || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Requests</p>
                      <p className="text-base font-medium text-slate-900">{stats?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Member Since</p>
                      <p className="text-base font-medium text-slate-900">{formatDate(profileData.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Account Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-green-100 text-green-800 border border-green-200 mt-1">
                        Active
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          disabled
                          value={profileData.email}
                          className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md sm:text-sm font-medium cursor-not-allowed"
                        />
                        <p className="mt-1.5 text-xs font-medium text-slate-500">Email address cannot be modified</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 font-medium"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="pt-5 flex justify-end gap-3 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditForm({ name: profileData.name || '', phone: profileData.phone || '' });
                          setIsEditMode(false);
                        }}
                        className="px-5 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={savingProfile}
                        className="px-5 py-2 bg-blue-600 text-white border border-transparent rounded-md shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
               <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Current Password <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      required
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">New Password <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      required
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 font-medium"
                    />
                    {passForm.newPassword && (
                      <p className="mt-1.5 text-xs font-bold tracking-wide">Strength: <span className={currentStrength.color}>{currentStrength.label}</span></p>
                    )}
                    <p className="mt-1.5 text-xs font-medium text-slate-500">Min 8 characters, at least 1 uppercase and 1 number.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      required
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 font-medium"
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={savingPass || !passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword}
                      className="px-5 py-2.5 bg-blue-600 text-white border border-transparent rounded-md shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {savingPass ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
