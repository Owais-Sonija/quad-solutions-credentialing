import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/constants';
import { Search, User as UserIcon, X, Activity, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Users');
  
  const { toasts, showToast, hideToast } = useToast();

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const res = await api.get(`/admin/users?search=${value}`);
      setUsers(res.data);
    } catch (err: any) {
      showToast('Error searching users', 'error');
    }
  };

  const openUserModal = async (userId: string | number) => {
    setActiveUserId(userId);
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      console.log('User detail response:', res.data);
      const data = res.data;
      setSelectedUser(data.user ?? null);
      setUserRequests(data.requests ?? []);
      setUserStats(data.stats ?? {
        total: 0, pending: 0, 
        in_review: 0, approved: 0, rejected: 0
      });
    } catch (err: any) {
      setModalError('Failed to load user details. Please try again.');
      setSelectedUser(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setActiveUserId(null);
    setSelectedUser(null);
    setUserRequests([]);
    setUserStats(null);
    setModalError(null);
  };

  // Derived filtered users
  const displayedUsers = users.filter((u) => {
    if (filterType === 'Has Requests') return parseInt(u.total_requests) > 0;
    if (filterType === 'No Requests') return parseInt(u.total_requests) === 0;
    return true; // 'All Users'
  });

  // Calculate top stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => parseInt(u.total_requests) > 0).length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = users.filter(u => {
    const d = new Date(u.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <ToastContainer toasts={toasts} onClose={hideToast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage all registered healthcare providers</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
               <UserIcon className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
            <div className="rounded-full bg-emerald-100 p-3 mr-4">
               <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active (with requests)</p>
              <p className="text-2xl font-bold text-slate-900">{activeUsers}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
               <UserIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New This Month</p>
              <p className="text-2xl font-bold text-slate-900">{newThisMonth}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-900 focus:border-blue-900"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-md">
              {['All Users', 'Has Requests', 'No Requests'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === type ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <LoadingSpinner message="Loading providers..." />
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No users registered yet</h3>
                <p className="text-slate-500">Registered healthcare providers will appear here</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Req.</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {displayedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {u.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md">{u.total_requests}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {parseInt(u.pending) > 0 ? <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full">{u.pending}</span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {parseInt(u.approved) > 0 ? <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">{u.approved}</span> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={() => openUserModal(u.id)}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 px-3 py-1.5 rounded-md font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* USER DETAIL MODAL */}
      {activeUserId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal} />
          
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
              
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-900" /> 
                  Provider Details
                </h3>
                <button 
                  onClick={closeModal}
                  className="rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-200 p-1 transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {modalLoading ? (
                   <div className="py-12"><LoadingSpinner message="Fetching user details..." /></div>
                ) : modalError ? (
                  <div className="p-8 text-center text-red-500">
                    <p className="mb-4">{modalError}</p>
                    <button 
                      onClick={() => openUserModal(activeUserId)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-md font-semibold transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : selectedUser && userStats ? (
                  <div className="space-y-8">
                    {/* SECTION 1 - User Info */}
                    <div className="bg-white border text-left border-slate-200 rounded-lg p-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Provider Name</p>
                        <p className="font-bold text-slate-900 mt-1">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Email Address</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Phone Number</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Member Since</p>
                        <p className="font-medium text-slate-900 mt-1">{formatDate(selectedUser.created_at)}</p>
                      </div>
                    </div>

                    {/* SECTION 2 - Quick Stats */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Credentialing Activity</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center"><FileText className="w-4 h-4 mr-1"/>Total Requests</p>
                          <p className="text-2xl font-bold text-slate-900">{userStats.total}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                          <p className="text-sm font-semibold text-yellow-700 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1"/>Pending</p>
                          <p className="text-2xl font-bold text-yellow-800">{userStats.pending + userStats.in_review}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-semibold text-green-700 mb-1 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/>Approved</p>
                          <p className="text-2xl font-bold text-green-800">{userStats.approved}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-sm font-semibold text-red-700 mb-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>Rejected</p>
                          <p className="text-2xl font-bold text-red-800">{userStats.rejected}</p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3 - Requests Table inside modal */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Recent Applications</h4>
                      <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                        {userRequests.length > 0 ? (
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {userRequests.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{r.request_type}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{r.specialty}</td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-md border ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-800'}`}>
                                      {STATUS_LABELS[r.status] ?? r.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDate(r.submitted_at || r.created_at)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                    <Link 
                                      to={`/admin/requests/${r.id}`} 
                                      onClick={closeModal}
                                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 hover:underline bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                      View Request
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            No requests submitted yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 text-right, flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
