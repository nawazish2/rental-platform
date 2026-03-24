import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const avatarInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-extrabold text-xl text-blue-700">RentEase</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/browse" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Browse</Link>

            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors">Get Started</Link>
              </>
            ) : (
              <>
                {user.role === 'tenant' && (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Dashboard</Link>
                    <Link to="/support" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Support</Link>
                  </>
                )}
                {user.role === 'owner' && (
                  <Link to="/owner" className="text-gray-600 hover:text-blue-600 font-medium text-sm">My Listings</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Admin</Link>
                )}

                <NotificationBell />

                {/* Profile dropdown */}
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1 transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {avatarInitials}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-600 font-medium text-sm transition-colors">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
