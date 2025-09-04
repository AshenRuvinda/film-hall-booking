import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeatMap from '../../components/booking/SeatMap';

function SeatSelection() {
  const { showtimeId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/user/seats/${showtimeId}`).then((res) => setSeats(res.data));
  }, [showtimeId]);

  const handleBook = async () => {
    try {
      const res = await axios.post('/api/user/book', { showtimeId, seats: selectedSeats });
      navigate(`/user/booking-summary/${res.data.booking._id}`);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Seats</h2>
      <SeatMap seats={seats} onSelect={setSelectedSeats} />
      <button
        onClick={handleBook}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        disabled={selectedSeats.length === 0}
      >
        Book Selected Seats
      </button>
    </div>
  );
}

export default SeatSelection;