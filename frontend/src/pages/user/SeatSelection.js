// frontend/src/pages/user/SeatSelection.js - ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function SeatSelection() {
  const { showtimeId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeats();
  }, [showtimeId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/seats/${showtimeId}`);
      setSeats(res.data);
      
      // You might want to fetch showtime details separately
      // For now, we'll assume the seats response includes showtime info
    } catch (error) {
      setError('Failed to fetch seats');
      console.error('Fetch seats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.includes(seat._id);
      if (isSelected) {
        return prev.filter(id => id !== seat._id);
      } else {
        return [...prev, seat._id];
      }
    });
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const res = await api.post('/user/book', {
        showtimeId,
        seats: selectedSeats
      });
      
      navigate(`/user/booking-summary/${res.data.booking._id}`);
    } catch (error) {
      setError(error.response?.data?.msg || 'Booking failed');
      console.error('Booking failed:', error);
    } finally {
      setBooking(false);
    }
  };

  const getSeatClass = (seat) => {
    if (seat.isBooked) {
      return 'bg-red-500 cursor-not-allowed';
    }
    if (selectedSeats.includes(seat._id)) {
      return 'bg-green-500 cursor-pointer';
    }
    return 'bg-blue-500 hover:bg-blue-600 cursor-pointer';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading seats...</div>
      </div>
    );
  }

  const totalPrice = selectedSeats.length * 10; // $10 per seat

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Screen</h3>
        <div className="w-full h-4 bg-gray-300 rounded-lg mb-8 flex items-center justify-center text-xs font-medium">
          SCREEN
        </div>
        
        <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto mb-6">
          {seats.map((seat) => (
            <button
              key={seat._id}
              onClick={() => handleSeatClick(seat)}
              disabled={seat.isBooked}
              className={`
                w-8 h-8 rounded text-white text-xs font-medium
                ${getSeatClass(seat)}
                transition-colors
              `}
              title={`Seat ${seat.seatNumber} - ${seat.isBooked ? 'Booked' : 'Available'}`}
            >
              {seat.seatNumber}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Booking Summary</h3>
            <p className="text-sm text-gray-600">
              Selected Seats: {selectedSeats.length > 0 ? 
                seats.filter(seat => selectedSeats.includes(seat._id))
                     .map(seat => seat.seatNumber)
                     .join(', ') 
                : 'None'
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Total: ${totalPrice}</p>
            <p className="text-sm text-gray-600">{selectedSeats.length} seat(s) × $10</p>
          </div>
        </div>
        
        <button
          onClick={handleBook}
          disabled={selectedSeats.length === 0 || booking}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {booking ? 'Processing...' : `Book ${selectedSeats.length} Seat(s) - ${totalPrice}`}
        </button>
      </div>
    </div>
  );
}

export default SeatSelection;