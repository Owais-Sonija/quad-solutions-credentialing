import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

const NotFound = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50">
        <h1 className="text-9xl font-black text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Go Back Home
          </Link>
          
          {user && (
            <Link 
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default NotFound;
