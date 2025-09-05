// frontend/src/pages/user/BookingSummary.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Film,
  Users,
  CreditCard,
  QrCode
} from 'lucide-react';
import api from '../../utils/api';

function BookingSummary() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Try to get booking data from navigation state first
    if (location.state?.bookingData) {
      console.log('Using booking data from navigation state:', location.state.bookingData);
      setBooking(location.state.bookingData);
      setLoading(false);
    } else if (bookingId) {
      // Fallback to fetching from API
      fetchBookingDetails();
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId, location.state]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching booking details for ID:', bookingId);
      
      const res = await api.get(`/user/bookings/${bookingId}`);
      console.log('Booking details received:', res.data);
      
      setBooking(res.data);
    } catch (error) {
      console.error('Fetch booking details error:', error);
      setError(error.response?.data?.msg || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
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

  // More aggressive seat text extraction with debugging
  const getSeatDisplayText = (seat) => {
    console.log('getSeatDisplayText called with:', seat, typeof seat);
    
    // Handle null/undefined/falsy values
    if (!seat) {
      console.log('Seat is falsy, returning "Unknown"');
      return 'Unknown';
    }
    
    // If it's already a string, return it
    if (typeof seat === 'string') {
      console.log('Seat is string:', seat);
      return seat;
    }
    
    // If it's a number, convert to string
    if (typeof seat === 'number') {
      console.log('Seat is number, converting to string:', seat);
      return seat.toString();
    }
    
    // If it's an object, extract the identifier
    if (typeof seat === 'object' && seat !== null) {
      console.log('Seat is object, extracting identifier from:', seat);
      const identifier = seat.seatId || seat.seatNumber || seat.id || seat.name;
      if (identifier) {
        console.log('Found identifier:', identifier, typeof identifier);
        // Ensure the identifier is a string
        return typeof identifier === 'string' ? identifier : String(identifier);
      }
      // If no identifier found, try to create a meaningful fallback
      console.log('No identifier found, creating fallback');
      return `Seat-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Final fallback
    console.log('Using final fallback for seat:', seat);
    return 'Unknown Seat';
  };

  const getSeatPrice = (seat) => {
    if (typeof seat === 'object' && seat && typeof seat.price === 'number') {
      return seat.price;
    }
    const fallbackPrice = (booking?.totalPrice || 0) / Math.max(booking?.seats?.length || 1, 1);
    return fallbackPrice;
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('PDF download feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The booking you requested could not be found.'}</p>
          <div className="space-y-3">
            <Link 
              to="/user/bookings" 
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link 
              to="/user/movies" 
              className="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Process seats safely at the component level
  const processedSeats = React.useMemo(() => {
    if (!booking?.seats || !Array.isArray(booking.seats)) {
      return [];
    }
    
    return booking.seats.map((seat, index) => {
      const displayText = getSeatDisplayText(seat);
      const price = getSeatPrice(seat);
      
      return {
        id: `seat-${index}`,
        displayText: String(displayText), // Ensure it's always a string
        price: Number(price) || 0,
        originalSeat: seat
      };
    });
  }, [booking?.seats]);

  console.log('Processed seats:', processedSeats);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-200" />
            <h1 className="text-3xl font-bold mb-2">🎫 Booking Successful!</h1>
            <p className="text-green-100">Your tickets have been confirmed</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/user/movies')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Movies
          </button>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
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
                  {booking.showtimeId?.movieId?.title || booking.showtimeId?.movie?.title || 'Movie Details'}
                </h2>
                
                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>

                {/* Showtime Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    <div>
                      <p className="text-gray-300">Date</p>
                      <p className="font-semibold">
                        {formatDate(booking.showtimeId?.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <div>
                      <p className="text-gray-300">Time</p>
                      <p className="font-semibold">
                        {formatTime(booking.showtimeId?.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-300" />
                    <div>
                      <p className="text-gray-300">Hall</p>
                      <p className="font-semibold">
                        {booking.showtimeId?.hallId?.name || booking.showtimeId?.hall?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Info */}
              <div className="space-y-6">
                {/* Booking Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Film className="w-5 h-5 mr-2" />
                    Booking Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-right break-all">
                        {booking._id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-medium">{formatDateTime(booking.createdAt)}</span>
                    </div>
                    {booking.checkedInAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Checked In:</span>
                        <span className="font-medium text-green-600">{formatDateTime(booking.checkedInAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seat Information */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Seat Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Seats:</span>
                      <span className="font-medium">{processedSeats.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Selected Seats:</span>
                      <div className="flex flex-wrap gap-2">
                        {processedSeats.length > 0 ? (
                          processedSeats.map((seat) => (
                            <span key={seat.id} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {seat.displayText}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No seats assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    {processedSeats.length > 0 && (
                      <div className="space-y-2">
                        {processedSeats.map((seat) => (
                          <div key={seat.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{seat.displayText}:</span>
                            <span className="font-medium">${seat.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-purple-600">${(booking.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <QrCode className="w-5 h-5 mr-2" />
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
                      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">📱 How to use your ticket:</p>
                        <ul className="text-left space-y-1">
                          <li>• Show this QR code at the cinema entrance</li>
                          <li>• Staff will scan it for quick check-in</li>
                          <li>• Arrive 15-20 minutes before showtime</li>
                          <li>• Keep your phone charged or save/print this page</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 py-8">
                      <AlertCircle className="mx-auto h-16 w-16 mb-4" />
                      <p>QR Code not available</p>
                      <p className="text-sm mt-2">Please show your Booking ID at the entrance</p>
                    </div>
                  )}
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Important Notes
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Please arrive at least 15 minutes before showtime</li>
                    <li>• Bring a valid ID for verification if required</li>
                    <li>• No outside food or drinks allowed</li>
                    <li>• Mobile phones should be on silent mode</li>
                    <li>• Keep your ticket/QR code safe</li>
                    <li>• Contact support if you need to cancel or modify</li>
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
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Ticket
                </button>
              )}
              
              <Link
                to="/user/bookings"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View All Bookings
              </Link>

              <Link
                to="/user/movies"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Film className="w-5 h-5 mr-2" />
                Book Another Movie
              </Link>
            </div>
          </div>
        </div>

        {/* Movie Details Section */}
        {(booking.showtimeId?.movieId || booking.showtimeId?.movie) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">About This Movie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Genre</h4>
                <p className="text-gray-600">
                  {booking.showtimeId?.movieId?.genre || 
                   booking.showtimeId?.movie?.genre || 
                   'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                <p className="text-gray-600">
                  {booking.showtimeId?.movieId?.duration || 
                   booking.showtimeId?.movie?.duration || 
                   'Not specified'} minutes
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hall Location</h4>
                <p className="text-gray-600">
                  {booking.showtimeId?.hallId?.location || 
                   booking.showtimeId?.hall?.location || 
                   'Not specified'}
                </p>
              </div>
            </div>
            
            {(booking.showtimeId?.movieId?.description || booking.showtimeId?.movie?.description) && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">
                  {booking.showtimeId?.movieId?.description || 
                   booking.showtimeId?.movie?.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingSummary;