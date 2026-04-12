import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { CredentialingRequest } from '../types/index';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/layout/Navbar';
import { STATUS_LABELS, STATUS_COLORS } from '../data/constants';

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

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CredentialingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/requests');
        
        // Extract array depending on response shape safely
        const actualData = response.data?.requests || response.data?.data || response.data;
        if (Array.isArray(actualData)) {
          setRequests(actualData);
        } else {
          setRequests([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch requests', err);
        showToast(err.response?.data?.message || 'Failed to load requests', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your Requests</h1>
          <Link to="/submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Submit New Request
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your requests..." />
        ) : (requests?.length ?? 0) === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No requests yet</h3>
            <p className="text-slate-500 mb-6">You haven't submitted any credentialing requests.</p>
            <Link to="/submit" className="text-blue-600 font-medium hover:text-blue-700">Start your first request &rarr;</Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Specialty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NPI State</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {(requests ?? []).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.request_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.npi_number} ({req.license_state})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate((req as any).submitted_at || req.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_LABELS[req.status] ?? req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/request/${req.id}`} className="text-blue-600 hover:text-blue-900 font-medium bg-blue-50 py-1.5 px-3 rounded-md hover:bg-blue-100 transition-colors">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
