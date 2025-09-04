// frontend/src/components/operator/QRScanner.js - ENHANCED VERSION
import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

function QRScanner({ onScan, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [lastScannedData, setLastScannedData] = useState('');
  const [scanCooldown, setScanCooldown] = useState(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  }, []);

  // Scan function
  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !isScanning) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data && code.data !== lastScannedData && !scanCooldown) {
          setLastScannedData(code.data);
          setScanCooldown(true);
          
          // Call the onScan callback
          if (onScan) {
            onScan(code.data);
          }
          
          // Add visual feedback
          drawBoundingBox(ctx, code.location);
          
          // Reset cooldown after 2 seconds to prevent duplicate scans
          setTimeout(() => {
            setScanCooldown(false);
            setLastScannedData('');
          }, 2000);
        }
      } catch (error) {
        console.error('Canvas drawing error:', error);
      }
    }
  }, [isScanning, lastScannedData, scanCooldown, onScan]);

  // Draw bounding box around detected QR code
  const drawBoundingBox = (ctx, location) => {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.stroke();
  };

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera with back camera preference
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsScanning(true);
              setHasCamera(true);
            })
            .catch((playError) => {
              console.error('Video play error:', playError);
              setCameraError('Failed to start video playback');
              if (onError) onError('Failed to start video playback');
            });
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setHasCamera(false);
      
      let errorMessage = 'Camera access denied or not available';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      
      setCameraError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Start scanning interval
  useEffect(() => {
    if (isScanning) {
      scanIntervalRef.current = setInterval(scan, 100); // Scan every 100ms
    }
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, scan]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    
    return cleanup;
  }, [startCamera, cleanup]);

  return (
    <div className="qr-scanner-container">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {hasCamera ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-64 md:h-80 object-cover"
              playsInline
              muted
              style={{ transform: 'scaleX(-1)' }} // Mirror the video
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                {scanCooldown ? (
                  <div className="text-green-400 font-bold">✓ Scanned!</div>
                ) : (
                  <div className="text-white text-sm text-center">
                    Position QR code within this frame
                  </div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white text-sm font-medium">
                {isScanning ? 'Scanning...' : 'Not Scanning'}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white p-4">
              <svg className="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-semibold mb-2">Camera Not Available</p>
              <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Control buttons */}
      <div className="mt-4 flex justify-center space-x-4">
        {hasCamera && (
          <>
            <button
              onClick={isScanning ? stopCamera : startCamera}
              className={`px-4 py-2 rounded-lg font-medium ${
                isScanning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isScanning ? 'Stop Scanner' : 'Start Scanner'}
            </button>
          </>
        )}
        
        {!hasCamera && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Retry Camera Access
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-gray-600">
        <p className="text-sm">
          {hasCamera 
            ? 'Hold the QR code steady within the frame to scan' 
            : 'Camera access is required to scan QR codes'
          }
        </p>
      </div>
    </div>
  );
}

export default QRScanner;