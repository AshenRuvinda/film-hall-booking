import React from 'react';
import { Link } from 'react-router-dom';

function BookingCard({ booking }) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold">Booking ID: {booking._id}</h3>
      <p>Showtime: {new Date(booking.showtimeId.startTime).toLocaleString()}</p>
      <p>Seats: {booking.seats.join(', ')}</p>
      <p>Total: ${booking.totalPrice}</p>
      <p>Status: {booking.status}</p>
      <Link to={`/user/booking-summary/${booking._id}`} className="text-blue-500">View Details</Link>
    </div>
  );
}

export default BookingCard;