// frontend/src/pages/user/Dashboard.js - ENHANCED VERSION
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';
import MovieCard from '../../components/movies/MovieCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar, 
  Ticket,
  ChevronDown,
  Eye
} from 'lucide-react';

function UserDashboard() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [moviesPerLoad] = useState(4);
  const { user } = useContext(AuthContext);

  // Carousel images - you can replace with actual movie banners
  const carouselImages = [
    {
      id: 1,
      src: 'https://images.bauerhosting.com/empire/2025/08/empire-what-is-dolby-atmos-feature.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80',
      title: 'Experience Cinema Like Never Before',
      subtitle: 'Book your tickets now for the latest blockbusters'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
      title: 'Premium Movie Experience',
      subtitle: 'Enjoy luxury seating and state-of-the-art sound'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
      title: 'Latest Releases Available',
      subtitle: 'Discover new movies and classic favorites'
    }
  ];

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  useEffect(() => {
    setDisplayedMovies(filteredMovies.slice(0, moviesPerLoad));
    setShowMore(false);
  }, [filteredMovies]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
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

  const filterMovies = () => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie =>
        movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    setFilteredMovies(filtered);
  };

  const loadMoreMovies = () => {
    const currentLength = displayedMovies.length;
    const nextMovies = filteredMovies.slice(currentLength, currentLength + 8);
    setDisplayedMovies([...displayedMovies, ...nextMovies]);
    
    if (currentLength + 8 >= filteredMovies.length) {
      setShowMore(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const getUniqueGenres = () => {
    const genres = movies.map(movie => movie.genre).filter(Boolean);
    return [...new Set(genres)];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading your cinema experience...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Carousel */}
      <div className="relative h-96 overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'transform translate-x-0' : 
              index < currentSlide ? 'transform -translate-x-full' : 'transform translate-x-full'
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-5xl font-bold mb-4">{image.title}</h1>
                <p className="text-xl opacity-90">{image.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Image + Text Section (My Bookings) */}
      {user && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Section */}
              <div className="order-2 lg:order-1">
                <img
                  src="https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Movie Theater Interior"
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              {/* Text Section */}
              <div className="order-1 lg:order-2">
                <div className="mb-4">
                  <div className="w-16 h-1 bg-blue-600 mb-4"></div>
                  <span className="text-blue-600 font-semibold uppercase tracking-wide text-sm">
                    Your Cinema Experience
                  </span>
                </div>
                
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Welcome back, {user.name}!
                </h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Track your movie bookings, view ticket details, and manage your cinema experience all in one place. 
                  Your entertainment history is just a click away.
                </p>
                
                <Link 
                  to="/user/bookings" 
                  className="inline-flex items-center gap-3 bg-gray-800 text-white px-8 py-4 font-semibold uppercase tracking-wide hover:bg-gray-700 transition-colors duration-200"
                >
                  <Ticket className="w-5 h-5" />
                  View My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movies Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Header with Search and Filter */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">Now Showing</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white min-w-48 transition-all"
              >
                <option value="">All Genres</option>
                {getUniqueGenres().map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        {/* Movies Grid */}
        {displayedMovies.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {displayedMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
            
            {/* See More Button */}
            {displayedMovies.length < filteredMovies.length && (
              <div className="text-center">
                <button
                  onClick={loadMoreMovies}
                  className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg mx-auto"
                >
                  <Eye className="w-5 h-5" />
                  See More Movies
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 text-xl mb-2">
              {searchTerm || selectedGenre ? 'No movies found' : 'No movies available'}
            </div>
            <p className="text-gray-400">
              {searchTerm || selectedGenre ? 'Try adjusting your search or filter' : 'Check back later for new releases!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;