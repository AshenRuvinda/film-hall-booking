import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/reports').then((res) => setReports(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="border p-4 rounded">
            <p>Revenue: ${report.revenue}</p>
            <p>Bookings: {report.bookings}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;