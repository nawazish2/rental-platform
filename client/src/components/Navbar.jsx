import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-xl text-blue-700">RentEase</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/browse" className="text-gray-600 hover:text-blue-600 font-medium">Browse</Link>

            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Get Started</Link>
              </>
            ) : (
              <>
                {user.role === 'tenant' && (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
                    <Link to="/support" className="text-gray-600 hover:text-blue-600 font-medium">Support</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin</Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    {user.name}
                  </span>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium text-sm">Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
