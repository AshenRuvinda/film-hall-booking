// frontend/src/components/common/Navbar.js - ENHANCED VERSION
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const getNavigationItems = () => {
    if (!user) return null;

    switch (user.role) {
      case 'user':
        return (
          <>
            <Link to="/user/dashboard" className="hover:text-blue-200">Movies</Link>
            <Link to="/user/bookings" className="hover:text-blue-200">My Bookings</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/admin/movies" className="hover:text-blue-200">Movies</Link>
            <Link to="/admin/halls" className="hover:text-blue-200">Halls</Link>
            <Link to="/admin/showtimes" className="hover:text-blue-200">Showtimes</Link>
            <Link to="/admin/reports" className="hover:text-blue-200">Reports</Link>
          </>
        );
      case 'operator':
        return (
          <>
            <Link to="/operator/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/operator/scan-ticket" className="hover:text-blue-200">Scan Tickets</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="text-xl font-bold hover:text-blue-200">
            🎬 Film Hall Booking
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="hidden md:flex space-x-4">
                  {getNavigationItems()}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Welcome, <span className="font-medium">{user.name}</span>
                    <span className="ml-1 text-xs bg-blue-600 px-2 py-1 rounded">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  to="/login" 
                  className="hover:text-blue-200 px-3 py-2 rounded transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;