// frontend/src/pages/user/MyBookings.js - ENHANCED VERSION
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/bookings');
      setBookings(res.data);
    } catch (error) {
      setError('Failed to fetch bookings');
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'checked-in':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    checkedIn: bookings.filter(b => b.status === 'checked-in').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-pink-300/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                🎬 My Bookings
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Track all your movie experiences in one place
              </p>
              {user && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                  <p className="text-lg text-white">
                    Welcome back, <span className="font-semibold text-yellow-300">{user.name}!</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-blue-100">Total Bookings</div>
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.confirmed}</div>
                <div className="text-sm text-green-100">Confirmed</div>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.checkedIn}</div>
                <div className="text-sm text-blue-100">Attended</div>
              </div>
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.cancelled}</div>
                <div className="text-sm text-red-100">Cancelled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/user/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Movies
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings', count: stats.total },
              { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
              { key: 'checked-in', label: 'Attended', count: stats.checkedIn },
              { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  filter === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label} {count > 0 && <span className="ml-1">({count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const showDateTime = formatDateTime(booking.showtimeId?.startTime);
              const bookingDate = formatDateTime(booking.createdAt);
              
              return (
                <div key={booking._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="md:flex">
                    {/* Movie Poster */}
                    <div className="md:w-48 h-48 md:h-auto relative">
                      {booking.showtimeId?.movieId?.poster ? (
                        <img
                          src={booking.showtimeId.movieId.poster}
                          alt={booking.showtimeId?.movieId?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400/6B7280/FFFFFF?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17M7 4H17M9 9H15M9 13H15" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Booked on {bookingDate.date}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">${booking.totalPrice}</div>
                          <div className="text-sm text-gray-500">Total Amount</div>
                        </div>
                      </div>

                      {/* Movie Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Showtime Info */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Showtime
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Date:</span> {showDateTime.date}</p>
                            <p className="text-sm"><span className="font-medium">Time:</span> {showDateTime.time}</p>
                            <p className="text-sm"><span className="font-medium">Hall:</span> {booking.showtimeId?.hallId?.name || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Seats Info */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Seats
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Count:</span> {booking.seats?.length || 0} seat(s)</p>
                            <p className="text-sm"><span className="font-medium">Numbers:</span></p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.seats?.map((seat, index) => (
                                <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {seat.seatNumber || seat}
                                </span>
                              )) || <span className="text-gray-500">No seats</span>}
                            </div>
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Booking Details
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">ID:</span> <span className="font-mono">{booking._id?.slice(-8)}</span></p>
                            <p className="text-sm"><span className="font-medium">Price per seat:</span> ${(booking.totalPrice / (booking.seats?.length || 1)).toFixed(2)}</p>
                            {booking.checkedInAt && (
                              <p className="text-sm">
                                <span className="font-medium">Checked in:</span> {formatDateTime(booking.checkedInAt).date} at {formatDateTime(booking.checkedInAt).time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        <Link
                          to={`/user/booking-summary/${booking._id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details & QR Code
                        </Link>
                        
                        {booking.status === 'confirmed' && new Date(booking.showtimeId?.startTime) > new Date() && (
                          <button className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't made any movie bookings yet." 
                  : `You don't have any ${filter} bookings.`
                }
              </p>
              <Link
                to="/user/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17M7 4H17M9 9H15M9 13H15" />
                </svg>
                Book Your First Movie
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;