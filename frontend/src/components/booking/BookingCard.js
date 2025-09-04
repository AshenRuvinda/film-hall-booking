// frontend/src/components/booking/BookingCard.js - ENHANCED VERSION
import React from 'react';
import { Link } from 'react-router-dom';

function BookingCard({ booking }) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'checked-in':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const showDateTime = booking.showtimeId?.startTime ? formatDateTime(booking.showtimeId.startTime) : null;
  const bookingDate = formatDateTime(booking.createdAt);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      <div className="p-5">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {booking.showtimeId?.movieId?.title || 'Unknown Movie'}
            </h3>
            <p className="text-sm text-gray-500">
              Booking ID: <span className="font-mono">{booking._id?.slice(-8)}</span>
            </p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            {getStatusIcon(booking.status)}
            <span className="ml-1 capitalize">{booking.status}</span>
          </span>
        </div>

        {/* Movie and Booking Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {/* Left Column */}
          <div className="space-y-2">
            {showDateTime && (
              <div>
                <p className="text-gray-500">Showtime</p>
                <p className="font-medium">{showDateTime.date} at {showDateTime.time}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Hall</p>
              <p className="font-medium">{booking.showtimeId?.hallId?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div>
              <p className="text-gray-500">Seats</p>
              <div className="flex flex-wrap gap-1">
                {booking.seats && booking.seats.length > 0 ? (
                  booking.seats.slice(0, 3).map((seat, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {seat.seatNumber || seat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No seats</span>
                )}
                {booking.seats && booking.seats.length > 3 && (
                  <span className="text-xs text-gray-500">+{booking.seats.length - 3} more</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-500">Booked on</p>
              <p className="font-medium">{bookingDate.date}</p>
            </div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            <p className="text-lg font-bold text-green-600">${booking.totalPrice}</p>
            <p className="text-xs text-gray-500">
              {booking.seats?.length || 0} seat(s)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link 
              to={`/user/booking-summary/${booking._id}`} 
              className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </Link>
          </div>
        </div>

        {/* Additional Info for Special Statuses */}
        {booking.checkedInAt && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            ✓ Checked in on {formatDateTime(booking.checkedInAt).date} at {formatDateTime(booking.checkedInAt).time}
          </div>
        )}
        
        {booking.status === 'confirmed' && booking.showtimeId?.startTime && new Date(booking.showtimeId.startTime) < new Date() && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
            ⚠️ This showtime has passed
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard;