import React, { useState } from 'react';

function SeatMap({ seats, onSelect }) {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (seat) => {
    if (!seat.isBooked) {
      const updatedSeats = selectedSeats.includes(seat._id)
        ? selectedSeats.filter((id) => id !== seat._id)
        : [...selectedSeats, seat._id];
      setSelectedSeats(updatedSeats);
      onSelect(updatedSeats);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {seats.map((seat) => (
        <button
          key={seat._id}
          className={`p-2 border rounded ${
            seat.isBooked ? 'bg-gray-400' : selectedSeats.includes(seat._id) ? 'bg-green-500' : 'bg-blue-500'
          } text-white`}
          onClick={() => handleSeatClick(seat)}
          disabled={seat.isBooked}
        >
          {seat.seatNumber}
        </button>
      ))}
    </div>
  );
}

export default SeatMap;