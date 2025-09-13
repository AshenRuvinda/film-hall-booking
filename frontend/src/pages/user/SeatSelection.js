import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Film, Users, ArrowLeft, CreditCard, AlertCircle, Loader2, X, Check } from 'lucide-react';
import api from '../../utils/api';
import SeatMap from '../../components/booking/SeatMap';

function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const [showtime, setShowtime] = useState(null);
  const [hall, setHall] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchShowtimeData();
  }, [showtimeId]);

  const fetchShowtimeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching showtime data for ID:', showtimeId);
      
      // Fetch showtime details with populated hall and movie data
      const showtimeRes = await api.get(`/user/showtimes/${showtimeId}`);
      const showtimeData = showtimeRes.data;
      
      console.log('Showtime data received:', showtimeData);
      console.log('Pricing data:', showtimeData.pricing);
      
      setShowtime(showtimeData);
      setHall(showtimeData.hall);
      
      // Fetch booked seats for this showtime
      const seatsRes = await api.get(`/user/showtimes/${showtimeId}/seats`);
      console.log('Booked seats received:', seatsRes.data.bookedSeats);
      setBookedSeats(seatsRes.data.bookedSeats || []);
      
    } catch (error) {
      console.error('Fetch showtime data error:', error);
      setError(error.response?.data?.msg || 'Failed to fetch showtime data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine seat type based on seat ID
  const determineSeatType = (seatId) => {
    if (!seatId) return 'regular';
    
    const seatIdLower = seatId.toLowerCase();
    if (seatIdLower.includes('box') || 
        seatIdLower.includes('vip') || 
        seatIdLower.includes('premium')) {
      return 'box';
    }
    
    // Add more logic based on your seat naming convention
    // Example: if certain rows are premium (adjust as needed)
    // if (seatId.match(/^[I-J]/)) return 'box'; // Rows I-J are premium
    
    return 'regular';
  };

  // Helper function to get real price for a seat
  const getSeatPrice = (seatId, seatType = null) => {
    if (!showtime?.pricing) {
      return 10; // Fallback price
    }
    
    const type = seatType || determineSeatType(seatId);
    return showtime.pricing[type] || showtime.pricing.regular || 10;
  };

  const handleSeatSelect = (seats) => {
    console.log('Raw seats selected:', seats);
    
    // Enhanced seat processing with real pricing
    const processedSeats = seats.map(seat => {
      let seatData;
      
      if (typeof seat === 'object') {
        // If seat is already an object with id/seatId
        const seatId = seat.id || seat.seatId || seat;
        const seatType = seat.type || seat.seatType || determineSeatType(seatId);
        const price = getSeatPrice(seatId, seatType);
        
        seatData = {
          id: seatId,
          seatId: seatId, // For backward compatibility
          type: seatType,
          seatType: seatType, // For backward compatibility
          price: price
        };
      } else if (typeof seat === 'string') {
        // If seat is just a string ID
        const seatType = determineSeatType(seat);
        const price = getSeatPrice(seat, seatType);
        
        seatData = {
          id: seat,
          seatId: seat,
          type: seatType,
          seatType: seatType,
          price: price
        };
      } else {
        console.warn('Unknown seat format:', seat);
        return null;
      }
      
      return seatData;
    }).filter(Boolean); // Remove null values
    
    console.log('Processed seats with real pricing:', processedSeats);
    setSelectedSeats(processedSeats);
    setError('');
  };

  const handleBookingClick = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setBooking(true);
    setError('');

    try {
      console.log('Starting booking process...');
      console.log('Selected seats for booking:', selectedSeats);
      
      // Format the booking data - let backend determine real prices
      const bookingData = {
        showtimeId,
        seats: selectedSeats.map(seat => ({
          seatId: seat.id || seat.seatId,
          seatType: seat.type || seat.seatType,
          // Don't include price - let backend calculate the real price
        }))
      };

      console.log('Booking data being sent:', bookingData);

      const res = await api.post('/user/bookings', bookingData);
      
      console.log('Booking response:', res.data);
      
      if (res.data.booking && res.data.booking._id) {
        // Navigate to booking summary page with booking data
        navigate(`/user/booking-summary/${res.data.booking._id}`, {
          state: { bookingData: res.data.booking }
        });
      } else {
        throw new Error('Invalid booking response format');
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.error || 
                          error.message || 
                          'Booking failed. Please try again.';
      
      setError(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group selected seats by type for display
  const groupSeatsByType = (seats) => {
    return seats.reduce((acc, seat) => {
      const type = seat.type || 'regular';
      if (!acc[type]) {
        acc[type] = {
          seats: [],
          count: 0,
          totalPrice: 0
        };
      }
      acc[type].seats.push(seat);
      acc[type].count++;
      acc[type].totalPrice += seat.price || 0;
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading showtime details...</p>
        </div>
      </div>
    );
  }

  if (error && !showtime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Showtime</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/user/movies')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const seatsByType = groupSeatsByType(selectedSeats);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Select Seats</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Movie & Showtime Info */}
        {showtime && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie Poster */}
                {showtime.movie?.poster && (
                  <div className="flex-shrink-0">
                    <img
                      src={showtime.movie.poster}
                      alt={showtime.movie.title}
                      className="w-32 h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Movie Details */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <Film className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {showtime.movie?.title}
                      </h2>
                      {showtime.movie?.genre && (
                        <p className="text-gray-600 mb-2">{showtime.movie.genre}</p>
                      )}
                      {showtime.movie?.duration && (
                        <p className="text-sm text-gray-500">
                          Duration: {showtime.movie.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Showtime Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(showtime.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(showtime.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Hall</p>
                        <p className="font-medium text-gray-900">
                          {hall?.name} - {hall?.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Information */}
                  {showtime.pricing && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Seat Pricing</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-gray-600">Regular:</span>
                          <span className="font-semibold text-green-600">
                            ${showtime.pricing.regular}
                          </span>
                        </div>
                        {showtime.pricing.box > showtime.pricing.regular && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-500 rounded"></div>
                            <span className="text-gray-600">Box/Premium:</span>
                            <span className="font-semibold text-green-600">
                              ${showtime.pricing.box}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Seat Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          {hall ? (
            <SeatMap
              hall={hall}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              pricing={showtime?.pricing} // Pass pricing to SeatMap
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Hall layout not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky bottom-0">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Selection Summary */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Summary</h3>
                
                {selectedSeats.length > 0 ? (
                  <div className="space-y-3">
                    {/* Group by seat type */}
                    {Object.entries(seatsByType).map(([type, data]) => (
                      <div key={type} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {type} Seats ({data.count})
                          </h4>
                          <span className="font-semibold text-green-600">
                            ${data.totalPrice}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {data.seats.map((seat, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                seat.type === 'box'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {seat.id}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No seats selected</p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleBookingClick}
                  disabled={selectedSeats.length === 0 || booking}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors min-w-[200px] justify-center"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {selectedSeats.length > 0 
                        ? `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''} - $${calculateTotal()}`
                        : 'Select Seats to Continue'
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Your Booking</h3>
              <button
                onClick={handleCancelConfirmation}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Movie Info Summary */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Film className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{showtime?.movie?.title}</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(showtime?.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(showtime?.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hall:</span>
                    <span className="font-medium">{hall?.name} - {hall?.location}</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats by Type */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Selected Seats</h4>
                <div className="space-y-3">
                  {Object.entries(seatsByType).map(([type, data]) => (
                    <div key={type} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{type} Seats</span>
                        <span className="font-medium">${data.totalPrice}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.seats.map(seat => seat.id).join(', ')} 
                        <span className="ml-2">({data.count} × ${data.seats[0]?.price || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">${calculateTotal()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Terms */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Once confirmed, your booking cannot be canceled or refunded. 
                  Please ensure your selected seats and showtime are correct.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelConfirmation}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Confirm Booking - ${calculateTotal()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatSelection;