import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitRequest from './pages/SubmitRequest';
import RequestDetail from './pages/RequestDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminRequestDetail from './pages/admin/AdminRequestDetail';
import AdminDocuments from './pages/admin/AdminDocuments';
import ContactSupport from './pages/ContactSupport';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<ContactSupport />} />
        
        {/* User Protected Routes */}
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitRequest />} />
          <Route path="/request/:id" element={<RequestDetail />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/requests/:id" element={<AdminRequestDetail />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
