// frontend/src/pages/user/MyBookings.js - NEW COMPONENT
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎫 My Bookings</h1>
              <p className="text-blue-100">Manage your movie tickets</p>
            </div>
            <Link
              to="/user/dashboard"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Book New Ticket
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status !== 'cancelled' && isUpcoming(b.showtimeId?.startTime)).length },
              { key: 'past', label: 'Past', count: bookings.filter(b => isPast(b.showtimeId?.startTime)).length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-medium">Error loading bookings</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="text-red-600 hover:text-red-800 text-sm underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBookings.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet." 
                : `No ${filter} bookings found.`}
            </p>
            <Link
              to="/user/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Book Your First Movie
            </Link>
          </div>
        )}

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => {
            const formattedSeats = formatSeatList(booking.seats);
            const regularSeats = getTotalSeatsByType(booking.seats, 'regular');
            const boxSeats = getTotalSeatsByType(booking.seats, 'box');

            return (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Booking Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">
                        {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {booking.showtimeId?.hallId?.name || 'Unknown Hall'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Showtime</p>
                      <p className="font-medium">
                        {booking.showtimeId?.startTime 
                          ? formatDateTime(booking.showtimeId.startTime)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Booking Date</p>
                      <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Seats */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Seats ({formattedSeats.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {formattedSeats.slice(0, 4).map((seat, index) => (
                          <span 
                            key={seat.id}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              seat.type === 'box' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {seat.displayText}
                          </span>
                        ))}
                        {formattedSeats.length > 4 && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            +{formattedSeats.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700 mb-2">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Seat Type Breakdown */}
                  {(regularSeats > 0 || boxSeats > 0) && (
                    <div className="flex gap-4 text-xs text-gray-600 mb-4">
                      {regularSeats > 0 && (
                        <span>Regular: {regularSeats}</span>
                      )}
                      {boxSeats > 0 && (
                        <span>Box: {boxSeats} 👑</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/user/booking-summary/${booking._id}`}
                      className="flex-1 text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    {booking.qrCode && (
                      <button
                        onClick={() => {
                          // Download QR code or open in new tab
                          const link = document.createElement('a');
                          link.href = booking.qrCode;
                          link.download = `ticket-${booking._id}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                        title="Download QR Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Additional Info */}
                  {booking.checkedInAt && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-green-600">
                        ✓ Checked in on {formatDateTime(booking.checkedInAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length}
                </div>
                <div className="text-sm text-gray-600">Active Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {bookings.reduce((total, booking) => total + (booking.seats?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Seats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${bookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;