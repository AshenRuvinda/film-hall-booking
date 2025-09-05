// frontend/src/components/movies/MovieDetail.js - DEBUG VERSION WITH DETAILED ERROR HANDLING
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { fetchMovieDetails, getAPIStatus } from '../../utils/movieApi';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [externalMovieData, setExternalMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [apiStatus, setApiStatus] = useState({});

  useEffect(() => {
    console.log('MovieDetail component mounted with ID:', id);
    fetchMovieData();
    setApiStatus(getAPIStatus());
  }, [id]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo({});

      console.log('🔍 Starting to fetch movie data for ID:', id);

      // Check if we have a valid ID
      if (!id) {
        throw new Error('No movie ID provided');
      }

      let movieData = null;
      let showtimeData = [];
      let errors = [];

      // Try to fetch movie details from our backend
      try {
        console.log('📡 Fetching movie from backend...');
        const movieRes = await api.get(`/movies/${id}`);
        movieData = movieRes.data;
        console.log('✅ Movie data received:', movieData);
        setMovie(movieData);
      } catch (movieError) {
        console.error('❌ Movie fetch failed:', movieError);
        errors.push({
          type: 'movie',
          message: movieError.response?.data?.message || movieError.message,
          status: movieError.response?.status,
          url: movieError.config?.url
        });
      }

      // Try to fetch showtimes (even if movie fetch failed)
      try {
        console.log('📡 Fetching showtimes from backend...');
        const showtimesRes = await api.get(`/showtimes/movie/${id}`);
        showtimeData = showtimesRes.data;
        console.log('✅ Showtimes data received:', showtimeData);
        setShowtimes(showtimeData);
      } catch (showtimeError) {
        console.error('⚠️ Showtimes fetch failed:', showtimeError);
        errors.push({
          type: 'showtimes',
          message: showtimeError.response?.data?.message || showtimeError.message,
          status: showtimeError.response?.status,
          url: showtimeError.config?.url
        });
      }

      // Update debug info
      setDebugInfo({
        movieId: id,
        movieFetched: !!movieData,
        showtimesFetched: !!showtimeData.length,
        errors,
        backendUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
        timestamp: new Date().toISOString()
      });

      // If we couldn't get movie data, throw an error
      if (!movieData) {
        throw new Error('Failed to fetch movie details from backend');
      }

      // Try to fetch enhanced movie data from external APIs (non-blocking)
      if (movieData?.title) {
        console.log('🌐 Attempting to fetch enhanced data for:', movieData.title);
        fetchEnhancedMovieData(movieData.title, movieData.imdbId);
      }

    } catch (error) {
      console.error('💥 fetchMovieData error:', error);
      setError(`Failed to load movie details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedMovieData = async (title, imdbId = null) => {
    try {
      setLoadingExternal(true);
      console.log('🎬 Fetching enhanced movie data for:', title, 'IMDb ID:', imdbId);
      
      let enhancedData = null;
      
      // Try different approaches to get movie data
      if (imdbId) {
        try {
          enhancedData = await fetchMovieDetails(imdbId, { preferredAPI: 'omdb' });
          console.log('✅ Enhanced data from OMDb:', enhancedData);
        } catch (error) {
          console.log('⚠️ OMDB with IMDb ID failed:', error.message);
        }
      }

      // If IMDb ID didn't work or we don't have one, try title search
      if (!enhancedData) {
        try {
          enhancedData = await fetchMovieDetails(title, { 
            preferredAPI: 'auto', 
            isTitle: true 
          });
          console.log('✅ Enhanced data from title search:', enhancedData);
        } catch (error) {
          console.log('⚠️ Title search failed:', error.message);
        }
      }

      if (enhancedData) {
        setExternalMovieData(enhancedData);
      } else {
        console.log('ℹ️ No enhanced data available, using backend data only');
      }

    } catch (error) {
      console.error('Enhanced movie data fetch error:', error);
    } finally {
      setLoadingExternal(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullDateTime: date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const isShowtimePast = (startTime) => {
    return new Date(startTime) < new Date();
  };

  const getAvailableSeats = (showtime) => {
    if (!showtime.hallId?.totalSeats) return 'N/A';
    const bookedSeats = showtime.bookedSeats?.length || 0;
    return showtime.hallId.totalSeats - bookedSeats;
  };

  const handleBookNow = (showtimeId) => {
    navigate(`/user/seat-selection/${showtimeId}`);
  };

  const groupShowtimesByDate = (showtimes) => {
    const grouped = {};
    showtimes.forEach(showtime => {
      const date = new Date(showtime.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(showtime);
    });
    return grouped;
  };

  // Debug component
  const DebugPanel = () => (
    <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
      <h4 className="font-semibold text-red-800 mb-2">🐛 Debug Information</h4>
      <div className="text-sm text-red-700 space-y-2">
        <div><strong>Movie ID:</strong> {debugInfo.movieId}</div>
        <div><strong>Backend URL:</strong> {debugInfo.backendUrl}</div>
        <div><strong>Movie Fetched:</strong> {debugInfo.movieFetched ? '✅' : '❌'}</div>
        <div><strong>Showtimes Fetched:</strong> {debugInfo.showtimesFetched ? '✅' : '❌'}</div>
        <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
        
        {debugInfo.errors && debugInfo.errors.length > 0 && (
          <div>
            <strong>Errors:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {debugInfo.errors.map((err, index) => (
                <li key={index} className="mb-1">
                  <strong>{err.type}:</strong> {err.message} 
                  {err.status && <span> (Status: {err.status})</span>}
                  {err.url && <div className="text-xs text-red-600">URL: {err.url}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 p-2 bg-white rounded text-xs">
          <strong>Troubleshooting Steps:</strong>
          <ol className="mt-1 ml-4 list-decimal">
            <li>Check if your backend server is running on port 5000</li>
            <li>Verify the movie exists in your database with ID: {id}</li>
            <li>Check browser network tab for failed requests</li>
            <li>Ensure API routes are properly configured</li>
            <li>Check CORS configuration if requests are blocked</li>
          </ol>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading movie details...</p>
          <p className="text-sm text-gray-500 mt-2">Movie ID: {id}</p>
        </div>
      </div>
    );
  }

  // Error state with debug info
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Movies
            </Link>
          </div>

          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Movie Loading Failed</h3>
              <p className="text-gray-600 mb-6">{error || 'The requested movie could not be found.'}</p>
              
              <div className="space-y-3">
                <button
                  onClick={fetchMovieData}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
                <Link 
                  to="/user/dashboard" 
                  className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back to Movies
                </Link>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          <DebugPanel />
        </div>
      </div>
    );
  }

  // Use enhanced data if available, otherwise fall back to our movie data
  const displayData = externalMovieData || movie;
  const groupedShowtimes = groupShowtimesByDate(showtimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/user/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Movies
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="lg:flex">
            {/* Movie Poster */}
            <div className="lg:w-1/3 xl:w-1/4">
              <div className="h-96 lg:h-full">
                {displayData.poster ? (
                  <img
                    src={displayData.poster}
                    alt={displayData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x600/6B7280/FFFFFF?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17M7 4H17M9 9H15M9 13H15" />
                      </svg>
                      <p className="text-gray-500 text-sm">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Movie Details */}
            <div className="lg:w-2/3 xl:w-3/4 p-8">
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {displayData.title}
                  </h1>
                  
                  {/* Success indicator */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Loaded successfully
                    </span>
                    {externalMovieData && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Enhanced with {externalMovieData.source}
                      </span>
                    )}
                  </div>

                  {/* Movie metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {displayData.year && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-5 8H9m0 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4 0h2m-6 0h2a1 1 0 001-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        {displayData.year}
                      </span>
                    )}
                    {displayData.genre && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {displayData.genre}
                      </span>
                    )}
                    {(displayData.runtime || displayData.duration) && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {displayData.runtime || `${displayData.duration} min`}
                      </span>
                    )}
                    {displayData.rating && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {displayData.rating}/10
                      </span>
                    )}
                  </div>

                  {/* Plot/Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Plot</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {displayData.plot || displayData.description || 'No plot description available.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Showtimes & Booking ({showtimes.length} found)
          </h2>

          {showtimes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-5 8H9m0 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4 0h2m-6 0h2a1 1 0 001-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Showtimes Available</h3>
              <p className="text-gray-600">This movie doesn't have any scheduled showtimes at the moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedShowtimes).map(([date, dayShowtimes]) => (
                <div key={date} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {formatDateTime(dayShowtimes[0].startTime).date}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayShowtimes.map((showtime) => {
                      const isPast = isShowtimePast(showtime.startTime);
                      const availableSeats = getAvailableSeats(showtime);
                      const isFullyBooked = availableSeats === 0;
                      
                      return (
                        <div
                          key={showtime._id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isPast 
                              ? 'border-gray-200 bg-gray-50 opacity-60' 
                              : isFullyBooked
                              ? 'border-red-200 bg-red-50'
                              : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {formatDateTime(showtime.startTime).time}
                              </p>
                              <p className="text-sm text-gray-600">
                                {showtime.hallId?.name || 'Unknown Hall'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                ${showtime.price}
                              </p>
                              <p className="text-xs text-gray-500">per seat</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Available Seats:</span> 
                              <span className={`ml-1 ${availableSeats === 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                {availableSeats}
                              </span>
                              <span className="text-gray-400">
                                /{showtime.hallId?.totalSeats || 'N/A'}
                              </span>
                            </p>
                          </div>
                          
                          {isPast ? (
                            <button
                              disabled
                              className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                            >
                              Show Ended
                            </button>
                          ) : isFullyBooked ? (
                            <button
                              disabled
                              className="w-full px-4 py-2 bg-red-300 text-red-700 rounded-lg cursor-not-allowed"
                            >
                              Fully Booked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookNow(showtime._id)}
                              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel />
        )}
      </div>
    </div>
  );
}

export default MovieDetail;