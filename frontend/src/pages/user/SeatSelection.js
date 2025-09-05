import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Film, Users, ArrowLeft, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    fetchShowtimeData();
  }, [showtimeId]);

  const fetchShowtimeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch showtime details with populated hall and movie data
      const showtimeRes = await api.get(`/user/showtimes/${showtimeId}`);
      const showtimeData = showtimeRes.data;
      
      setShowtime(showtimeData);
      setHall(showtimeData.hall);
      
      // Fetch booked seats for this showtime
      const seatsRes = await api.get(`/user/showtimes/${showtimeId}/seats`);
      setBookedSeats(seatsRes.data.bookedSeats || []);
      
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to fetch showtime data');
      console.error('Fetch showtime data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    setError('');
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const bookingData = {
        showtimeId,
        seats: selectedSeats.map(seat => ({
          seatId: seat.id,
          seatType: seat.type,
          price: seat.price
        }))
      };

      const res = await api.post('/user/bookings', bookingData);
      
      // Navigate to booking confirmation or payment page
      navigate(`/user/booking-confirmation/${res.data.booking._id}`);
      
    } catch (error) {
      setError(error.response?.data?.msg || 'Booking failed. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setBooking(false);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
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
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSeats.map((seat, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            seat.type === 'box'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {seat.id} - ${seat.price}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Selected Seats:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {selectedSeats.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-gray-900 ml-2">
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
                  onClick={handleBooking}
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
    </div>
  );
}

export default SeatSelection;