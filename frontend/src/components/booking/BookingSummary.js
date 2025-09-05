// frontend/src/pages/user/BookingSummary.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { generatePDF } from '../../utils/pdfGenerator';

function BookingSummary() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/bookings/${bookingId}`);
      setBooking(res.data);
      console.log('Booking data:', res.data); // Debug log
    } catch (error) {
      setError('Failed to fetch booking details');
      console.error('Fetch booking details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Helper function to extract seat display text
  const getSeatDisplayText = (seat) => {
    if (typeof seat === 'string') {
      return seat;
    }
    if (typeof seat === 'object' && seat !== null) {
      return seat.seatId || seat.seatNumber || 'Unknown Seat';
    }
    return 'Unknown Seat';
  };

  // Helper function to get seat type
  const getSeatType = (seat) => {
    if (typeof seat === 'object' && seat !== null) {
      return seat.seatType || 'regular';
    }
    return 'regular';
  };

  // Helper function to get seat price
  const getSeatPrice = (seat) => {
    if (typeof seat === 'object' && seat !== null && seat.price) {
      return seat.price;
    }
    return booking.totalPrice / (booking.seats?.length || 1);
  };

  const handleDownloadPDF = () => {
    if (booking) {
      generatePDF(booking);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The booking you requested could not be found.'}</p>
            <Link to="/user/bookings" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎫 Booking Confirmation</h1>
              <p className="text-green-100">Your ticket is ready!</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(booking.status)}`}>
                <span className="capitalize font-medium">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/user/bookings" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Bookings
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Movie Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {booking.showtimeId?.movieId?.poster && (
                <div className="w-24 h-32 flex-shrink-0">
                  <img
                    src={booking.showtimeId.movieId.poster}
                    alt={booking.showtimeId?.movieId?.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x200/6B7280/FFFFFF?text=No+Image';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">Hall</p>
                    <p className="font-semibold">{booking.showtimeId?.hallId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Showtime</p>
                    <p className="font-semibold">{formatDateTime(booking.showtimeId?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Duration</p>
                    <p className="font-semibold">{booking.showtimeId?.movieId?.duration || 'N/A'} min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Booking Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Booking Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {booking._id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-medium">{formatDateTime(booking.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    {booking.checkedInAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Checked In:</span>
                        <span className="font-medium text-green-600">{formatDateTime(booking.checkedInAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seat Information - FIXED SECTION */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Seat Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Seats:</span>
                      <span className="font-medium">{booking.seats?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Seat Numbers:</span>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats && booking.seats.length > 0 ? (
                          booking.seats.map((seat, index) => {
                            const seatText = getSeatDisplayText(seat);
                            const seatType = getSeatType(seat);
                            return (
                              <span 
                                key={index} 
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  seatType === 'box' 
                                    ? 'bg-purple-200 text-purple-800' 
                                    : 'bg-green-200 text-green-800'
                                }`}
                                title={seatType === 'box' ? 'Box Seat' : 'Regular Seat'}
                              >
                                {seatText}
                                {seatType === 'box' && ' 👑'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500">No seats assigned</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Show seat breakdown by type if there are different types */}
                    {booking.seats && booking.seats.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Regular Seats:</span>
                            <span className="ml-2 font-medium">
                              {booking.seats.filter(seat => getSeatType(seat) === 'regular').length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Box Seats:</span>
                            <span className="ml-2 font-medium">
                              {booking.seats.filter(seat => getSeatType(seat) === 'box').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information - ENHANCED */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    {booking.seats && booking.seats.length > 0 && (
                      <div className="space-y-2">
                        {booking.seats.map((seat, index) => {
                          const seatText = getSeatDisplayText(seat);
                          const seatPrice = getSeatPrice(seat);
                          const seatType = getSeatType(seat);
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {seatText} ({seatType})
                              </span>
                              <span className="font-medium">${seatPrice.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Seats:</span>
                      <span className="font-medium">{booking.seats?.length || 0}</span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-purple-600">${booking.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Your Ticket QR Code
                  </h3>
                  
                  {booking.qrCode ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-inner inline-block">
                        <img 
                          src={booking.qrCode} 
                          alt="Booking QR Code" 
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        <p className="font-medium mb-1">📱 How to use:</p>
                        <ul className="text-left space-y-1">
                          <li>• Show this QR code at the cinema entrance</li>
                          <li>• Staff will scan it for quick check-in</li>
                          <li>• Arrive 15-20 minutes before showtime</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>QR Code not available</p>
                    </div>
                  )}
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Important Notes
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Please arrive at least 15 minutes before showtime</li>
                    <li>• Bring a valid ID for verification</li>
                    <li>• No outside food or drinks allowed</li>
                    <li>• Mobile phones should be on silent mode</li>
                    <li>• Keep your ticket/QR code safe</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {booking.qrCode && (
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Ticket
                </button>
              )}
              
              <Link
                to="/user/bookings"
                className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Bookings
              </Link>

              <Link
                to="/user/dashboard"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17M7 4H17M9 9H15M9 13H15" />
                </svg>
                Book Another Movie
              </Link>
            </div>
          </div>
        </div>

        {/* Movie Details Section */}
        {booking.showtimeId?.movieId && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">About This Movie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Genre</h4>
                <p className="text-gray-600">{booking.showtimeId.movieId.genre || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                <p className="text-gray-600">{booking.showtimeId.movieId.duration || 'Not specified'} minutes</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hall Capacity</h4>
                <p className="text-gray-600">{booking.showtimeId.hallId?.totalSeats || 'Not specified'} seats</p>
              </div>
            </div>
            {booking.showtimeId.movieId.description && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{booking.showtimeId.movieId.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingSummary;