import React, { useState } from 'react';
import axios from 'axios';
import QRScanner from '../../components/operator/QRScanner';

function ScanTicket() {
  const [result, setResult] = useState(null);

  const handleScan = async (data) => {
    try {
      const res = await axios.post('/api/operator/scan', { qrCode: data });
      setResult(res.data.booking);
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('/api/operator/check-in', { bookingId: result._id });
      setResult({ ...result, status: 'checked-in' });
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Scan Ticket</h2>
      <QRScanner onScan={handleScan} />
      {result && (
        <div className="mt-4 border p-4 rounded">
          <p>Booking ID: {result._id}</p>
          <p>Status: {result.status}</p>
          <button
            onClick={handleCheckIn}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            disabled={result.status === 'checked-in'}
          >
            Check In
          </button>
        </div>
      )}
    </div>
  );
}

export default ScanTicket;