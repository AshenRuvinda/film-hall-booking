// frontend/src/pages/operator/ScanTicket.js - FIXED SEAT DISPLAY VERSION
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import QRScanner from '../../components/operator/QRScanner';

function ScanTicket() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const audioRef = useRef(null);

  // Play scan sound
  const playSound = (success = true) => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = success ? 800 : 400;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);
    } catch (error) {
      console.log('Audio context not supported');
    }
  };

  // Fixed function to properly format seat information
  const formatSeats = (seats) => {
    if (!seats || !Array.isArray(seats)) return 'N/A';
    
    return seats.map(seat => {
      // Handle different seat object formats
      if (typeof seat === 'object') {
        // Try different possible seat identifier properties
        return seat.seatId || seat.seatNumber || seat.id || 'Unknown Seat';
      } else if (typeof seat === 'string') {
        return seat;
      } else {
        return 'Unknown Seat';
      }
    }).join(', ');
  };

  const handleScan = async (qrData) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Scanning QR data:', qrData);
      
      const response = await api.post('/operator/scan', { qrData });
      const booking = response.data;
      
      setScanResult(booking);
      playSound(true);
      
      // Add to scan history
      setScanHistory(prev => [{
        id: booking._id,
        timestamp: new Date(),
        success: true,
        data: qrData
      }, ...prev.slice(0, 9)]); // Keep last 10 scans
      
    } catch (error) {
      console.error('Scan failed:', error);
      playSound(false);
      
      let errorMessage = 'Failed to scan ticket';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      setError(errorMessage);
      setScanResult(null);
      
      // Add failed scan to history
      setScanHistory(prev => [{
        id: Date.now(),
        timestamp: new Date(),
        success: false,
        error: errorMessage,
        data: qrData
      }, ...prev.slice(0, 9)]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.put(`/operator/check-in/${bookingId}`);
      const updatedBooking = response.data;
      
      setScanResult(updatedBooking);
      playSound(true);
      
    } catch (error) {
      console.error('Check-in failed:', error);
      playSound(false);
      
      let errorMessage = 'Check-in failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'checked-in': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/operator/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Ticket Scanner</h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
          
          <QRScanner 
            onScan={handleScan} 
            onError={setError}
          />
          
          {/* Manual Input Option */}
          <div className="mt-4">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              {showManualInput ? 'Hide' : 'Show'} Manual Input
            </button>
            
            {showManualInput && (
              <div className="mt-3 flex space-x-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter QR code data manually"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={handleManualScan}
                  disabled={!manualInput.trim() || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  Scan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scan Result</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Processing...</span>
            </div>
          )}
          
          {scanResult && !loading && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">Booking Details</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scanResult.status)}`}>
                    {scanResult.status.charAt(0).toUpperCase() + scanResult.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Booking ID:</span> {scanResult._id}</p>
                  
                  {/* Customer Information */}
                  {scanResult.userId && (
                    <>
                      <p><span className="font-medium">Customer:</span> {scanResult.userId.name}</p>
                      <p><span className="font-medium">Email:</span> {scanResult.userId.email}</p>
                    </>
                  )}
                  
                  {scanResult.showtimeId && (
                    <>
                      {scanResult.showtimeId.movieId && (
                        <p><span className="font-medium">Movie:</span> {scanResult.showtimeId.movieId.title}</p>
                      )}
                      {scanResult.showtimeId.hallId && (
                        <p><span className="font-medium">Hall:</span> {scanResult.showtimeId.hallId.name}</p>
                      )}
                      <p><span className="font-medium">Show Time:</span> {formatDateTime(scanResult.showtimeId.startTime)}</p>
                    </>
                  )}
                  
                  {/* Fixed seat display */}
                  <p><span className="font-medium">Seats:</span> {formatSeats(scanResult.seats)}</p>
                  
                  {/* Additional seat details */}
                  {scanResult.seats && Array.isArray(scanResult.seats) && (
                    <p><span className="font-medium">Number of Seats:</span> {scanResult.seats.length}</p>
                  )}
                  
                  <p><span className="font-medium">Total Price:</span> ${scanResult.totalPrice}</p>
                  <p><span className="font-medium">Booking Date:</span> {formatDateTime(scanResult.createdAt)}</p>
                  
                  {/* Check-in information */}
                  {scanResult.checkedInAt && (
                    <p><span className="font-medium">Checked In:</span> {formatDateTime(scanResult.checkedInAt)}</p>
                  )}
                </div>
                
                {scanResult.status === 'confirmed' && (
                  <button
                    onClick={() => handleCheckIn(scanResult._id)}
                    disabled={loading}
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Processing...' : 'Check In Customer'}
                  </button>
                )}
                
                {scanResult.status === 'checked-in' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <svg className="mx-auto h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700 font-medium">Customer Already Checked In</p>
                    {scanResult.checkedInAt && (
                      <p className="text-green-600 text-sm mt-1">
                        Checked in on {formatDateTime(scanResult.checkedInAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!scanResult && !loading && (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v-3m0 0h4.01M12 9h-4.01" />
              </svg>
              <p>Scan a QR code to view ticket details</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
          <div className="space-y-2">
            {scanHistory.map((scan, index) => (
              <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${scan.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{formatDateTime(scan.timestamp)}</span>
                  {scan.success ? (
                    <span className="text-green-600">Booking #{scan.id.slice(-8)}</span>
                  ) : (
                    <span className="text-red-600">{scan.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanTicket;