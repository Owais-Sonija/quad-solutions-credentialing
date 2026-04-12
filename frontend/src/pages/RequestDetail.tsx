import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import type { CredentialingRequest, Document, StatusHistory } from '../types/index';
import Navbar from '../components/layout/Navbar';
import { STATUS_LABELS, STATUS_COLORS } from '../data/constants';



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

const formatStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Initial Submission';
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ').toUpperCase();
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CredentialingRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/user/requests/${id}`);
        console.log('Request Detailed Data:', response.data);
        const data = response.data?.data || response.data;
        
        setRequest(data?.request || data);
        setDocuments(data?.documents || []);
        setHistory(data?.status_history || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading details...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-600">{error}</div>;
  if (!request) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Request not found</div>;

  const StatusIcon = statusIcons[request.status];

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="bg-white shadow rounded-xl p-6 border border-slate-200 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{request.request_type}</h1>
              <p className="text-slate-500">Submitted on {new Date((request as any).submitted_at || request.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}`}>
              <StatusIcon className="w-4 h-4 mr-1.5" />
              {STATUS_LABELS[request.status] || request.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-slate-100 pt-6">
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
            {request.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500 font-medium">Notes</p>
                <p className="text-slate-900 mt-1 bg-slate-50 p-3 rounded-md border border-slate-100">{request.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white shadow rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600"/>
                Attached Documents
              </h2>
              {documents.length === 0 ? (
                <p className="text-slate-500 py-4 text-center bg-slate-50 rounded border border-dashed border-slate-200">No documents attached.</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                  {documents.map(doc => (
                    <li key={doc.id} className="py-3 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center truncate mr-4">
                        <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-900 truncate">{(doc as any).original_name || doc.file_name || 'Unknown Document'}</p>
                          <p className="text-xs text-slate-500">{formatDocType((doc as any).doc_type || doc.document_type)} &bull; {formatDate((doc as any).uploaded_at)}</p>
                        </div>
                      </div>
                      <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${(doc as any).filename || doc.file_name}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline hover:text-blue-800 text-sm font-medium">View Document</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600"/>
                Status History
              </h2>
              <div className="relative border-l-2 border-slate-200 ml-3">
                {(history ?? []).map((item: any, idx) => (
                  <div key={item.id} className="mb-8 ml-6 relative">
                    <div className={`absolute -left-7 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${item.status === 'rejected' ? 'bg-red-500' : item.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <p className="text-xs text-slate-500 font-medium">{formatDate(item.changed_at)}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {!item.old_status 
                        ? `Status set to: ${formatStatusLabel(item.status)}` 
                        : `Status changed from: ${formatStatusLabel(item.old_status)} → ${formatStatusLabel(item.status)}`}
                    </p>
                    {item.notes && <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{item.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1">By {item.changed_by_name || 'Admin'}</p>
                  </div>
                ))}
                {(history ?? []).length === 0 && (
                  <div className="ml-6 py-2 text-sm text-slate-500">No history available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
