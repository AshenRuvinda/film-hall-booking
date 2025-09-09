// frontend/src/pages/admin/ManageShowtimes.js - ENHANCED UI VERSION
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { 
  Clock, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Calendar, 
  MapPin, 
  Film, 
  Plus,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  Timer,
  Users,
  PlayCircle
} from 'lucide-react';

function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({
    movieId: '',
    hallId: '',
    startTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterShowtimes();
  }, [showtimes, searchTerm, selectedMovie, selectedHall]);

  const fetchData = async () => {
    try {
      const [showtimesRes, moviesRes, hallsRes] = await Promise.all([
        api.get('/admin/showtimes'),
        api.get('/user/movies'),
        api.get('/admin/halls')
      ]);
      
      setShowtimes(showtimesRes.data);
      setMovies(moviesRes.data);
      setHalls(hallsRes.data);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Fetch data error:', error);
    }
  };

  const filterShowtimes = () => {
    let filtered = showtimes;

    if (searchTerm) {
      filtered = filtered.filter(showtime =>
        showtime.movieId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showtime.hallId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMovie) {
      filtered = filtered.filter(showtime => showtime.movieId?._id === selectedMovie);
    }

    if (selectedHall) {
      filtered = filtered.filter(showtime => showtime.hallId?._id === selectedHall);
    }

    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    setFilteredShowtimes(filtered);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({ movieId: '', hallId: '', startTime: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.movieId || !form.hallId || !form.startTime) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/admin/showtimes/${editingId}`, form);
        setSuccess('Showtime updated successfully!');
      } else {
        await api.post('/admin/showtimes', form);
        setSuccess('Showtime created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.msg || `Failed to ${editingId ? 'update' : 'create'} showtime`);
      console.error('Showtime operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (showtime) => {
    setEditingId(showtime._id);
    setForm({
      movieId: showtime.movieId?._id || '',
      hallId: showtime.hallId?._id || '',
      startTime: new Date(showtime.startTime).toISOString().slice(0, 16)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) {
      return;
    }

    try {
      await api.delete(`/admin/showtimes/${id}`);
      setSuccess('Showtime deleted successfully!');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete showtime');
      console.error('Delete showtime error:', error);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const getStatusColor = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'text-blue-600 bg-blue-100';
    if (now >= start && now <= end) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Playing';
    return 'Finished';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Showtimes</h1>
                <p className="text-gray-600">Schedule and manage movie showtimes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{showtimes.length}</p>
              <p className="text-sm text-gray-500">Total Showtimes</p>
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

        {/* Showtime Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Showtime' : 'Add New Showtime'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Movie Selection */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Film className="h-4 w-4 mr-2 text-gray-400" />
                  Movie *
                </label>
                <select
                  name="movieId"
                  value={form.movieId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title} ({movie.duration} min)
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Hall Selection */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  Hall *
                </label>
                <select
                  name="hallId"
                  value={form.hallId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a hall</option>
                  {halls.map((hall) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name} ({hall.totalSeats} seats)
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Start Time */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Processing...' : (editingId ? 'Update Showtime' : 'Add Showtime')}</span>
              </button>
              
              {editingId && (
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search showtimes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Movie Filter */}
              <div className="relative">
                <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-40"
                >
                  <option value="">All Movies</option>
                  {movies.map(movie => (
                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                  ))}
                </select>
              </div>

              {/* Hall Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-36"
                >
                  <option value="">All Halls</option>
                  {halls.map(hall => (
                    <option key={hall._id} value={hall._id}>{hall.name}</option>
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
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Showtimes Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShowtimes.map((showtime) => (
              <div 
                key={showtime._id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  editingId === showtime._id ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {showtime.movieId?.title || 'Unknown Movie'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {showtime.hallId?.name || 'Unknown Hall'}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showtime.startTime, showtime.endTime)}`}>
                      {getStatusText(showtime.startTime, showtime.endTime)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3 w-3 mr-2" />
                      {new Date(showtime.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-2" />
                      {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-3 w-3 mr-2" />
                      {showtime.hallId?.totalSeats || 0} seats
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(showtime)}
                      className="flex items-center space-x-1 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(showtime._id)}
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Existing Showtimes</h3>
            </div>
            {filteredShowtimes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShowtimes.map((showtime) => (
                      <tr 
                        key={showtime._id} 
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          editingId === showtime._id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Film className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {showtime.movieId?.title || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {showtime.hallId?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(showtime.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(showtime.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showtime.startTime, showtime.endTime)}`}>
                            {getStatusText(showtime.startTime, showtime.endTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(showtime)}
                              className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100 transition-colors duration-200"
                              title="Edit showtime"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(showtime._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors duration-200"
                              title="Delete showtime"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No showtimes found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
        
        {filteredShowtimes.length === 0 && showtimes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No showtimes found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
        
        {showtimes.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No showtimes yet</h3>
            <p className="text-gray-500 mb-6">Get started by scheduling your first showtime above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageShowtimes;