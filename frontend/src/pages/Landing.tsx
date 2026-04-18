import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

const Landing = () => {
  // Smooth scroll handler
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // account for navbar height
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <PublicNavbar />

      <main className="flex-1 pt-20">
        {/* SECTION 2 - Hero */}
        <section className="relative bg-white pt-20 pb-20 lg:pt-32 lg:pb-28 border-b border-slate-200">
          <div className="absolute inset-0 bg-blue-50/50 -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Streamline Your Medical <br className="hidden md:block"/> Credentialing Process
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-500 mx-auto mb-10 leading-relaxed">
              Fast, secure, and compliant credentialing solutions for healthcare providers. Get credentialed in days, not months.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                Learn More
              </a>
            </div>
            
            {/* Trust Bar */}
            <div className="pt-8 border-t border-slate-200 flex flex-wrap justify-center gap-y-4 gap-x-8 text-sm md:text-base font-medium text-slate-600">
              <div className="flex items-center gap-2"><span className="text-blue-600 font-bold text-lg">✓</span> HIPAA Compliant</div>
              <div className="flex items-center gap-2"><span className="text-blue-600 font-bold text-lg">✓</span> 500+ Providers Credentialed</div>
              <div className="flex items-center gap-2"><span className="text-blue-600 font-bold text-lg">✓</span> 48-Hour Processing</div>
              <div className="flex items-center gap-2"><span className="text-blue-600 font-bold text-lg">✓</span> Secure Document Handling</div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - Services */}
        <section id="services" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Credentialing Services</h2>
              <p className="text-lg text-slate-500">Comprehensive solutions for every stage of your credentialing journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "📋", title: "Initial Credentialing", desc: "Complete credentialing setup for new healthcare providers joining a hospital or insurance network." },
                { icon: "🔄", title: "Re-credentialing", desc: "Timely renewal of credentials to maintain your active status with hospitals and payers." },
                { icon: "✅", title: "Primary Source Verification", desc: "Direct verification of credentials from the original issuing source for full compliance." },
                { icon: "🏥", title: "Insurance Enrollment", desc: "Enroll with major insurance networks including Medicare, Medicaid, and commercial payers." },
                { icon: "👁️", title: "License Monitoring", desc: "Continuous monitoring of your medical licenses and certifications across all states." },
                { icon: "🔐", title: "CAQH Management", desc: "Complete setup and ongoing management of your CAQH ProView profile." }
              ].map((service, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 - How It Works */}
        <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-lg text-slate-500">Get credentialed in three simple steps</p>
            </div>

            <div className="relative">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden lg:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 border-t-2 border-dashed border-blue-200" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                {[
                  { step: "1", title: "Create Your Account", desc: "Register and complete your provider profile with basic information and practice details." },
                  { step: "2", title: "Submit Documents", desc: "Upload your credentials, licenses, and certifications securely through our platform." },
                  { step: "3", title: "Track & Get Approved", desc: "Monitor your application status in real-time as our team processes your credentials." }
                ].map((item, idx) => (
                  <div key={idx} className="relative flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 max-w-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - Stats/Trust */}
        <section className="py-16 bg-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-blue-600/50 text-center">
              {[
                { stat: "500+", label: "Healthcare Providers Credentialed" },
                { stat: "48hrs", label: "Average Processing Time" },
                { stat: "99%", label: "Approval Success Rate" },
                { stat: "50+", label: "Insurance Networks" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-4">
                  <div className="text-4xl font-extrabold text-white mb-2">{item.stat}</div>
                  <div className="text-sm md:text-base font-medium text-blue-100">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 - Why Choose Us */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Healthcare Providers Trust Quad Solutions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {[
                { icon: "🛡️", title: "HIPAA Compliant Security", desc: "Your data is protected with enterprise-grade encryption and full HIPAA compliance." },
                { icon: "👥", title: "Expert Credentialing Team", desc: "Our specialists have 10+ years of experience in medical credentialing across all specialties." },
                { icon: "📊", title: "Real-Time Status Tracking", desc: "Monitor every step of your credentialing process through our intuitive dashboard." },
                { icon: "🎧", title: "Dedicated Support", desc: "24/7 support team ready to assist you at every stage of the credentialing process." }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-6 items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7 - Testimonials */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: "Quad Solutions reduced our credentialing time from 3 months to just 2 weeks. Outstanding service!", author: "Dr. Sarah Johnson", role: "Cardiologist, New York" },
                { quote: "The real-time tracking feature gave us complete visibility into our application status. Highly recommend!", author: "Dr. Michael Chen", role: "Orthopedic Surgeon, California" },
                { quote: "Professional, efficient, and thorough. Best credentialing service we have worked with in 15 years.", author: "Dr. Emily Rodriguez", role: "Pediatrician, Texas" }
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-2xl flex flex-col justify-between border border-slate-100 relative">
                  <span className="absolute top-0 right-6 text-6xl text-blue-100 font-serif">"</span>
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-6 tabular-nums">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed mb-8 italic">"{testimonial.quote}"</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm font-medium text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 - CTA Banner */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Credentialed?</h2>
            <p className="text-xl text-blue-100 mb-10">Join 500+ healthcare providers who trust Quad Solutions for their credentialing needs.</p>
            <Link to="/login" className="inline-block px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-slate-50 hover:scale-105 shadow-xl transition-all">
              Login to Your Account
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Landing;
