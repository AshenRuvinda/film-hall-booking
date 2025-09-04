import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookingCard from '../../components/booking/BookingCard';

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('/api/user/bookings').then((res) => setBookings(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

export default MyBookings;