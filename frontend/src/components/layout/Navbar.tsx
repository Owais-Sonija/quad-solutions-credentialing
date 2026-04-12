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
    <nav className={`${isAdmin ? 'bg-blue-900 border-blue-800' : 'bg-blue-700 border-blue-600'} shadow-sm border-b transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-white" />
            <span className="text-lg font-bold text-white tracking-tight">Quad Solutions</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/admin/requests" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Requests</Link>
                <Link to="/admin/documents" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Documents</Link>
                <Link to="/admin/profile" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">My Profile</Link>
                <span className="text-sm text-blue-200 font-medium ml-4 border-l pl-4 border-blue-500/50">Admin: {user?.name || 'Admin'}</span>
              </>
            ) : user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/submit" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Submit Request</Link>
                <Link to="/profile" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">My Profile</Link>
                <Link to="/contact" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Contact Support</Link>
                <span className="text-sm text-blue-200 font-medium ml-4 border-l pl-4 border-blue-500/50">{user?.name}</span>
              </>
            ) : (
              <Link to="/contact" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Contact Support</Link>
            )}
            
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white hover:bg-white/10 rounded-md transition-colors text-sm font-medium ml-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="flex gap-4 items-center ml-2">
                <Link to="/login" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm">Get Started</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:text-blue-100 p-1">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${isAdmin ? 'border-blue-800 bg-blue-900' : 'border-blue-600 bg-blue-700'}`}>
          <div className="px-4 pt-2 pb-4 space-y-1">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Dashboard</Link>
                <Link to="/admin/requests" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Requests</Link>
                <Link to="/admin/documents" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Documents</Link>
                <Link to="/admin/profile" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">My Profile</Link>
                <div className="px-3 py-2 text-sm text-blue-200 font-medium border-t border-white/10 mt-2">Admin: {user?.name || 'Admin'}</div>
              </>
            ) : user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Dashboard</Link>
                <Link to="/submit" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Submit Request</Link>
                <Link to="/profile" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">My Profile</Link>
                <Link to="/contact" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Contact Support</Link>
                <div className="px-3 py-2 text-sm text-blue-200 font-medium border-t border-white/10 mt-2">{user?.name}</div>
              </>
            ) : (
              <Link to="/contact" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Contact Support</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <div className="mt-2 px-3 py-2 space-y-2 border-t border-white/10">
                <Link to="/login" className="block w-full text-center py-2 text-base font-medium text-white hover:bg-white/10 rounded-md">Login</Link>
                <Link to="/register" className="block w-full text-center py-2 text-base font-medium text-blue-700 bg-white hover:bg-blue-50 rounded-md shadow-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
