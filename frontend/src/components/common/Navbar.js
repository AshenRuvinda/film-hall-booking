// frontend/src/components/common/Navbar.js - WHITE NAVBAR FOR FILM TICKET BOOKING
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
  MapPin,
  Clock,
  Popcorn,
  Camera,
  Play,
  Sparkles,
  CheckCircle,
  Plus,
  Crown,
  Zap,
  Shield
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef(null);
  const subscriptionDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (subscriptionDropdownRef.current && !subscriptionDropdownRef.current.contains(event.target)) {
        setIsSubscriptionDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
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

  const NavLink = ({ to, icon: Icon, children, onClick, badge = null, isSpecial = false }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 group ${
        isActiveRoute(to) 
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 transform scale-105' 
          : isSpecial
            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border border-yellow-300 hover:border-yellow-400'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} className={`${isActiveRoute(to) ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
      <span>{children}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
          {badge}
        </span>
      )}
    </Link>
  );

  const getNavigationItems = () => {
    if (!user) return null;

    switch (user.role) {
      case 'user':
        return (
          <>
            <NavLink to="/user/dashboard" icon={Film}>Movies</NavLink>
            <NavLink to="/user/about" icon={Info}>About Us</NavLink>
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
    setIsProfileDropdownOpen(false);
    setIsSubscriptionDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsSubscriptionDropdownOpen(false);
  };

  const toggleSubscriptionDropdown = () => {
    setIsSubscriptionDropdownOpen(!isSubscriptionDropdownOpen);
    setIsProfileDropdownOpen(false);
  };

  // Get user initials for profile icon
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Subscription plans data
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'LKR 999',
      period: '/month',
      icon: Shield,
      color: 'blue',
      features: [
        'Book up to 5 tickets per month',
        'Standard booking fees',
        'Email notifications',
        'Basic customer support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'LKR 1,999',
      period: '/month',
      icon: Crown,
      color: 'purple',
      popular: true,
      features: [
        'Unlimited ticket booking',
        'No booking fees',
        'Priority seat selection',
        'SMS & Email notifications',
        'Premium customer support',
        'Early access to new movies'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 'LKR 2,999',
      period: '/month',
      icon: Zap,
      color: 'gold',
      features: [
        'Everything in Premium',
        'Free concessions (popcorn & drinks)',
        'VIP lounge access',
        'Dedicated concierge',
        'Private screenings access',
        'Movie premiere invitations'
      ]
    }
  ];

  const handleSubscriptionPurchase = (planId) => {
    // Handle subscription purchase logic here
    console.log('Purchasing subscription plan:', planId);
    setIsSubscriptionDropdownOpen(false);
    // You can navigate to payment page or show payment modal
    // navigate(`/subscription/checkout/${planId}`);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 shadow-sm'
      }`}>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <Link 
              to={getDashboardLink()} 
              className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <div className="bg-black p-3 rounded-2xl shadow-xl">
                  <Film size={28} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-black" style={{fontFamily: 'Orbitron, monospace'}}>
                  Ticket.LK
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider">
                  by AshenRuvinda©
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              

              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    {getNavigationItems()}
                  </div>
                  
                  {/* Subscription Plans Button */}
                  <div className="relative" ref={subscriptionDropdownRef}>
                    <button 
                      onClick={toggleSubscriptionDropdown}
                      className="relative p-3 text-gray-600 hover:text-purple-600 transition-colors duration-200 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 group"
                    >
                      <div className="relative">
                        <CheckCircle size={20} className="text-green-500" />
                        <Plus size={12} className="absolute -top-1 -right-1 text-purple-600 bg-white rounded-full" />
                      </div>
                    </button>

                    {/* Subscription Plans Dropdown */}
                    {isSubscriptionDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50 overflow-hidden">
                        <div className="px-4 pb-3 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900">Choose Your Plan</h3>
                          <p className="text-sm text-gray-500">Upgrade for premium features</p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {subscriptionPlans.map((plan) => {
                            const IconComponent = plan.icon;
                            return (
                              <div 
                                key={plan.id} 
                                className={`relative mx-3 my-3 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                                  plan.popular 
                                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {plan.popular && (
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      Most Popular
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      plan.color === 'blue' ? 'bg-blue-100' :
                                      plan.color === 'purple' ? 'bg-purple-100' :
                                      'bg-yellow-100'
                                    }`}>
                                      <IconComponent size={20} className={
                                        plan.color === 'blue' ? 'text-blue-600' :
                                        plan.color === 'purple' ? 'text-purple-600' :
                                        'text-yellow-600'
                                      } />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900">{plan.name}</h4>
                                      <div className="flex items-baseline space-x-1">
                                        <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-sm text-gray-500">{plan.period}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <ul className="space-y-2 mb-4">
                                  {plan.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                  {plan.features.length > 3 && (
                                    <li className="text-sm text-gray-500 ml-6">
                                      +{plan.features.length - 3} more features
                                    </li>
                                  )}
                                </ul>
                                
                                <button
                                  onClick={() => handleSubscriptionPurchase(plan.id)}
                                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
                                    plan.popular
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  Choose {plan.name}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 group"
                    >
                      {/* Enhanced Profile Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {getUserInitials()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role} 
                        </div>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-500 transition-all duration-300 group-hover:text-red-600 ${
                          isProfileDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                              {getUserInitials()}
                            </div>
                            <div>
                              <div className="text-gray-900 font-semibold">{user.name}</div>
                              <div className="text-gray-500 text-sm">{user.email}</div>
                              
                            </div>
                          </div>
                        </div>

                      

                        {/* Menu Items */}
                        <div className="py-2">
                          {user.role === 'user' && (
                            <>
                              <Link
                                to="/user/bookings"
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <Ticket size={16} className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">My Bookings</div>
                                  <div className="text-xs text-gray-500">View your tickets</div>
                                </div>
                              </Link>
                              
                              
                            </>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut size={16} />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">Sign Out</div>
                              <div className="text-xs text-red-500">See you next time!</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 font-semibold"
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5"
                  >
                    <span>Get Started</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="relative p-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute inset-0 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'}`}>
                    <Menu size={24} />
                  </span>
                  <span className={`absolute inset-0 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'}`}>
                    <X size={24} />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700" style={{backgroundColor: '#112636'}}>
            <div className="px-4 pt-6 pb-8 space-y-4">
              {/* Mobile Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 outline-none"
                />
              </div>

              {user ? (
                <>
                  {/* Enhanced User Info Mobile */}
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-xl">
                          {getUserInitials()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {user.role} Member
                        </div>
                        <div className="text-xs text-yellow-600 font-medium">
                          2,450 reward points
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={toggleSubscriptionDropdown}
                      className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors bg-gray-50 rounded-lg"
                    >
                      <div className="relative">
                        <CheckCircle size={20} className="text-green-500" />
                        <Plus size={12} className="absolute -top-1 -right-1 text-purple-600 bg-white rounded-full" />
                      </div>
                    </button>
                  </div>

                  {/* Mobile Subscription Plans */}
                  {isSubscriptionDropdownOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" style={{ marginTop: '-80px' }}>
                      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        {/* Mobile Modal Header */}
                        <div className="relative px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          <button
                            onClick={() => setIsSubscriptionDropdownOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                          >
                            <X size={20} />
                          </button>
                          <div className="text-center pr-8">
                            <h2 className="text-xl font-bold mb-1">Choose Your Plan</h2>
                            <p className="text-purple-100 text-sm">Upgrade your experience</p>
                          </div>
                        </div>

                        {/* Mobile Plans Container */}
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
                          {subscriptionPlans.map((plan) => {
                            const IconComponent = plan.icon;
                            return (
                              <div 
                                key={plan.id} 
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                  plan.popular 
                                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50' 
                                    : 'border-gray-200'
                                }`}
                              >
                                {plan.popular && (
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      Most Popular
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      plan.color === 'blue' ? 'bg-blue-100' :
                                      plan.color === 'purple' ? 'bg-purple-100' :
                                      'bg-yellow-100'
                                    }`}>
                                      <IconComponent size={20} className={
                                        plan.color === 'blue' ? 'text-blue-600' :
                                        plan.color === 'purple' ? 'text-purple-600' :
                                        'text-yellow-600'
                                      } />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900">{plan.name}</h4>
                                      <div className="flex items-baseline space-x-1">
                                        <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-sm text-gray-500">{plan.period}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                  {plan.features.slice(0, 3).map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm text-gray-600">{feature}</span>
                                    </div>
                                  ))}
                                  {plan.features.length > 3 && (
                                    <p className="text-sm text-gray-500 ml-6">
                                      +{plan.features.length - 3} more features
                                    </p>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => handleSubscriptionPurchase(plan.id)}
                                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm ${
                                    plan.popular
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                                      : plan.color === 'gold'
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  Choose {plan.name}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    {React.Children.map(getNavigationItems(), (child, index) => 
                      React.cloneElement(child, {
                        key: index,
                        onClick: () => setIsMobileMenuOpen(false),
                        className: `flex items-center justify-between w-full px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActiveRoute(child.props.to) 
                            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      })
                    )}

                    {/* My Bookings for mobile (user role only) */}
                    {user.role === 'user' && (
                      <Link
                        to="/user/bookings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between w-full px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActiveRoute('/user/bookings') 
                            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Ticket size={18} />
                          <span>My Bookings</span>
                        </div>
                        <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          3
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Mobile Quick Actions */}
                  {user.role === 'user' && (
                    <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-200">
                      <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <span className="text-sm text-gray-700">Rewards</span>
                      </button>
                      <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Settings className="w-6 h-6 text-purple-500" />
                        <span className="text-sm text-gray-700">Settings</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-3 w-full bg-red-50 border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-100 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 mt-4"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full text-gray-700 hover:text-gray-900 px-4 py-4 rounded-xl transition-all duration-200 hover:bg-gray-100 font-semibold"
                  >
                    <User size={18} />
                    <span>Sign In</span>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                  >
                    <span>Get Started Free</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Proper spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
}

export default Navbar;