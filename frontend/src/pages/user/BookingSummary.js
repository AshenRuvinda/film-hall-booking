// frontend/src/pages/user/BookingSummary.js - ENHANCED UI VERSION
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
      console.log('Booking data:', res.data);
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          icon: 'M5 13l4 4L19 7'
        };
      case 'checked-in':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'M6 18L18 6M6 6l12 12'
        };
      case 'pending':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
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

  // Format seats data for display
  const getFormattedSeats = () => {
    if (!booking.seats || booking.seats.length === 0) {
      return [];
    }

    return booking.seats.map((seat, index) => ({
      id: index,
      displayText: getSeatDisplayText(seat),
      type: getSeatType(seat),
      price: getSeatPrice(seat)
    }));
  };

  const handleDownloadPDF = () => {
    if (booking) {
      generatePDF(booking);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Loading Booking Details</h3>
              <p className="mt-2 text-sm text-slate-600">Please wait while we retrieve your booking information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Booking Not Found</h3>
              <p className="text-slate-600 mb-6">{error || 'The booking you requested could not be found.'}</p>
              <Link 
                to="/user/bookings" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedSeats = getFormattedSeats();
  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-white">Booking Confirmation</h1>
                </div>
                <p className="text-blue-100 text-lg">Your cinema experience awaits</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-6 py-3 rounded-2xl border-2 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} bg-white bg-opacity-90 backdrop-blur-sm`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusConfig.icon} />
                  </svg>
                  <span className="capitalize font-semibold">{booking.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Navigation */}
        <div className="mb-8">
          <Link 
            to="/user/bookings" 
            className="inline-flex items-center px-4 py-2 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-md hover:shadow-lg border border-slate-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to My Bookings</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Enhanced Movie Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {booking.showtimeId?.movieId?.poster && (
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={booking.showtimeId.movieId.poster}
                        alt={booking.showtimeId?.movieId?.title}
                        className="w-32 h-44 object-cover rounded-2xl shadow-2xl border-4 border-white border-opacity-20"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x200/6B7280/FFFFFF?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                      {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm font-medium">Cinema Hall</p>
                          <p className="text-white font-semibold text-lg">{booking.showtimeId?.hallId?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm font-medium">Showtime</p>
                          <p className="text-white font-semibold text-lg">{formatDateTime(booking.showtimeId?.startTime)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h8a2 2 0 002-2V8M7 8h10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm font-medium">Duration</p>
                          <p className="text-white font-semibold text-lg">{booking.showtimeId?.movieId?.duration || 'N/A'} min</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Booking Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Booking Info */}
              <div className="xl:col-span-2 space-y-6">
                {/* Enhanced Booking Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Booking Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Booking ID</span>
                        <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-sm font-semibold text-slate-700">
                          {booking._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Booking Date</span>
                        <span className="font-semibold text-slate-900">{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Current Status</span>
                        <div className={`flex items-center px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} border`}>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusConfig.icon} />
                          </svg>
                          <span className="font-semibold capitalize">{booking.status}</span>
                        </div>
                      </div>
                    </div>
                    {booking.checkedInAt && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 font-medium">Checked In At</span>
                          <span className="font-semibold text-green-800">{formatDateTime(booking.checkedInAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Seat Information */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-emerald-100 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Seat Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Total Seats</span>
                        <span className="text-2xl font-bold text-emerald-600">{booking.seats?.length || 0}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-700">
                            {booking.seats?.filter(seat => getSeatType(seat) === 'regular').length || 0}
                          </div>
                          <div className="text-slate-600">Regular</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {booking.seats?.filter(seat => getSeatType(seat) === 'box').length || 0}
                          </div>
                          <div className="text-slate-600">Premium</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-700 font-semibold mb-3">Your Seats</h4>
                    <div className="flex flex-wrap gap-3">
                      {booking.seats && booking.seats.length > 0 ? (
                        booking.seats.map((seat, index) => {
                          const seatText = getSeatDisplayText(seat);
                          const seatType = getSeatType(seat);
                          return (
                            <div 
                              key={index} 
                              className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 ${
                                seatType === 'box' 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              } flex items-center space-x-2`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M5 7V3h8v16l-4-2-4 2V7z" />
                              </svg>
                              <span>{seatText}</span>
                              {seatType === 'box' && (
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M5 16L3 6h5.5l.5 2h9.5l-2.5 8H5zm2.5-6L6 14h8.5l1.5-4H7.5z"/>
                                </svg>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-slate-100 rounded-xl p-4 text-slate-500">
                          No seats assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Payment Information */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">Payment Summary</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 border border-purple-100">
                    {formattedSeats && formattedSeats.length > 0 && (
                      <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                        {formattedSeats.map((seat) => (
                          <div key={seat.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${seat.type === 'box' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                              <span className="text-slate-700 font-medium">
                                {seat.displayText} <span className="text-slate-500">({seat.type})</span>
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900">${seat.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold text-slate-700">Total Amount</span>
                      <span className="text-2xl font-bold text-purple-600">${booking.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code & Actions */}
              <div className="space-y-6">
                {/* Enhanced QR Code Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-slate-200 rounded-xl mr-3">
                        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Digital Ticket</h3>
                    </div>
                    
                    {booking.qrCode ? (
                      <div className="space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-slate-200 inline-block">
                          <img 
                            src={booking.qrCode} 
                            alt="Booking QR Code" 
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-blue-900 mb-2">How to Use Your Ticket</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Present this QR code at cinema entrance</li>
                                <li>• Staff will scan for instant verification</li>
                                <li>• Arrive 15-20 minutes before showtime</li>
                                <li>• Keep your phone charged or print backup</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-200 mb-4">
                          <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-slate-600 font-medium">QR Code not available</p>
                        <p className="text-sm text-slate-500 mt-1">Contact support if needed</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-4">
                  {booking.qrCode && (
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Ticket
                    </button>
                  )}
                  
                  <Link
                    to="/user/bookings"
                    className="w-full flex items-center justify-center px-6 py-4 bg-slate-600 text-white font-semibold rounded-2xl hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View All Bookings
                  </Link>

                  <Link
                    to="/user/dashboard"
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Book Another Movie
                  </Link>
                </div>

                {/* Enhanced Important Notes */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-amber-100 rounded-xl mr-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-amber-800">Important Reminders</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Arrive 15 minutes before showtime for smooth entry</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Bring valid ID for age verification if required</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Outside food and beverages are not permitted</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Keep mobile devices on silent during the show</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Movie Details Section */}
        {booking.showtimeId?.movieId && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-slate-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h8a2 2 0 002-2V8M7 8h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Movie Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h8a2 2 0 002-2V8M7 8h10" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-blue-900">Genre</h4>
                </div>
                <p className="text-slate-700 font-medium">{booking.showtimeId.movieId.genre || 'Not specified'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-purple-900">Runtime</h4>
                </div>
                <p className="text-slate-700 font-medium">{booking.showtimeId.movieId.duration || 'Not specified'} minutes</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-emerald-900">Hall Capacity</h4>
                </div>
                <p className="text-slate-700 font-medium">{booking.showtimeId.hallId?.totalSeats || 'Not specified'} seats</p>
              </div>
            </div>
            
            {booking.showtimeId.movieId.description && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900">Synopsis</h4>
                </div>
                <p className="text-slate-700 leading-relaxed">{booking.showtimeId.movieId.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingSummary;