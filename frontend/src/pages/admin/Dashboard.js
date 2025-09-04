import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="space-y-4">
        <Link to="/admin/movies" className="block bg-blue-500 text-white px-4 py-2 rounded">Manage Movies</Link>
        <Link to="/admin/halls" className="block bg-blue-500 text-white px-4 py-2 rounded">Manage Halls</Link>
        <Link to="/admin/showtimes" className="block bg-blue-500 text-white px-4 py-2 rounded">Manage Showtimes</Link>
        <Link to="/admin/reports" className="block bg-blue-500 text-white px-4 py-2 rounded">View Reports</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;