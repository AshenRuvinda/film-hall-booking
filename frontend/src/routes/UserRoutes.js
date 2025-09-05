// frontend/src/routes/UserRoutes.js - Example route configuration
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';

// Import your user pages
import Dashboard from '../pages/user/Dashboard';
import Movies from '../pages/user/Movies';
import MovieDetails from '../pages/user/MovieDetails';
import SeatSelection from '../pages/user/SeatSelection';
import BookingSummary from '../pages/user/BookingSummary';
import BookingHistory from '../pages/user/BookingHistory';

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="movies" element={<Movies />} />
        <Route path="movies/:movieId" element={<MovieDetails />} />
        <Route path="seat-selection/:showtimeId" element={<SeatSelection />} />
        
        {/* This is the key route that might be missing */}
        <Route path="booking-summary/:bookingId" element={<BookingSummary />} />
        
        {/* Alternative route names you might be using */}
        <Route path="booking-confirmation/:bookingId" element={<BookingSummary />} />
        <Route path="bookings" element={<BookingHistory />} />
        <Route path="bookings/:bookingId" element={<BookingSummary />} />
        
        {/* Catch all route for 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/user/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Go to Dashboard
              </a>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default UserRoutes;