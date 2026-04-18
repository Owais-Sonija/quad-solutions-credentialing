import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // If not on landing page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-slate-200 shadow-sm top-0 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-xl hover:text-blue-800 transition-colors">
            <span className="text-blue-600 font-black text-2xl">+</span>
            Quad Solutions
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
              Services
            </a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
              How It Works
            </a>
            <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
              Contact
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 shadow-sm transition-colors">
              Login
            </Link>
          </div>
          
          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-4">
             <Link to="/login" className="px-4 py-1.5 text-sm font-semibold text-blue-700 border border-blue-700 rounded hover:bg-blue-50 transition-colors">Login</Link>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700">
               {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-4 py-4 space-y-3">
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Services</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">How It Works</a>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Contact</Link>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
               <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center block px-4 py-2 text-base font-medium text-white bg-blue-700 rounded-md">Login</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
