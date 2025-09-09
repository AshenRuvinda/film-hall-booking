import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Film, Calendar, Download, RefreshCw } from 'lucide-react';
// Add one of these imports based on your project structure:
import api from '../../utils/api'; // or wherever your api service is located
// OR
// import axios from 'axios';
// const api = axios.create({ baseURL: 'your-api-base-url' });

function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (error) {
      setError('Failed to fetch reports');
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const handleExport = () => {
    if (!reports || !reports.overview) {
      alert('No data available to export');
      return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add summary section
    csvContent += "Cinema Reports Summary\n";
    csvContent += "Generated on," + new Date().toLocaleDateString() + "\n\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Bookings,${reports.overview.totalBookings || 0}\n`;
    csvContent += `Total Revenue,${reports.overview.totalRevenue || 0}\n`;
    csvContent += `Total Movies,${reports.overview.totalMovies || 0}\n`;
    csvContent += `Total Halls,${reports.overview.totalHalls || 0}\n`;
    csvContent += `Active Halls,${reports.overview.activeHalls || 0}\n`;
    csvContent += `Average per Booking,${reports.overview.totalBookings > 0 ? (reports.overview.totalRevenue / reports.overview.totalBookings).toFixed(2) : '0.00'}\n`;
    csvContent += `Popular Movies Count,${reports.popularMovies?.length || 0}\n\n`;
    
    // Add popular movies section
    if (reports.popularMovies && reports.popularMovies.length > 0) {
      csvContent += "Popular Movies\n";
      csvContent += "Rank,Movie Title,Genre,Bookings,Revenue,Total Seats\n";
      reports.popularMovies.forEach((movie, index) => {
        csvContent += `${index + 1},"${movie.title}","${movie.genre || 'N/A'}",${movie.bookings || 0},${movie.revenue || 0},${movie.totalSeats || 0}\n`;
      });
      csvContent += "\n";
    }

    // Add hall utilization section
    if (reports.hallUtilization && reports.hallUtilization.length > 0) {
      csvContent += "Hall Utilization\n";
      csvContent += "Hall Name,Location,Total Seats,Showtimes,Bookings,Utilization Rate\n";
      reports.hallUtilization.forEach((hall) => {
        csvContent += `"${hall.name}","${hall.location}",${hall.totalSeats},${hall.showtimeCount},${hall.totalBookings},${(hall.utilizationRate * 100).toFixed(1)}%\n`;
      });
    }
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cinema_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <div className="text-lg text-gray-600">Loading reports...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">Overview of booking performance and revenue insights</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        {reports && reports.overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.overview.totalBookings || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>All time</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${reports.overview.totalRevenue || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Total earnings</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Average per Booking</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${reports.overview.totalBookings > 0 ? (reports.overview.totalRevenue / reports.overview.totalBookings).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>Per transaction</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Movies</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.overview.totalMovies || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Film className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Film className="w-4 h-4 mr-1" />
                  <span>Movie catalog</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Halls</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.overview.activeHalls || 0}/{reports.overview.totalHalls || 0}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Cinema halls</span>
                </div>
              </div>
            </div>

            {/* Popular Movies Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Film className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Popular Movies</h3>
                </div>
              </div>
              
              {reports.popularMovies && reports.popularMovies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Movie Title
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Genre
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.popularMovies.map((movie, index) => (
                        <tr key={movie._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-gray-900">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <Film className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{movie.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {movie.genre || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{movie.bookings || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-semibold text-gray-900">${movie.revenue || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '100px' }}>
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${Math.min(
                                      (movie.bookings / Math.max(...reports.popularMovies.map(m => m.bookings || 0), 1)) * 100, 
                                      100
                                    )}%` 
                                  }}
                                ></div>
                              </div>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No movie data available</h3>
                  <p className="text-gray-500">Start booking movies to see performance analytics here.</p>
                </div>
              )}
            </div>

            {/* Hall Utilization */}
            {reports.hallUtilization && reports.hallUtilization.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Hall Utilization</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Hall Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total Seats
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Showtimes
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Utilization
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.hallUtilization.map((hall) => (
                        <tr key={hall._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <Film className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{hall.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{hall.location}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{hall.totalSeats}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{hall.showtimeCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{hall.totalBookings}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(hall.utilizationRate * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">
                                {(hall.utilizationRate * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Bookings */}
            {reports.recentBookings && reports.recentBookings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Movie
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Hall
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Seats
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.recentBookings.slice(0, 10).map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{booking.customerName}</span>
                              <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{booking.movieTitle}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{booking.hallName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{booking.seatsCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">${booking.totalPrice}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Booking Status</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reports.overview.totalBookings > 0 ? 'Active' : 'No bookings yet'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Revenue Stream</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reports.overview.totalRevenue > 0 ? 'Generating' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Hall Efficiency</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reports.overview.activeHalls}/{reports.overview.totalHalls} Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Data Coverage</span>
                    <span className="text-sm font-medium text-gray-900">All time</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
                </div>
                <div className="text-center py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {reports.overview.totalBookings || 0}
                      </div>
                      <p className="text-xs text-gray-500">Total Bookings</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${reports.overview.totalRevenue || 0}
                      </div>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {reports.overview.totalBookings > 0 
                        ? 'Your cinema is performing well with active bookings!'
                        : 'Ready to track your cinema\'s performance as bookings come in'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;