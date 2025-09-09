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
    
    // Check online status
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
        
        // Get hall occupancy data separately
        const hallsResponse = await fetch('/api/halls');
        const bookingsResponse = await fetch('/api/bookings');
        
        let hallOccupancyData = [];
        
        if (hallsResponse.ok && bookingsResponse.ok) {
          const halls = await hallsResponse.json();
          const bookings = await bookingsResponse.json();
          hallOccupancyData = calculateHallOccupancy(halls, bookings);
        }
        
        setDashboardData({
          ...data,
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
            results[endpoint.key] = await res.json();
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
      
      // Process the data
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
      
      // Set fallback data for demo purposes
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

  const calculateHallOccupancy = (halls, bookings) => {
    const hallBookings = {};
    
    halls.forEach(hall => {
      hallBookings[hall._id] = {
        name: hall.name,
        totalBookings: 0,
        totalSeats: 0,
        capacity: hall.totalSeats || 0
      };
    });

    bookings
      .filter(booking => ['confirmed', 'checked-in'].includes(booking.status))
      .forEach(booking => {
        if (booking.showtimeId && booking.showtimeId.hallId && hallBookings[booking.showtimeId.hallId._id || booking.showtimeId.hallId]) {
          const hallId = booking.showtimeId.hallId._id || booking.showtimeId.hallId;
          if (hallBookings[hallId]) {
            const seatCount = booking.seats ? booking.seats.length : 0;
            hallBookings[hallId].totalBookings++;
            hallBookings[hallId].totalSeats += seatCount;
          }
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

  const processData = (movies, halls, bookings, showtimes, users) => {
    const now = new Date();
    
    // Filter active showtimes
    const activeShowtimes = showtimes.filter(showtime => 
      new Date(showtime.endTime) > now
    );

    // Calculate total revenue
    const totalRevenue = bookings
      .filter(booking => ['confirmed', 'checked-in'].includes(booking.status))
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Process bookings by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString();
    });

    const bookingsByDate = {};
    const revenueByDate = {};
    
    last7Days.forEach(date => {
      bookingsByDate[date] = 0;
      revenueByDate[date] = 0;
    });

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toLocaleDateString();
      if (bookingsByDate.hasOwnProperty(bookingDate)) {
        bookingsByDate[bookingDate]++;
        if (['confirmed', 'checked-in'].includes(booking.status)) {
          revenueByDate[bookingDate] += booking.totalPrice || 0;
        }
      }
    });

    const bookingsData = last7Days.map(date => ({
      date: date.split('/').slice(0, 2).join('/'),
      bookings: bookingsByDate[date]
    }));

    const revenueData = last7Days.map(date => ({
      date: date.split('/').slice(0, 2).join('/'),
      revenue: revenueByDate[date]
    }));

    // Process booking status distribution
    const statusCount = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const bookingStatusData = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: bookings.length > 0 ? ((count / bookings.length) * 100).toFixed(1) : '0'
    }));

    // Calculate hall occupancy
    const hallOccupancyData = calculateHallOccupancy(halls, bookings);

    return {
      stats: {
        totalMovies: movies.length,
        totalHalls: halls.length,
        totalBookings: bookings.length,
        totalRevenue,
        activeShowtimes: activeShowtimes.length,
        totalUsers: users.length
      },
      bookingsData,
      revenueData,
      bookingStatusData,
      hallOccupancyData
    };
  };

  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
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
        
        {/* Error/Warning Banner */}
        {error && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-yellow-700 font-medium">Warning</p>
                <p className="text-yellow-600 text-sm">{error}</p>
                <div className="mt-2 text-sm text-yellow-600">
                  <p>Troubleshooting steps:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Ensure your backend server is running (typically on port 5000)</li>
                    <li>Check that MongoDB is connected</li>
                    <li>Verify API routes are properly configured</li>
                    <li>Check browser console for detailed error messages</li>
                  </ul>
                </div>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalMovies}</p>
            </div>
            <Film className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Halls</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHalls}</p>
            </div>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Showtimes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShowtimes}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <Ticket className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
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
            {bookingsData.length > 0 ? (
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
                  <p>No booking data available</p>
                  <p className="text-sm">Data will appear when bookings are made</p>
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
            {revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
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
                  <p>No revenue data available</p>
                  <p className="text-sm">Revenue will appear when bookings are confirmed</p>
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
            {bookingStatusData.length > 0 ? (
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
            {hallOccupancyData.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {hallOccupancyData.map((hall, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{hall.name}</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(hall.occupancy, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem]">{hall.occupancy}%</span>
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