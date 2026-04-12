import { Link } from 'react-router-dom';
import { Plus, Mail, Phone } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Quad Solutions</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Professional Medical Credentialing Services. Simplifying healthcare provider enrollment with integrity and speed.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/#services" className="text-slate-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-blue-500" />
                support@quadsolutions.com
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-blue-500" />
                +1 (800) 123-4567
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Quad Solutions. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
