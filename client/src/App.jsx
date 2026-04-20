import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import PropertyDetail from './pages/PropertyDetail';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import OwnerDashboard from './pages/OwnerDashboard';

// Tenant Pages
import TenantDashboard from './pages/TenantDashboard';
import MoveIn from './pages/MoveIn';
import SupportTickets from './pages/SupportTickets';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminVisits from './pages/admin/AdminVisits';
import AdminTickets from './pages/admin/AdminTickets';
import AdminMoveOut from './pages/admin/AdminMoveOut';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />

            {/* Tenant */}
            <Route path="/dashboard" element={<ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>} />
            <Route path="/movein/:id" element={<ProtectedRoute role="tenant"><MoveIn /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute role="tenant"><SupportTickets /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/listings" element={<ProtectedRoute role="admin"><AdminListings /></ProtectedRoute>} />
            <Route path="/admin/visits" element={<ProtectedRoute role="admin"><AdminVisits /></ProtectedRoute>} />
            <Route path="/admin/tickets" element={<ProtectedRoute role="admin"><AdminTickets /></ProtectedRoute>} />
            <Route path="/admin/moveout" element={<ProtectedRoute role="admin"><AdminMoveOut /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<div className="min-h-screen flex flex-col items-center justify-center text-gray-400"><span className="text-6xl mb-4">🏚️</span><h2 className="text-2xl font-bold">Page not found</h2><a href="/" className="mt-4 text-blue-600 hover:underline">Go Home</a></div>} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
