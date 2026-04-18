import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Building2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      login({ ...response.data.user, role: 'admin' }, response.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-xl">
              <span className="text-blue-600 font-black text-2xl">+</span>
              Quad Solutions
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <ShieldAlert className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Admin Secure Gateway</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-3">
              🎯 Demo Credentials — For Testing Only
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded-md px-3 py-2 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Demo Admin Account</p>
                  <p className="text-sm font-medium text-gray-800">
                    demoadmin@quadsolutions.com
                  </p>
                  <p className="text-xs text-gray-500">
                    Password: DemoAdmin@1234
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demoadmin@quadsolutions.com');
                    setPassword('DemoAdmin@1234');
                  }}
                  className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex-shrink-0"
                >
                  Use
                </button>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2 italic">
              * Demo admin has view-only analytics. Passwords cannot be changed.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Admin Email</label>
              <div className="mt-1">
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1">
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
