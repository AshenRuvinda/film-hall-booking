// frontend/src/pages/user/MovieDetail.js - ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/movies/${id}`);
      setMovie(res.data);
      setShowtimes(res.data.showtimes || []);
    } catch (error) {
      setError('Failed to fetch movie details');
      console.error('Fetch movie details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Movie not found'}
        </div>
        <Link to="/user/dashboard" className="mt-4 inline-block text-blue-500 hover:underline">
          ← Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/user/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Movies
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            {movie.poster ? (
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full h-96 md:h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400/gray/white?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
            
            <div className="space-y-2 mb-6">
              {movie.genre && (
                <p><span className="font-semibold">Genre:</span> {movie.genre}</p>
              )}
              {movie.duration && (
                <p><span className="font-semibold">Duration:</span> {movie.duration} minutes</p>
              )}
            </div>
            
            {movie.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-gray-700 leading-relaxed">{movie.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-4">Available Showtimes</h3>
              {showtimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showtimes.map((showtime) => (
                    <div key={showtime._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="mb-2">
                        <p className="font-medium">{formatDateTime(showtime.startTime)}</p>
                        <p className="text-sm text-gray-600">Hall: {showtime.hallId?.name}</p>
                      </div>
                      <Link
                        to={`/user/seat-selection/${showtime._id}`}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors inline-block"
                      >
                        Select Seats
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No showtimes available for this movie.</p>
                  <p className="text-sm text-gray-500 mt-2">Please check back later.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;