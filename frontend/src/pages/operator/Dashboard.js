import React from 'react';
import { Link } from 'react-router-dom';

function OperatorDashboard() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Operator Dashboard</h2>
      <Link to="/operator/scan-ticket" className="block bg-blue-500 text-white px-4 py-2 rounded">
        Scan Ticket
      </Link>
    </div>
  );
}

export default OperatorDashboard;