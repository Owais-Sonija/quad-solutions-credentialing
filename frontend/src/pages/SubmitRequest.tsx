import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, UploadCloud, CheckCircle, Loader2, XCircle } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';
import { US_STATES, REQUEST_TYPES, MEDICAL_SPECIALTIES, DOCUMENT_TYPES } from '../data/constants';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const SubmitRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { toasts, showToast, hideToast } = useToast();

  // Step 1 state
  const [formData, setFormData] = useState({
    specialty: '',
    npi_number: '',
    license_state: US_STATES[0].code,
    request_type: REQUEST_TYPES[0],
    notes: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 2 state
  const [files, setFiles] = useState<{file: File, type: string, uploaded: boolean, error?: string | null}[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);



  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.specialty || formData.specialty.length < 2) {
      errors.specialty = 'Specialty must be at least 2 characters';
    }
    if (!/^\d{10}$/.test(formData.npi_number)) {
      errors.npi_number = 'NPI Number must be exactly 10 digits';
    }
    if (!formData.license_state) {
      errors.license_state = 'License State is required';
    }
    if (!formData.request_type) {
      errors.request_type = 'Request Type is required';
    }
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes must not exceed 500 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    setLoading(true);
    try {
      // Sending specialty, npi_number, license_state, request_type, notes
      const payload = {
        specialty: formData.specialty,
        npi_number: formData.npi_number,
        license_state: formData.license_state,
        request_type: formData.request_type,
        notes: formData.notes || undefined
      };
      
      const response = await api.post('/user/requests', payload);
      const newRequestId = response.data?.id || response.data?.request?.id || response.data?.data?.id;
      
      if (!newRequestId) {
        throw new Error('Could not extract request ID from server response');
      }
      
      setRequestId(newRequestId);
      setStep(2);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create request. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesList = Array.from(e.target.files);
      const validFiles: {file: File, type: string, uploaded: boolean, error?: string | null}[] = [];

      if (files.length + newFilesList.length > 2) {
        showToast('Maximum 2 files allowed per request', 'warning');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

      newFilesList.forEach(f => {
        if (!allowedTypes.includes(f.type)) {
          showToast(`${f.name}: Only PDF, JPG and PNG allowed`, 'error');
          return;
        }
        
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          showToast(`${f.name}: Invalid file type`, 'error');
          return;
        }
        
        const nameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.'));
        if (nameWithoutExt.includes('.')) {
          showToast(`${f.name}: Invalid filename - double extensions not allowed`, 'error');
          return;
        }
        
        if (f.size > 1 * 1024 * 1024) {
          showToast(`${f.name}: File too large. Maximum size is 1MB`, 'error');
          return;
        }
        
        validFiles.push({ 
          file: f, type: 'license', uploaded: false, error: null 
        });
      });

      setFiles([...files, ...validFiles]);

      if (files.length + validFiles.length >= 2) {
        showToast(
          'Maximum 2 files allowed. Remove a file to add another.', 
          'warning'
        );
      }
    }
  };

  const handleDocTypeChange = (index: number, type: string) => {
    const newFiles = [...files];
    newFiles[index].type = type;
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (!requestId || files.length === 0) {
       setStep(3);
       return;
    }
    setUploading(true);
    let allSuccess = true;
    
    // We update file states individually
    const currentFiles = [...files];

    for (let i = 0; i < currentFiles.length; i++) {
      if (currentFiles[i].uploaded) continue;
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', currentFiles[i].file);
      formDataUpload.append('doc_type', currentFiles[i].type);

      try {
        await api.post(`/user/requests/${requestId}/documents`, formDataUpload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        currentFiles[i].uploaded = true;
        currentFiles[i].error = null;
        setFiles([...currentFiles]);
        showToast("Document uploaded successfully", "success");
      } catch (err: any) {
        allSuccess = false;
        currentFiles[i].error = err.response?.data?.message || 'Failed to upload document';
        setFiles([...currentFiles]);
      }
    }
    
    setUploading(false);
    if (allSuccess) setStep(3);
  };

  const renderProgress = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((item, idx) => (
        <div key={item} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${step >= item ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {step > item ? <CheckCircle className="w-5 h-5" /> : item}
          </div>
          {idx < 2 && (
            <div className={`w-16 h-1 mx-2 rounded ${step > item ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const isNextDisabled = !formData.specialty.trim() || !formData.npi_number.trim() || !formData.license_state || !formData.request_type;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Navbar />
      
      <ToastContainer toasts={toasts} onClose={hideToast} />

      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        
        <div className="bg-white shadow rounded-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Submit Credentialing Request</h2>
          {renderProgress()}

          {step === 1 && (loading ? <LoadingSpinner message="Submitting your request..." /> : (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="text-sm text-slate-500 mb-4 pb-2 border-b border-slate-100">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Medical Specialty <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.specialty} 
                    onChange={e => {
                      setFormData({...formData, specialty: e.target.value});
                      if (fieldErrors.specialty) setFieldErrors({...fieldErrors, specialty: ''});
                    }} 
                    className={`mt-1 block w-full border ${fieldErrors.specialty ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`} 
                  >
                    <option value="" disabled>Select Specialty</option>
                    {MEDICAL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.specialty && <p className="mt-1 text-sm text-red-600">{fieldErrors.specialty}</p>}
                  <p className="mt-1 text-xs text-slate-500">Enter your primary medical specialty</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    NPI Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.npi_number} 
                    onChange={e => {
                      setFormData({...formData, npi_number: e.target.value.replace(/\D/g, '')});
                      if (fieldErrors.npi_number) setFieldErrors({...fieldErrors, npi_number: ''});
                    }} 
                    className={`mt-1 block w-full border ${fieldErrors.npi_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`} 
                    placeholder="Enter 10-digit NPI number" 
                    maxLength={10}
                  />
                  {fieldErrors.npi_number && <p className="mt-1 text-sm text-red-600">{fieldErrors.npi_number}</p>}
                  <p className="mt-1 text-xs text-slate-500">Your National Provider Identifier must be exactly 10 digits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    License State <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.license_state} 
                    onChange={e => {
                      setFormData({...formData, license_state: e.target.value});
                      if (fieldErrors.license_state) setFieldErrors({...fieldErrors, license_state: ''});
                    }} 
                    className={`mt-1 block w-full border ${fieldErrors.license_state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`}
                  >
                    <option value="" disabled>Select State</option>
                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                  {fieldErrors.license_state && <p className="mt-1 text-sm text-red-600">{fieldErrors.license_state}</p>}
                  <p className="mt-1 text-xs text-slate-500">Select the state where your medical license was issued</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Request Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.request_type} 
                    onChange={e => {
                      setFormData({...formData, request_type: e.target.value});
                      if (fieldErrors.request_type) setFieldErrors({...fieldErrors, request_type: ''});
                    }} 
                    className={`mt-1 block w-full border ${fieldErrors.request_type ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`}
                  >
                    <option value="" disabled>Select Request Type</option>
                    {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {fieldErrors.request_type && <p className="mt-1 text-sm text-red-600">{fieldErrors.request_type}</p>}
                  <p className="mt-1 text-xs text-slate-500">Select the type of credentialing you are applying for</p>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Additional Notes (Optional)</span>
                  <span className={`text-xs ${formData.notes.length > 500 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                    {formData.notes.length} / 500
                  </span>
                </label>
                <textarea 
                  rows={3} 
                  value={formData.notes} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val.length <= 500) {
                      setFormData({...formData, notes: val});
                      if (fieldErrors.notes) setFieldErrors({...fieldErrors, notes: ''});
                    }
                  }} 
                  className={`mt-1 block w-full border ${fieldErrors.notes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`} 
                  placeholder="Include any relevant information such as previous credentialing history, special circumstances, or urgent processing needs"
                  maxLength={500}
                ></textarea>
                {fieldErrors.notes && <p className="mt-1 text-sm text-red-600">{fieldErrors.notes}</p>}
                <p className="mt-1 text-xs text-slate-500">Maximum 500 characters</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={loading || isNextDisabled} 
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Documents <ChevronRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ))}

          {step === 2 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <UploadCloud className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                <p className="text-sm font-medium text-slate-900">Click or drag files to upload</p>
                <p className="text-xs text-slate-500 mt-1">Accepted formats: PDF, JPG, PNG only &bull; Max 1MB per file &bull; Max 2 files per request</p>
              </div>

              {files.length > 0 && (
                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                  {files.map((f, idx) => (
                    <li key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex-1 truncate mr-4 w-full sm:w-auto mb-3 sm:mb-0">
                        <p className="text-sm font-medium text-slate-900 truncate mb-1">{f.file.name}</p>
                        <select 
                          value={f.type} 
                          onChange={e => handleDocTypeChange(idx, e.target.value)} 
                          disabled={f.uploaded || uploading} 
                          className="block w-full sm:w-64 text-sm border border-slate-300 rounded py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          {DOCUMENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {f.error && <p className="text-xs text-red-500 mt-2 font-medium">{f.error}</p>}
                      </div>
                      <div className="flex items-center">
                        {f.uploaded ? (
                          <span className="text-green-600 text-sm font-medium flex items-center bg-green-50 px-2.5 py-1 rounded-md border border-green-200"><CheckCircle className="w-4 h-4 mr-1.5"/> Uploaded</span>
                        ) : f.error ? (
                          <div className="flex items-center">
                            <span className="text-red-500 text-sm font-medium flex items-center mr-3"><XCircle className="w-4 h-4 mr-1"/> Failed</span>
                            <button onClick={() => removeFile(idx)} className="text-slate-500 hover:text-red-600 text-sm font-medium px-2 py-1 transition-colors border border-slate-200 rounded">Discard</button>
                          </div>
                        ) : (
                          <button onClick={() => removeFile(idx)} disabled={uploading} className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50">Remove</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100 mt-6">
                <button onClick={() => setStep(3)} className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2">Skip for now</button>
                <button 
                  onClick={uploadFiles} 
                  disabled={uploading || files.length === 0} 
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Save & Continue <ChevronRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Your credentialing request has been submitted successfully!</h3>
              <p className="text-slate-500 mb-8 mx-auto max-w-md">Redirecting you to the dashboard...</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                  Go to Dashboard Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitRequest;
