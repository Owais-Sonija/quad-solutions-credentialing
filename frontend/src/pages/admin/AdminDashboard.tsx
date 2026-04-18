import { useState, useEffect, useCallback } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { LiveIndicator } from '../../components/ui/LiveIndicator';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Users, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../../components/layout/Navbar';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/constants';
import { ToastContainer } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    recent_requests: []
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, hideToast } = useToast();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // First try fetching exact stats if admin.controller/routes supported it properly
      // We will maintain the backward compatible mapping approach
      const response = await api.get('/admin/requests');
      
      let allRequests: any[] = [];
      const data = response.data?.data || response.data?.requests || response.data;
      if (Array.isArray(data)) {
        allRequests = data;
      }

      setStats({
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        in_review: allRequests.filter(r => r.status === 'in_review').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length,
        recent_requests: allRequests.slice(0, 5) as any
      });
      
      setRequests(allRequests);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchDashboardData, {
    interval: 60000,
    enabled: isPolling,
    immediate: true
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <ToastContainer toasts={toasts} onClose={hideToast} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <LiveIndicator 
              isPolling={isPolling}
              lastUpdated={lastUpdated}
              interval={60}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading dashboard..." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-slate-100 mr-4"><FileText className="w-6 h-6 text-slate-600"/></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 mr-4"><Clock className="w-6 h-6 text-yellow-600"/></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.pending ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4"><Users className="w-6 h-6 text-blue-600"/></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">In Review</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.in_review ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 mr-4"><CheckCircle className="w-6 h-6 text-green-600"/></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Approved</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.approved ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-medium text-slate-900">Recent Requests</h3>
                <Link to="/admin/requests" className="text-sm font-medium text-blue-600 hover:text-blue-800">View all &rarr;</Link>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Specialty / Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {(stats.recent_requests ?? []).map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-slate-900">{req.user_name}</p>
                          <p className="text-xs text-slate-500">{req.user_email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-900">{req.specialty}</p>
                          <p className="text-xs text-slate-500">{req.request_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[req.status] ?? req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDate((req as any).submitted_at || req.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/admin/requests/${req.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {(stats.recent_requests?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
