import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Save, Download, Trash2, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import type { CredentialingRequest, Document, StatusHistory } from '../../types/index';
import Navbar from '../../components/layout/Navbar';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/constants';

const statusIcons: Record<string, any> = {
  pending: Clock,
  in_review: Clock,
  approved: CheckCircle,
  rejected: AlertCircle,
};

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

const formatDocType = (type: string): string => {
  const map: Record<string, string> = {
    license: 'Medical License',
    certificate: 'Board Certification',
    insurance: 'Malpractice Insurance', 
    identity: 'Identity Document',
    other: 'Other Document'
  };
  return map[type] ?? type;
};

const formatStatus = (status: string | undefined): string => {
  if (!status) return 'Unknown';
  return STATUS_LABELS[status] || status.replace(/_/g, ' ').toUpperCase();
};

const formatStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Initial Submission';
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ').toUpperCase();
};

const getStatusColor = (status: string | undefined): string => {
  return STATUS_COLORS[status || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const AdminRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CredentialingRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Status Update state
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/requests/${id}`);
      console.log('Full Admin Request Detail:', response.data);
      const data = response.data?.data || response.data || {};
      
      setRequest(data.request || data || null);
      setDocuments(data.documents ?? []);
      setHistory(data.status_history ?? []);
      setNewStatus((data.request || data)?.status || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === request?.status) return;
    
    if (!window.confirm(`Are you sure you want to change the status to ${formatStatus(newStatus)}?`)) {
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/admin/requests/${id}/status`, {
        status: newStatus,
        note: adminNote
      });
      setAdminNote('');
      await fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !request) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">Loading details...</div>;
  if (error) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-red-600">{error}</div>;
  if (!request) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">Request not found</div>;

  const StatusIcon = statusIcons[request.status] || FileText;

  return (
    <div className="min-h-screen bg-slate-100 pb-8">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Link to="/admin/requests" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to All Requests
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{request.user_name}</h1>
                  <p className="text-slate-500">{request.user_email}</p>
                </div>
                <span className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(request.status)}`}>
                  <StatusIcon className="w-4 h-4 mr-1.5" />
                  {formatStatus(request.status)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Credentialing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Request Type</p>
                  <p className="text-slate-900 font-medium mt-1">{request.request_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Specialty</p>
                  <p className="text-slate-900 font-medium mt-1">{request.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">NPI Number</p>
                  <p className="text-slate-900 font-medium mt-1">{request.npi_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">License State</p>
                  <p className="text-slate-900 font-medium mt-1">{request.license_state}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 font-medium">Submission Date</p>
                  <p className="text-slate-900 font-medium mt-1">{formatDate((request as any).submitted_at || request.created_at)}</p>
                </div>
                {request.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500 font-medium">Applicant Notes</p>
                    <p className="text-slate-900 mt-1 bg-slate-50 p-4 rounded-md border border-slate-100">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600"/>
                Applicant Documents
              </h2>
              {(documents ?? []).length === 0 ? (
                <p className="text-slate-500 py-4 text-center bg-slate-50 rounded border border-dashed border-slate-200">No documents attached.</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                  {(documents ?? []).map((doc: any) => (
                    <li key={doc.id} className="py-3 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center truncate mr-4">
                        <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.original_name || doc.file_name || 'Unknown Document'}</p>
                          <p className="text-xs text-slate-500">{formatDocType(doc.doc_type || doc.document_type)} &bull; {formatDate(doc.uploaded_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${doc.filename || doc.file_name}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded transition-colors" title="View">
                          <ExternalLink className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">View</span>
                        </a>
                        <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${doc.filename || doc.file_name}`} download={doc.original_name || doc.file_name} className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium bg-green-50 px-3 py-1.5 rounded transition-colors" title="Download">
                          <Download className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Download</span>
                        </a>
                        <button 
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this document? \nThis action cannot be undone.")) return;
                            try {
                              await api.delete(`/admin/documents/${doc.id}`);
                              alert("Document deleted successfully");
                              fetchDetails();
                            } catch (err: any) {
                              alert(err.response?.data?.message || 'Failed to delete document');
                            }
                          }}
                          className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1.5 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600"/>
                Status History Timeline
              </h2>
              <div className="relative border-l-2 border-slate-200 ml-3">
                {(history ?? []).map((item: any) => (
                  <div key={item.id} className="mb-8 ml-6 relative">
                    <div className={`absolute -left-7 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${item.status === 'rejected' ? 'bg-red-500' : item.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {!item.old_status 
                            ? `Status set to: ${formatStatusLabel(item.status)}` 
                            : `Status changed from: ${formatStatusLabel(item.old_status)} → ${formatStatusLabel(item.status)}`}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{formatDate(item.changed_at)}</p>
                        <p className="text-xs text-slate-400 mt-1">Admin: {item.changed_by_name || item.admin_name || 'System'}</p>
                      </div>
                    </div>
                    {item.notes && <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded border border-slate-100">{item.notes}</p>}
                  </div>
                ))}
                {(history ?? []).length === 0 && (
                  <div className="ml-6 py-2 text-sm text-slate-500">No history available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-800 shadow-lg rounded-xl p-6 border border-slate-700 text-white sticky top-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400"/>
                Update Status
              </h2>
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Set New Status</label>
                  <select 
                    value={newStatus} 
                    onChange={e => setNewStatus(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-600 bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Internal Note / Response to Applicant</label>
                  <textarea 
                    rows={4} 
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Add a note explaining the status change..."
                    className="mt-1 block w-full border border-slate-600 bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={updating || newStatus === request.status}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Saving...' : 'Update Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetail;
