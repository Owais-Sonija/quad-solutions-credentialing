import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Menu, X, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    if (user?.role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">Quad Solutions</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="text-sm font-medium text-slate-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/admin/requests" className="text-sm font-medium text-slate-700 hover:text-blue-600">Requests</Link>
                <span className="text-sm text-slate-500 font-medium ml-4 border-l pl-4 border-slate-200">Admin: {user?.name || 'Admin'}</span>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/submit" className="text-sm font-medium text-slate-700 hover:text-blue-600">Submit Request</Link>
                <span className="text-sm text-slate-500 font-medium ml-4 border-l pl-4 border-slate-200">{user?.name}</span>
              </>
            )}
            
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Dashboard</Link>
                <Link to="/admin/requests" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Requests</Link>
                <div className="px-3 py-2 text-sm text-slate-500 font-medium border-t mt-2">Admin: {user?.name || 'Admin'}</div>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Dashboard</Link>
                <Link to="/submit" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Submit Request</Link>
                <div className="px-3 py-2 text-sm text-slate-500 font-medium border-t mt-2">{user?.name}</div>
              </>
            )}
            <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
