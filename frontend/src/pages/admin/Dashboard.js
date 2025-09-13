import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Building2, 
  Calendar, 
  BarChart3, 
  Users, 
  Ticket,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalMovies: 0,
      totalHalls: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeShowtimes: 0,
      totalUsers: 0
    },
    bookingsData: [],
    revenueData: [],
    bookingStatusData: [],
    hallOccupancyData: [],
    loading: true,
    error: null,
    isOffline: false
  });

  useEffect(() => {
    fetchDashboardData();
    
    const handleOnline = () => {
      setDashboardData(prev => ({ ...prev, isOffline: false }));
      fetchDashboardData();
    };
    
    const handleOffline = () => {
      setDashboardData(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // First try the optimized stats endpoint
      let response = await fetch('/api/stats');
      
      if (response.ok) {
        const data = await response.json();
        
        const stats = data.stats || {
          totalMovies: 0,
          totalHalls: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeShowtimes: 0,
          totalUsers: 0
        };
        
        // Get additional data for charts
        let hallOccupancyData = [];
        let bookingsData = [];
        let revenueData = [];
        let bookingStatusData = [];
        
        try {
          const [hallsRes, bookingsRes] = await Promise.all([
            fetch('/api/halls'),
            fetch('/api/bookings')
          ]);
          
          if (hallsRes.ok && bookingsRes.ok) {
            const halls = await hallsRes.json();
            const bookings = await bookingsRes.json();
            
            console.log(`Fetched ${Array.isArray(bookings) ? bookings.length : 0} bookings for processing`);
            
            // Process the chart data
            const chartData = processChartData(bookings);
            bookingsData = chartData.bookingsData;
            revenueData = chartData.revenueData;
            bookingStatusData = chartData.bookingStatusData;
            
            hallOccupancyData = calculateHallOccupancy(halls, bookings);
          }
        } catch (error) {
          console.warn('Error fetching additional chart data:', error);
        }
        
        setDashboardData({
          stats,
          bookingsData,
          revenueData,
          bookingStatusData,
          hallOccupancyData,
          loading: false,
          error: null,
          isOffline: false
        });
        return;
      }
      
      // Fallback to individual endpoints
      console.log('Stats endpoint not available, trying individual endpoints...');
      
      const endpoints = [
        { url: '/api/movies', key: 'movies' },
        { url: '/api/halls', key: 'halls' },
        { url: '/api/bookings', key: 'bookings' },
        { url: '/api/showtimes', key: 'showtimes' },
        { url: '/api/users', key: 'users' }
      ];
      
      const results = {};
      let hasErrors = false;
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint.url);
          if (res.ok) {
            const data = await res.json();
            results[endpoint.key] = Array.isArray(data) ? data : [];
          } else {
            console.warn(`Failed to fetch ${endpoint.key}: ${res.status}`);
            results[endpoint.key] = [];
            hasErrors = true;
          }
        } catch (error) {
          console.warn(`Error fetching ${endpoint.key}:`, error);
          results[endpoint.key] = [];
          hasErrors = true;
        }
      }
      
      if (Object.keys(results).length === 0) {
        throw new Error('No API endpoints are available. Please check your backend server.');
      }
      
      const processedData = processData(
        results.movies || [],
        results.halls || [],
        results.bookings || [],
        results.showtimes || [],
        results.users || []
      );
      
      setDashboardData({
        ...processedData,
        loading: false,
        error: hasErrors ? 'Some data may be incomplete due to API issues.' : null,
        isOffline: false
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      const fallbackData = {
        stats: {
          totalMovies: 0,
          totalHalls: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeShowtimes: 0,
          totalUsers: 0
        },
        bookingsData: [],
        revenueData: [],
        bookingStatusData: [],
        hallOccupancyData: [],
        loading: false,
        error: 'Unable to connect to the backend server. Please ensure your backend is running on the correct port.',
        isOffline: !navigator.onLine
      };
      
      setDashboardData(fallbackData);
    }
  };

  const processChartData = (bookings = []) => {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      console.log('No bookings data provided to processChartData');
      return {
        bookingsData: [],
        revenueData: [],
        bookingStatusData: []
      };
    }

    console.log(`Processing ${bookings.length} bookings for chart data`);

    // Generate last 7 days array with consistent date formatting
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use ISO date string (YYYY-MM-DD) for consistent comparison
      last7Days.push(date.toISOString().split('T')[0]);
    }

    console.log('Last 7 days range:', last7Days);

    // Initialize data structures
    const bookingsByDate = {};
    const revenueByDate = {};
    
    last7Days.forEach(date => {
      bookingsByDate[date] = 0;
      revenueByDate[date] = 0;
    });

    // Process each booking
    let processedCount = 0;
    bookings.forEach(booking => {
      try {
        if (booking && booking.createdAt) {
          // Extract date from booking creation time
          const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
          
          // Check if this booking falls within our 7-day range
          if (bookingsByDate.hasOwnProperty(bookingDate)) {
            bookingsByDate[bookingDate]++;
            processedCount++;
            
            // Add revenue if booking is confirmed
            if (['confirmed', 'checked-in'].includes(booking.status)) {
              const price = booking.totalPrice || booking.totalAmount || 0;
              revenueByDate[bookingDate] += typeof price === 'number' ? price : 0;
            }
          }
        }
      } catch (error) {
        console.warn('Error processing booking date:', error);
      }
    });

    console.log(`Processed ${processedCount} bookings within date range`);
    console.log('Bookings by date:', bookingsByDate);
    console.log('Revenue by date:', revenueByDate);

    // Convert to chart format
    const bookingsData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      bookings: bookingsByDate[date] || 0
    }));

    const revenueData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      revenue: revenueByDate[date] || 0
    }));

    // Process booking status distribution
    const statusCount = bookings.reduce((acc, booking) => {
      try {
        const status = booking && booking.status ? booking.status : 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      } catch (error) {
        console.warn('Error processing booking status:', error);
        return acc;
      }
    }, {});

    const bookingStatusData = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: bookings.length > 0 ? ((count / bookings.length) * 100).toFixed(1) : '0'
    }));

    console.log('Final chart data:', {
      bookingsData: bookingsData.filter(d => d.bookings > 0).length,
      revenueData: revenueData.filter(d => d.revenue > 0).length,
      bookingStatusData: bookingStatusData.length
    });

    return {
      bookingsData,
      revenueData,
      bookingStatusData
    };
  };

  const calculateHallOccupancy = (halls = [], bookings = []) => {
    if (!Array.isArray(halls) || !Array.isArray(bookings)) {
      console.warn('calculateHallOccupancy: Invalid input parameters');
      return [];
    }

    const hallBookings = {};
    
    halls.forEach(hall => {
      if (hall && hall._id) {
        hallBookings[hall._id] = {
          name: hall.name || 'Unknown Hall',
          totalBookings: 0,
          totalSeats: 0,
          capacity: hall.totalSeats || 0
        };
      }
    });

    bookings
      .filter(booking => booking && ['confirmed', 'checked-in'].includes(booking.status))
      .forEach(booking => {
        try {
          if (booking.showtimeId && booking.showtimeId.hallId) {
            const hallId = booking.showtimeId.hallId._id || booking.showtimeId.hallId;
            if (hallBookings[hallId]) {
              const seatCount = Array.isArray(booking.seats) ? booking.seats.length : 0;
              hallBookings[hallId].totalBookings++;
              hallBookings[hallId].totalSeats += seatCount;
            }
          }
        } catch (error) {
          console.warn('Error processing booking for hall occupancy:', error);
        }
      });

    return Object.values(hallBookings)
      .filter(hall => hall.capacity > 0)
      .map(hall => ({
        name: hall.name,
        bookings: hall.totalBookings,
        bookedSeats: hall.totalSeats,
        capacity: hall.capacity,
        occupancy: hall.capacity > 0 ? 
          Math.min(((hall.totalSeats / hall.capacity) * 100), 100).toFixed(1) : '0'
      }));
  };

  const processData = (movies = [], halls = [], bookings = [], showtimes = [], users = []) => {
    const safeMovies = Array.isArray(movies) ? movies : [];
    const safeHalls = Array.isArray(halls) ? halls : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const safeShowtimes = Array.isArray(showtimes) ? showtimes : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const now = new Date();
    
    const activeShowtimes = safeShowtimes.filter(showtime => {
      try {
        return showtime && showtime.endTime && new Date(showtime.endTime) > now;
      } catch (error) {
        console.warn('Error filtering showtime:', error);
        return false;
      }
    });

    const totalRevenue = safeBookings
      .filter(booking => booking && ['confirmed', 'checked-in'].includes(booking.status))
      .reduce((sum, booking) => {
        const price = booking.totalPrice || booking.totalAmount || 0;
        return sum + (typeof price === 'number' ? price : 0);
      }, 0);

    // Process chart data
    const chartData = processChartData(safeBookings);
    const hallOccupancyData = calculateHallOccupancy(safeHalls, safeBookings);

    return {
      stats: {
        totalMovies: safeMovies.length,
        totalHalls: safeHalls.length,
        totalBookings: safeBookings.length,
        totalRevenue,
        activeShowtimes: activeShowtimes.length,
        totalUsers: safeUsers.length
      },
      ...chartData,
      hallOccupancyData
    };
  };

  const getStatusColor = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'checked-in': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  const { stats, bookingsData, revenueData, bookingStatusData, hallOccupancyData, error, isOffline } = dashboardData;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of your cinema management system</p>
          </div>
          <div className="flex items-center space-x-4">
            {isOffline ? (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-5 h-5 mr-2" />
                <span className="text-sm">Offline</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <Wifi className="w-5 h-5 mr-2" />
                <span className="text-sm">Online</span>
              </div>
            )}
            <button 
              onClick={fetchDashboardData}
              disabled={dashboardData.loading}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 rounded-md text-sm flex items-center transition-colors"
            >
              <Activity className="w-4 h-4 mr-2" />
              {dashboardData.loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-yellow-700 font-medium">Warning</p>
                <p className="text-yellow-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Movies</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalMovies || 0}</p>
            </div>
            <Film className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Halls</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalHalls || 0}</p>
            </div>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Showtimes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeShowtimes || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
            </div>
            <Ticket className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bookings Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Bookings Trend (Last 7 Days)</h3>
          </div>
          <div className="h-64">
            {Array.isArray(bookingsData) && bookingsData.length > 0 && bookingsData.some(d => d.bookings > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No booking data available for charts</p>
                  <p className="text-sm">This may indicate a date processing issue</p>
                  {bookingsData && bookingsData.length > 0 && (
                    <p className="text-xs mt-2">({bookingsData.length} data points found, but all zeros)</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 7 Days)</h3>
          </div>
          <div className="h-64">
            {Array.isArray(revenueData) && revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No revenue data available for charts</p>
                  <p className="text-sm">Revenue appears when bookings are confirmed</p>
                  {revenueData && revenueData.length > 0 && (
                    <p className="text-xs mt-2">({revenueData.length} data points found, but all zeros)</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Booking Status Distribution</h3>
          </div>
          <div className="h-64">
            {Array.isArray(bookingStatusData) && bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, percentage }) => `${status} (${percentage}%)`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No booking status data available</p>
                  <p className="text-sm">Status distribution will appear when bookings exist</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hall Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Hall Occupancy</h3>
          </div>
          <div className="h-64">
            {Array.isArray(hallOccupancyData) && hallOccupancyData.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {hallOccupancyData.map((hall, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{hall.name || 'Unknown Hall'}</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(parseFloat(hall.occupancy) || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem]">{hall.occupancy || '0'}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hall occupancy data available</p>
                  <p className="text-sm">Occupancy data will appear when halls have bookings</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/movies" 
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
          >
            <Film className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h4 className="font-medium text-gray-900">Manage Movies</h4>
              <p className="text-sm text-gray-600">Add, edit, or remove movies</p>
            </div>
          </Link>

          <Link 
            to="/admin/halls" 
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
          >
            <Building2 className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h4 className="font-medium text-gray-900">Manage Halls</h4>
              <p className="text-sm text-gray-600">Configure cinema halls</p>
            </div>
          </Link>

          <Link 
            to="/admin/showtimes" 
            className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 group"
          >
            <Calendar className="w-8 h-8 text-yellow-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h4 className="font-medium text-gray-900">Manage Showtimes</h4>
              <p className="text-sm text-gray-600">Schedule movie showtimes</p>
            </div>
          </Link>

          <Link 
            to="/admin/reports" 
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-600">Detailed analytics & reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;