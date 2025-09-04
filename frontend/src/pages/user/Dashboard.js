// frontend/src/pages/user/Dashboard.js - ENHANCED VERSION
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';
import MovieCard from '../../components/movies/MovieCard';

function UserDashboard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/movies');
      setMovies(res.data);
    } catch (error) {
      setError('Failed to fetch movies');
      console.error('Fetch movies error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {user && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <div className="mt-4 flex gap-4">
            <Link 
              to="/user/bookings" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              My Bookings
            </Link>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Now Showing</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No movies available</div>
          <p className="text-gray-400">Check back later for new releases!</p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;