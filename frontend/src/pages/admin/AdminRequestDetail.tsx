import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Save, Download, Trash2, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import type { CredentialingRequest, Document, StatusHistory } from '../../types/index';
import Navbar from '../../components/layout/Navbar';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/constants';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

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
  const { toast, showToast, hideToast } = useToast();
  
  // Status Update state
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Dialog state
  const [showStatusDialog, setShowStatusDialog] = useState(false);

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
      showToast(err.response?.data?.message || 'Failed to fetch details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const confirmStatusUpdate = async () => {
    setUpdating(true);
    setShowStatusDialog(false);
    try {
      await api.patch(`/admin/requests/${id}/status`, {
        status: newStatus,
        note: adminNote
      });
      setAdminNote('');
      showToast("Status updated successfully", "success");
      await fetchDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === request?.status) return;
    setShowStatusDialog(true);
  };

  if (loading && !request) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <LoadingSpinner message="Loading request details..." />
    </div>
  );
  if (!request) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <span className="text-slate-500">Request not found</span>
    </div>
  );

  const StatusIcon = statusIcons[request.status] || FileText;

  return (
    <div className="min-h-screen bg-slate-100 pb-8">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Link to="/admin/requests" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Requests
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Request Information Card */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Request Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-slate-500">Specialty</p>
                  <p className="mt-1 text-slate-900 font-medium">{request.specialty || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">NPI Number</p>
                  <p className="mt-1 text-slate-900 font-medium">{request.npi_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">License State</p>
                  <p className="mt-1 text-slate-900 font-medium">{request.license_state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Request Type</p>
                  <p className="mt-1 text-slate-900 font-medium">{request.request_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Submitted Date</p>
                  <p className="mt-1 text-slate-900 font-medium">{formatDate((request as any).submitted_at || request.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Last Updated</p>
                  <p className="mt-1 text-slate-900 font-medium">{formatDate(request.updated_at)}</p>
                </div>
                {request.notes && (
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-slate-500 mb-1">Notes</p>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-md border border-slate-100 italic">{request.notes}</p>
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
                              showToast("Document deleted successfully", "success");
                              fetchDetails();
                            } catch (err: any) {
                              showToast(err.response?.data?.message || 'Failed to delete document', "error");
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
                Status History
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
          <div className="lg:col-span-1 space-y-6">
            
            {/* Provider Information Card */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
               <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Provider Information</h2>
               <div className="flex flex-col">
                 <h3 className="text-2xl font-bold text-slate-900 mb-1">{request.user_name}</h3>
                 <a href={`mailto:${request.user_email}`} className="text-blue-600 hover:text-blue-800 hover:underline mb-4 truncate text-sm font-medium">{request.user_email}</a>
                 <div className="bg-blue-50/50 rounded p-3 border border-blue-100">
                   <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Member Since</p>
                   <p className="text-sm text-slate-800 font-medium">{formatDate((request as any).user_created_at || request.created_at)}</p>
                 </div>
               </div>
            </div>

            {/* Update Status Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100 sticky top-8">
              <div className="mb-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Current Status</p>
                 <span className={`flex items-center px-4 py-2 space-x-2 rounded-full text-base font-bold border shadow-sm ${getStatusColor(request.status)}`}>
                   <StatusIcon className="w-5 h-5 mr-1" />
                   {formatStatus(request.status)}
                 </span>
              </div>
              
              <form onSubmit={handleStatusUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Set New Status</label>
                  <select 
                    value={newStatus} 
                    onChange={e => setNewStatus(e.target.value)}
                    className="block w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Note (Required for changes)</label>
                  <textarea 
                    rows={4} 
                    required
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Provide a reason or instructions..."
                    className="block w-full border border-slate-300 rounded-lg py-2px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 text-slate-800"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={updating || newStatus === request.status || (!adminNote.trim() && newStatus !== request.status)}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Saving...' : 'Update Status'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showStatusDialog}
        title="Update Status"
        message={`Are you sure you want to change the status to ${formatStatus(newStatus)}?`}
        confirmText="Update Status"
        confirmColor="blue"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setShowStatusDialog(false)}
      />
    </div>
  );
};

export default AdminRequestDetail;
