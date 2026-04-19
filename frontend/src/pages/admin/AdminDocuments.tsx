import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Trash2, Search, Filter, X } from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import { DOCUMENT_TYPES, STATUS_COLORS, STATUS_LABELS } from '../../data/constants';
import { ToastContainer } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface Document {
  id: string;
  request_id: string;
  original_name: string;
  filename: string;
  filepath: string;
  doc_type: string;
  uploaded_at: string;
  specialty: string;
  request_type: string;
  request_status: string;
  user_name: string;
  user_email: string;
}

const getDocTypeColor = (type: string) => {
  switch (type) {
    case 'license': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'certificate': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'insurance': return 'bg-green-100 text-green-800 border-green-200';
    case 'identity': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDocTypeLabel = (value: string): string => {
  const found = DOCUMENT_TYPES.find(t => t.value === value);
  return found ? found.label : value;
};

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCell, setExpandedCell] = useState<{title: string, content: string} | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toasts, showToast, hideToast } = useToast();
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = '/admin/documents?';
      if (typeFilter) query += `doc_type=${encodeURIComponent(typeFilter)}&`;
      if (statusFilter) query += `request_status=${encodeURIComponent(statusFilter)}&`;
      
      const response = await api.get(query);
      setDocuments(response.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/documents/${id}`);
      showToast("Document deleted successfully", "success");
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete document', "error");
      setDocumentToDelete(null);
    }
  };

  // Local filter for search
  const filteredDocs = (documents ?? []).filter(doc => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      doc.original_name?.toLowerCase().includes(term) ||
      doc.user_name?.toLowerCase().includes(term) ||
      doc.user_email?.toLowerCase().includes(term)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <ToastContainer toasts={toasts} onClose={hideToast} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-500 mt-1">View and manage all uploaded provider documents</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Documents</p>
            <p className="text-3xl font-bold text-slate-900">{documents.length}</p>
          </div>
          {DOCUMENT_TYPES.map((type) => {
             const count = (documents ?? []).filter(d => d.doc_type === type.value).length;
             return (
               <div key={type.value} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <p className="text-xs font-medium text-slate-500 mb-1 line-clamp-1" title={type.label}>{type.label}</p>
                 <p className="text-xl font-bold text-slate-900">{count}</p>
               </div>
             )
          })}
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by document name, provider name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm appearance-none"
              >
                <option value="">All Types</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {(search || typeFilter || statusFilter) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Date</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider block">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <LoadingSpinner message="Loading documents..." />
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-3">
                        <span className="text-4xl">📄</span>
                      </div>
                      <p className="text-base font-medium text-slate-900 mb-1">No documents found</p>
                      <p className="text-sm">Documents uploaded by providers will appear here</p>
                    </td>
                  </tr>
                ) : (
                  (filteredDocs ?? []).map((doc) => {
                    const fileUrl = doc.filepath;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1">
                              <a 
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer max-w-[180px] truncate block"
                                title="Click to view document"
                              >
                                {doc.original_name} 👁
                              </a>
                              {doc.original_name && doc.original_name.length > 20 && (
                                <button
                                  onClick={() => setExpandedCell({ 
                                    title: 'Document Name', 
                                    content: doc.original_name 
                                  })}
                                  className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                                  title="Expand to see full text"
                                >
                                  ⤢
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <div className="max-w-[160px] truncate" title={`${doc.user_name || 'N/A'} \n${doc.user_email || 'N/A'}`}>
                              <div className="text-sm font-medium text-slate-900 truncate">{doc.user_name || 'N/A'}</div>
                              <div className="text-xs text-slate-500 truncate">{doc.user_email || 'N/A'}</div>
                            </div>
                            {`${doc.user_name || ''} ${doc.user_email || ''}`.length > 20 && (
                              <button
                                onClick={() => setExpandedCell({ 
                                  title: 'Provider Details', 
                                  content: `${doc.user_name || 'N/A'}\n${doc.user_email || 'N/A'}` 
                                })}
                                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                                title="Expand to see full text"
                              >
                                ⤢
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDocTypeColor(doc.doc_type)}`}>
                            {getDocTypeLabel(doc.doc_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.request_status as keyof typeof STATUS_COLORS] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                            {STATUS_LABELS[doc.request_status as keyof typeof STATUS_LABELS] || doc.request_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-slate-600 capitalize">
                            <span className="truncate max-w-[120px]" title={doc.specialty || 'N/A'}>
                              {doc.specialty || 'N/A'}
                            </span>
                            {doc.specialty && doc.specialty.length > 15 && (
                              <button
                                onClick={() => setExpandedCell({ 
                                  title: 'Specialty', 
                                  content: doc.specialty 
                                })}
                                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                                title="Expand to see full text"
                              >
                                ⤢
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <a 
                              href={fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="View"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a 
                              href={fileUrl} 
                              download={doc.original_name}
                              className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => setDocumentToDelete(doc.id)}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {expandedCell && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setExpandedCell(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900">
                {expandedCell.title}
              </h3>
              <button 
                onClick={() => setExpandedCell(null)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-700 break-words whitespace-pre-wrap">{expandedCell.content}</p>
            <button
              onClick={() => setExpandedCell(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!documentToDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
        onConfirm={() => documentToDelete && handleDelete(documentToDelete)}
        onCancel={() => setDocumentToDelete(null)}
      />
    </div>
  );
};

export default AdminDocuments;
