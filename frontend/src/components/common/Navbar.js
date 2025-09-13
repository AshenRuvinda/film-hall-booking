// frontend/src/components/common/Navbar.js - COMPLETE VERSION WITH THEATERS LINK
import React, { useContext, useState, useRef, useEffect } from 'react';
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
  Home,
  Info,
  ChevronDown,
  Star,
  Search,
  FileText,
  Shield,
  RefreshCw,
  Phone
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef(null);
  const helpDropdownRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target)) {
        setIsHelpDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
        isActiveRoute(to) 
          ? 'text-white bg-white/10' 
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );

  const getNavigationItems = () => {
    if (!user) return null;

    switch (user.role) {
      case 'user':
        return (
          <>
            <NavLink to="/user/dashboard">Movies</NavLink>
            <NavLink to="/user/theaters">Theaters</NavLink>
            <NavLink to="/user/bookings">My Tickets</NavLink>
            <NavLink to="/user/about">About</NavLink>
          </>
        );
      case 'admin':
        return (
          <>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
            <NavLink to="/admin/movies">Movies</NavLink>
            <NavLink to="/admin/halls">Halls</NavLink>
            <NavLink to="/admin/showtimes">Showtimes</NavLink>
            <NavLink to="/admin/reports">Reports</NavLink>
          </>
        );
      case 'operator':
        return (
          <>
            <NavLink to="/operator/dashboard">Dashboard</NavLink>
            <NavLink to="/operator/scan-ticket">Scan Tickets</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileDropdownOpen(false);
    setIsHelpDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsHelpDropdownOpen(false);
  };

  const toggleHelpDropdown = () => {
    setIsHelpDropdownOpen(!isHelpDropdownOpen);
    setIsProfileDropdownOpen(false);
  };

  // Get user initials for profile icon
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const helpMenuItems = [
    { to: '/support/terms', icon: FileText, label: 'Terms & Conditions' },
    { to: '/support/privacy', icon: Shield, label: 'Privacy Policy' },
    { to: '/support/refund', icon: RefreshCw, label: 'Refund Policy' },
    { to: '/support/contact', icon: Phone, label: 'Contact Us' }
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md border-b border-white/10' 
          : 'bg-black/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link 
              to={getDashboardLink()} 
              className="flex items-center group"
            >
              <img 
                src="/logo.png" 
                alt="CINEMALK" 
                className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {user && (
                <div className="flex items-center space-x-1 mr-8">
                  {getNavigationItems()}
                </div>
              )}

              {user ? (
                <>
                  {/* Help Dropdown */}
                  <div className="relative mr-4" ref={helpDropdownRef}>
                    <button 
                      onClick={toggleHelpDropdown}
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                      <span>Help</span>
                      <ChevronDown size={14} className={`transform transition-transform duration-200 ${
                        isHelpDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Help Dropdown Menu */}
                    {isHelpDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-2xl py-2 z-50">
                        {helpMenuItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsHelpDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon size={14} className="mr-3" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all duration-200"
                    >
                      <User size={16} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-black border border-white/20 rounded-lg shadow-2xl py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="text-white font-medium text-sm">{user.name}</div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                          <div className="text-gray-400 text-xs capitalize mt-1">{user.role} Account</div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {user.role === 'user' && (
                            <>
                              <Link
                                to="/user/bookings"
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Ticket size={14} className="mr-3" />
                                My Bookings
                              </Link>
                              
                              <Link
                                to="/user/profile"
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <User size={14} className="mr-3" />
                                Profile
                              </Link>
                              
                              <Link
                                to="/user/settings"
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Settings size={14} className="mr-3" />
                                Settings
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-white/10 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={14} className="mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Help Dropdown for Non-authenticated Users */}
                  <div className="relative mr-4" ref={helpDropdownRef}>
                    <button 
                      onClick={toggleHelpDropdown}
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                      <span>Help</span>
                      <ChevronDown size={14} className={`transform transition-transform duration-200 ${
                        isHelpDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Help Dropdown Menu */}
                    {isHelpDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-2xl py-2 z-50">
                        {helpMenuItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsHelpDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon size={14} className="mr-3" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10">
            <div className="px-6 py-4 space-y-2">
              {user ? (
                <>
                  {/* User Info Mobile */}
                  <div className="pb-4 border-b border-white/10">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                    <div className="text-gray-400 text-xs capitalize mt-1">{user.role} Account</div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="space-y-1 py-2">
                    {React.Children.map(getNavigationItems(), (child, index) => 
                      React.cloneElement(child, {
                        key: index,
                        onClick: () => setIsMobileMenuOpen(false),
                        className: `block w-full text-left px-0 py-2 text-sm font-medium transition-colors ${
                          isActiveRoute(child.props.to) 
                            ? 'text-white' 
                            : 'text-gray-300 hover:text-white'
                        }`
                      })
                    )}
                  </div>

                  {/* Mobile Menu Items */}
                  {user.role === 'user' && (
                    <div className="space-y-1 py-2 border-t border-white/10">
                      <Link
                        to="/user/bookings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/user/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/user/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        Settings
                      </Link>
                    </div>
                  )}

                  {/* Help Section Mobile */}
                  <div className="space-y-1 py-2 border-t border-white/10">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Help & Support</div>
                    {helpMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-0 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {/* Help Section Mobile for Non-authenticated Users */}
                  <div className="space-y-1 pb-4 border-b border-white/10">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Help & Support</div>
                    {helpMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-0 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-0 py-2 text-sm font-medium text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-14"></div>
    </>
  );
}

export default Navbar;