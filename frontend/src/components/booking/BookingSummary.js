import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { generatePDF } from '../../utils/pdfGenerator';

function BookingSummary() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    axios.get(`/api/user/bookings/${bookingId}`).then((res) => setBooking(res.data));
  }, [bookingId]);

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Booking Summary</h2>
      <p>Booking ID: {booking._id}</p>
      <p>Showtime: {new Date(booking.showtimeId.startTime).toLocaleString()}</p>
      <p>Seats: {booking.seats.join(', ')}</p>
      <p>Total: ${booking.totalPrice}</p>
      <img src={booking.qrCode} alt="QR Code" className="w-32 h-32" />
      <button
        onClick={() => generatePDF(booking)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Download Ticket
      </button>
    </div>
  );
}

export default BookingSummary;