// frontend/src/pages/operator/Dashboard.js - ENHANCED UI VERSION
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { 
  QrCode,
  BarChart3,
  Search,
  Ticket,
  CheckCircle,
  Clock,
  MapPin,
  Film,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  ArrowRight,
  User,
  Mail,
  ChevronRight
} from 'lucide-react';

function OperatorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.get('/operator/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 3) {
      setError('Search query must be at least 3 characters');
      return;
    }

    try {
      setSearching(true);
      setError('');
      const response = await api.get(`/operator/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'checked-in': return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getShowtimeStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { text: 'Upcoming', color: 'text-blue-600 bg-blue-100' };
    if (now >= start && now <= end) return { text: 'Playing', color: 'text-green-600 bg-green-100' };
    return { text: 'Ended', color: 'text-gray-600 bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <div className="text-lg font-medium text-gray-900">Loading dashboard...</div>
          <p className="text-gray-500 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
                {user && (
                  <p className="text-gray-600 mt-1 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Welcome back, {user.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Link 
            to="/operator/scan-ticket"
            className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-xl mr-4">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Scan Tickets</h3>
                  <p className="text-blue-100 text-sm">Scan QR codes and check in customers</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </Link>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8 rounded-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-xl mr-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Today's Overview</h3>
                  <p className="text-emerald-100 text-sm">Monitor real-time statistics</p>
                </div>
              </div>
              <Eye className="h-6 w-6 opacity-70" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Today's Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.todaysBookings}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  Active bookings for today
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Checked In</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.checkedInToday}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {stats.todaysBookings > 0 ? 
                      Math.round((stats.checkedInToday / stats.todaysBookings) * 100) : 0
                    }%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1 text-green-500" />
                  Customers checked in today
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Upcoming Shows</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingShowtimes?.length || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Today</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                  Scheduled for today
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Search Bookings</h2>
          </div>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by booking ID, customer name, or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={searchQuery.length < 3 || searching}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Ticket className="h-4 w-4 mr-2" />
                  Search Results ({searchResults.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Ticket className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Booking #{booking._id.slice(-8)}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-3 w-3 mr-1" />
                              {booking.userId?.name}
                              <Mail className="h-3 w-3 ml-3 mr-1" />
                              {booking.userId?.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Film className="h-3 w-3 mr-1" />
                            {booking.showtimeId?.movieId?.title}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.showtimeId?.hallId?.name}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateTime(booking.showtimeId?.startTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery.length >= 3 && !searching && (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No bookings found</p>
              <p className="text-gray-500 text-sm">Try searching with different terms</p>
            </div>
          )}
        </div>

        {/* Upcoming Showtimes */}
        {stats?.upcomingShowtimes && stats.upcomingShowtimes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Showtimes Today</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stats.upcomingShowtimes.map((showtime) => {
                const status = getShowtimeStatus(showtime.startTime, showtime.endTime);
                return (
                  <div key={showtime._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Film className="h-4 w-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">{showtime.movieId?.title}</h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Hall: {showtime.hallId?.name}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(showtime.startTime) <= new Date() ? 'In Progress' : 'Starts Soon'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty States */}
        {stats && (!stats.upcomingShowtimes || stats.upcomingShowtimes.length === 0) && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No upcoming shows today</h3>
            <p className="text-gray-500">All scheduled shows have ended or there are no shows today</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OperatorDashboard;