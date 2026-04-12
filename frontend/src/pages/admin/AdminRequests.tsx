import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../../components/layout/Navbar';
import type { CredentialingRequest } from '../../types/index';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/constants';
import { Toast } from '../../components/ui/Toast';
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

const AdminRequests = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CredentialingRequest[]>([]);
  const [filteredReqs, setFilteredReqs] = useState<CredentialingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['All', 'Pending', 'In Review', 'Approved', 'Rejected'];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/requests');
        
        let actualData: any[] = [];
        const baseData = response.data?.data || response.data?.requests || response.data;
        if (Array.isArray(baseData)) {
          actualData = baseData;
        }
        
        setRequests(actualData);
        setFilteredReqs(actualData);
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to fetch requests', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = requests ?? [];
    
    if (activeTab !== 'All') {
      const statusMatch = activeTab.toLowerCase().replace(' ', '_');
      result = result.filter(r => r.status === statusMatch);
    }
    
    if (searchTerm) {
      const lowerReq = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.user_name || '').toLowerCase().includes(lowerReq) ||
        (r.user_email || '').toLowerCase().includes(lowerReq) ||
        (r.specialty || '').toLowerCase().includes(lowerReq) ||
        (r.npi_number || '').toLowerCase().includes(lowerReq)
      );
    }
    
    setFilteredReqs(result);
  }, [activeTab, searchTerm, requests]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/dashboard" className="text-slate-500 hover:text-slate-900">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Manage Requests</h1>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-lg mb-8">
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0">
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search name, NPI, specialty..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full sm:w-64 border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px] rounded-lg border border-slate-200">
             {loading ? (
                <LoadingSpinner message="Loading requests..." />
             ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicant Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Credential Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {(filteredReqs ?? []).map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900">{req.user_name}</p>
                          <p className="text-xs text-slate-500">{req.user_email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-900">{req.specialty} ({req.license_state})</p>
                          <p className="text-xs text-slate-500">NPI: {req.npi_number} &mdash; {req.request_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {formatDate((req as any).submitted_at || req.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[req.status] ?? req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/admin/requests/${req.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 py-1.5 px-3 rounded-md transition-colors hover:bg-blue-100">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {(filteredReqs?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No requests match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRequests;
