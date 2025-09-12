// frontend/src/pages/admin/ManageMovies.js - ENHANCED UI VERSION
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Film, 
  Clock, 
  Tag, 
  Image, 
  FileText,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [form, setForm] = useState({
    title: '',
    description: '',
    poster: '',
    duration: '',
    genre: ''
  });

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary','Biography','Animation','Fantasy','Adventure'];

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/user/movies');
      setMovies(res.data);
    } catch (error) {
      setError('Failed to fetch movies');
      console.error('Fetch movies error:', error);
    }
  };

  const filterMovies = () => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    setFilteredMovies(filtered);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingMovie) {
        await api.put(`/admin/movies/${editingMovie._id}`, form);
        setSuccess('Movie updated successfully!');
      } else {
        await api.post('/admin/movies', form);
        setSuccess('Movie added successfully!');
      }
      
      resetForm();
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.msg || 'Operation failed');
      console.error('Movie operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      description: movie.description || '',
      poster: movie.poster || '',
      duration: movie.duration || '',
      genre: movie.genre || ''
    });
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      await api.delete(`/admin/movies/${movieId}`);
      setSuccess('Movie deleted successfully!');
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.msg || 'Delete failed');
      console.error('Delete movie error:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      poster: '',
      duration: '',
      genre: ''
    });
    setEditingMovie(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Film className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Movies</h1>
                <p className="text-gray-600">Add, edit, and organize your movie collection</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{movies.length}</p>
              <p className="text-sm text-gray-500">Total Movies</p>
            </div>
          </div>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Movie Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMovie ? 'Edit Movie' : 'Add New Movie'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title Field */}
              <div className="lg:col-span-1">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Film className="h-4 w-4 mr-2 text-gray-400" />
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter movie title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              {/* Genre Field */}
              <div className="lg:col-span-1">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 mr-2 text-gray-400" />
                  Genre
                </label>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a genre</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              {/* Duration Field */}
              <div className="lg:col-span-1">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="120"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              {/* Poster URL Field */}
              <div className="lg:col-span-1">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Image className="h-4 w-4 mr-2 text-gray-400" />
                  Poster URL
                </label>
                <input
                  type="url"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Description Field */}
              <div className="lg:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter movie description..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Processing...' : (editingMovie ? 'Update Movie' : 'Add Movie')}</span>
              </button>
              
              {editingMovie && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Genre Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Movies Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  {movie.poster ? (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${movie.poster ? 'hidden' : 'flex'}`}
                  >
                    <Film className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {movie.duration}min
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{movie.title}</h3>
                  
                  {movie.genre && (
                    <div className="flex items-center mb-2">
                      <Tag className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{movie.genre}</span>
                    </div>
                  )}
                  
                  {movie.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{movie.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(movie)}
                      className="flex items-center space-x-1 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(movie._id)}
                      className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredMovies.map((movie, index) => (
                <div key={movie._id} className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${index === 0 ? 'rounded-t-xl' : ''} ${index === filteredMovies.length - 1 ? 'rounded-b-xl' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {movie.poster ? (
                          <img 
                            src={movie.poster} 
                            alt={movie.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center ${movie.poster ? 'hidden' : 'flex'}`}
                        >
                          <Film className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{movie.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {movie.genre && (
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{movie.genre}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{movie.duration} min</span>
                          </div>
                        </div>
                        {movie.description && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-1">{movie.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="flex items-center space-x-1 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filteredMovies.length === 0 && movies.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
        
        {movies.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No movies yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first movie above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageMovies;