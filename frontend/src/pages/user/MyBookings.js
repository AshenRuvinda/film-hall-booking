// frontend/src/pages/user/MyBookings.js - ENHANCED COMPONENT
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getSeatDisplayText, getSeatType, formatSeatList, getTotalSeatsByType } from '../../utils/seatUtils';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/bookings');
      console.log('Fetched bookings:', res.data);
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
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'checked-in':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'checked-in':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isUpcoming = (showtime) => {
    return new Date(showtime) > new Date();
  };

  const isPast = (showtime) => {
    return new Date(showtime) < new Date();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status !== 'cancelled' && isUpcoming(booking.showtimeId?.startTime);
    if (filter === 'past') return isPast(booking.showtimeId?.startTime);
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-indigo-400 animate-pulse mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Loading your bookings</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your tickets</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-white">My Bookings</h1>
                </div>
                <p className="text-xl text-indigo-100">Manage and track your movie reservations</p>
                <div className="flex items-center mt-2 text-indigo-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">All your cinema experiences in one place</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/user/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Book New Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Filter Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex border border-gray-100">
            {[
              { 
                key: 'all', 
                label: 'All Bookings', 
                count: bookings.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                )
              },
              { 
                key: 'upcoming', 
                label: 'Upcoming', 
                count: bookings.filter(b => b.status !== 'cancelled' && isUpcoming(b.showtimeId?.startTime)).length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                key: 'past', 
                label: 'Past', 
                count: bookings.filter(b => isPast(b.showtimeId?.startTime)).length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              },
              { 
                key: 'cancelled', 
                label: 'Cancelled', 
                count: bookings.filter(b => b.status === 'cancelled').length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === tab.key 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">Unable to load bookings</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {filteredBookings.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="relative inline-flex">
              <div className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {filter === 'all' 
                ? "Ready to experience the magic of cinema? Book your first movie ticket today." 
                : `You don't have any ${filter} bookings at the moment.`}
            </p>
            <Link
              to="/user/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l7-4 7 4V4z" />
              </svg>
              Discover Movies
            </Link>
          </div>
        )}

        {/* Enhanced Bookings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredBookings.map((booking) => {
            const formattedSeats = formatSeatList(booking.seats);
            const regularSeats = getTotalSeatsByType(booking.seats, 'regular');
            const boxSeats = getTotalSeatsByType(booking.seats, 'box');

            return (
              <div key={booking._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
                {/* Enhanced Booking Header */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
                  <div className="relative p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <div className="p-1.5 bg-white bg-opacity-20 rounded-lg mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold truncate">
                            {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
                          </h3>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h-2M9 7h6m-6 4h6m-6 4h6" />
                          </svg>
                          <span className="text-sm font-medium">
                            {booking.showtimeId?.hallId?.name || 'Unknown Hall'}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1.5">
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center text-gray-400 mb-1">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium">Showtime</span>
                        </div>
                        <p className="font-semibold text-sm">
                          {booking.showtimeId?.startTime 
                            ? formatDateTime(booking.showtimeId.startTime)
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-400 mb-1">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4m4-4v4M5 10h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                          </svg>
                          <span className="text-xs font-medium">Booked</span>
                        </div>
                        <p className="font-semibold text-sm">{formatDateTime(booking.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Booking Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Enhanced Seats Display */}
                    <div>
                      <div className="flex items-center mb-3">
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">
                          Seats ({formattedSeats.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formattedSeats.slice(0, 4).map((seat, index) => (
                          <div
                            key={seat.id}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              seat.type === 'box' 
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' 
                                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {seat.type === 'box' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {seat.displayText}
                          </div>
                        ))}
                        {formattedSeats.length > 4 && (
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {formattedSeats.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Price Display */}
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-3">
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          ${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Seat Type Breakdown */}
                  {(regularSeats > 0 || boxSeats > 0) && (
                    <div className="flex items-center gap-4 mb-6 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      {regularSeats > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="font-medium">Regular: {regularSeats}</span>
                        </div>
                      )}
                      {boxSeats > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                          <span className="font-medium">Premium Box: {boxSeats}</span>
                          <svg className="w-3 h-3 ml-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enhanced Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={`/user/booking-summary/${booking._id}`}
                      className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl group"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Link>
                    
                    {booking.qrCode && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = booking.qrCode;
                          link.download = `ticket-${booking._id}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
                        title="Download QR Code"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Enhanced Check-in Status */}
                  {booking.checkedInAt && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center">
                        <div className="p-1 bg-emerald-100 rounded-full mr-3">
                          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-emerald-800">
                          Successfully checked in on {formatDateTime(booking.checkedInAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Cinema Journey</h3>
              <p className="text-gray-600">Track your movie experiences and spending</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{bookings.length}</div>
                  <div className="text-sm font-medium text-gray-600">Total Bookings</div>
                </div>
                
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Active Bookings</div>
                </div>
                
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {bookings.reduce((total, booking) => total + (booking.seats?.length || 0), 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Seats</div>
                </div>
                
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ${bookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Invested</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;