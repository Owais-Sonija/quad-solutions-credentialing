import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, FileText } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">MedCred Solutions</span>
            </div>
            <div className="flex gap-4">
              <Link to="/contact" className="text-slate-600 hover:text-blue-600 px-3 py-2 font-medium transition-colors">
                Contact Support
              </Link>
              <Link to="/login" className="text-slate-600 hover:text-blue-600 px-3 py-2 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Professional Medical <br className="hidden md:block"/> Credentialing Services
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto mb-10">
              Streamline your medical credentialing and enrollment process. Fast, secure, and fully transparent tracking for healthcare professionals and organizations.
            </p>
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-200 md:text-lg transition-all">
              Start Free Today
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900 mb-12">Why Choose MedCred?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Fast Processing</h3>
              <p className="text-slate-500">Accelerate your credentialing timeline with our streamlined workflows and dedicated professional team.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure Documents</h3>
              <p className="text-slate-500">Bank-grade encryption and secure HIPAA-compliant storage for all your sensitive professional documents.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Real-time Tracking</h3>
              <p className="text-slate-500">Always know exactly where your application stands with full transparency and instant status updates.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} MedCred Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
