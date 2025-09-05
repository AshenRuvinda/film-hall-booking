// frontend/src/components/common/Navbar.js - COMPLETE NAVBAR COMPONENT
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  Film, 
  Calendar, 
  Settings, 
  BarChart3, 
  Building, 
  QrCode, 
  User, 
  LogOut, 
  Menu, 
  X,
  Ticket,
  Home
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActiveRoute(to) 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-300 hover:text-white hover:bg-gray-700'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );

  const getNavigationItems = () => {
    if (!user) return null;

    switch (user.role) {
      case 'user':
        return (
          <>
            <NavLink to="/user/dashboard" icon={Film}>Movies</NavLink>
            <NavLink to="/user/bookings" icon={Ticket}>My Bookings</NavLink>
          </>
        );
      case 'admin':
        return (
          <>
            <NavLink to="/admin/dashboard" icon={Home}>Dashboard</NavLink>
            <NavLink to="/admin/movies" icon={Film}>Movies</NavLink>
            <NavLink to="/admin/halls" icon={Building}>Halls</NavLink>
            <NavLink to="/admin/showtimes" icon={Calendar}>Showtimes</NavLink>
            <NavLink to="/admin/reports" icon={BarChart3}>Reports</NavLink>
          </>
        );
      case 'operator':
        return (
          <>
            <NavLink to="/operator/dashboard" icon={Home}>Dashboard</NavLink>
            <NavLink to="/operator/scan-ticket" icon={QrCode}>Scan Tickets</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={getDashboardLink()} 
            className="flex items-center space-x-3 text-xl font-bold hover:text-blue-400 transition-colors duration-200"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Film size={24} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Ticket.lk
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {user ? (
              <>
                <div className="flex items-center space-x-1 mr-6">
                  {getNavigationItems()}
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-4 border-l border-gray-600 pl-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-br from-green-500 to-blue-500 p-1.5 rounded-full">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {user ? (
              <>
                {/* User Info Mobile */}
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
                  <div className="bg-gradient-to-br from-green-500 to-blue-500 p-2 rounded-full">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {React.Children.map(getNavigationItems(), (child, index) => 
                    React.cloneElement(child, {
                      key: index,
                      onClick: () => setIsMobileMenuOpen(false),
                      className: `flex items-center space-x-3 w-full px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActiveRoute(child.props.to) 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`
                    })
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 mt-4"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white px-3 py-3 rounded-md transition-colors duration-200 hover:bg-gray-700"
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-3 py-3 rounded-md font-medium transition-all duration-200"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;