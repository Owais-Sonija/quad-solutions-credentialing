import { useState, useEffect } from 'react';
import { Mail, Phone, Building2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

const ContactSupport = () => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 1000) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 20) newErrors.message = 'Message must be at least 20 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSuccess(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: ''
    });
    setErrors({});
    
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {user ? <Navbar /> : <PublicNavbar />}
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {/* SECTION 1 - Contact Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Contact Support</h1>
            <p className="text-slate-500 max-w-xl mx-auto text-lg hover:text-slate-600 transition-colors">
              We're here to help. Send us a message and we'll respond within 24 hours.
            </p>
          </div>

          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 font-medium tracking-tight">Your message has been sent! Our team will contact you within 24 hours.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow`} 
                  placeholder="John Doe" 
                />
                {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow`} 
                  placeholder="john@example.com" 
                />
                {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <select 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                className={`w-full px-4 py-2 bg-white border ${errors.subject ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow`}
              >
                <option value="" disabled>Select Subject</option>
                <option value="Application Status Inquiry">Application Status Inquiry</option>
                <option value="Document Upload Issue">Document Upload Issue</option>
                <option value="Account Access Problem">Account Access Problem</option>
                <option value="Credentialing Process Question">Credentialing Process Question</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Other">Other</option>
              </select>
              {errors.subject && <p className="mt-1 text-xs font-medium text-red-600">{errors.subject}</p>}
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Message <span className="text-red-500">*</span></label>
                <span className={`text-xs font-medium ${formData.message.length >= 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {formData.message.length} / 1000
                </span>
              </div>
              <textarea 
                name="message" 
                rows={5} 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Please describe your issue in detail..."
                className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none`}
              />
              {errors.message && <p className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* SECTION 2 - Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Email Support</h3>
            <p className="text-blue-600 font-medium mb-3 hover:underline cursor-pointer">support@quadsolutions.com</p>
            <p className="text-sm font-medium text-slate-500 mt-auto bg-slate-50 py-1 px-3 rounded-full">Response within 24 hours</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Phone Support</h3>
            <p className="text-slate-700 font-medium mb-3">+1 (800) 123-4567</p>
            <p className="text-sm font-medium text-slate-500 mt-auto bg-slate-50 py-1 px-3 rounded-full">Mon-Fri, 9AM - 5PM EST</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Head Office</h3>
            <p className="text-slate-700 font-medium mb-3">123 Medical Plaza, Suite 100</p>
            <p className="text-sm font-medium text-slate-500 mt-auto bg-slate-50 py-1 px-3 rounded-full">New York, NY 10001</p>
          </div>
        </div>
      </main>

      {!user && <PublicFooter />}
    </div>
  );
};

export default ContactSupport;
