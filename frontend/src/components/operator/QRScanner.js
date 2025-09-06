// frontend/src/components/operator/QRScanner.js - FIXED VERSION
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
  const [isInitializing, setIsInitializing] = useState(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up QR scanner...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (error) {
        console.error('Error stopping stream tracks:', error);
      }
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (error) {
        console.error('Error clearing video source:', error);
      }
    }
    
    setIsScanning(false);
    setIsInitializing(false);
  }, []);

  // Scan function
  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !isScanning || scanCooldown) return;
    
    try {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data && code.data !== lastScannedData) {
          console.log('QR code detected:', code.data);
          
          setLastScannedData(code.data);
          setScanCooldown(true);
          
          // Call the onScan callback
          if (onScan) {
            try {
              onScan(code.data);
            } catch (callbackError) {
              console.error('Error in onScan callback:', callbackError);
            }
          }
          
          // Add visual feedback
          try {
            drawBoundingBox(ctx, code.location);
          } catch (drawError) {
            console.error('Error drawing bounding box:', drawError);
          }
          
          // Reset cooldown after 3 seconds to prevent duplicate scans
          setTimeout(() => {
            setScanCooldown(false);
            setLastScannedData('');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Canvas processing error:', error);
    }
  }, [isScanning, lastScannedData, scanCooldown, onScan]);

  // Draw bounding box around detected QR code
  const drawBoundingBox = (ctx, location) => {
    try {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
      ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
      ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
      ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
      ctx.closePath();
      ctx.stroke();
    } catch (error) {
      console.error('Error drawing bounding box:', error);
    }
  };

  // Start camera
  const startCamera = useCallback(async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
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

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if component is still mounted
      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      const videoElement = videoRef.current;
      
      const handleLoadedMetadata = () => {
        videoElement.play()
          .then(() => {
            console.log('Camera started successfully');
            setIsScanning(true);
            setHasCamera(true);
            setIsInitializing(false);
          })
          .catch((playError) => {
            console.error('Video play error:', playError);
            setCameraError('Failed to start video playback');
            setHasCamera(false);
            setIsInitializing(false);
            if (onError) onError('Failed to start video playback');
          });
      };
      
      const handleError = (error) => {
        console.error('Video error:', error);
        setCameraError('Video playback error');
        setHasCamera(false);
        setIsInitializing(false);
        if (onError) onError('Video playback error');
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      videoElement.addEventListener('error', handleError, { once: true });
      
    } catch (error) {
      console.error('Camera access error:', error);
      setHasCamera(false);
      setIsInitializing(false);
      
      let errorMessage = 'Camera access denied or not available';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported.';
      }
      
      setCameraError(errorMessage);
      if (onError) onError(errorMessage);
    }
  }, [isInitializing, onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Start scanning interval
  useEffect(() => {
    if (isScanning && !scanIntervalRef.current) {
      scanIntervalRef.current = setInterval(scan, 100); // Scan every 100ms
    } else if (!isScanning && scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isScanning, scan]);

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await startCamera();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, []); // Only run on mount

  return (
    <div className="qr-scanner-container">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {hasCamera && !cameraError ? (
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
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                {scanCooldown ? (
                  <div className="text-green-400 font-bold text-center">
                    <div className="text-2xl mb-1">✓</div>
                    <div>Scanned!</div>
                  </div>
                ) : isInitializing ? (
                  <div className="text-white text-sm text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div>Initializing...</div>
                  </div>
                ) : (
                  <div className="text-white text-sm text-center">
                    Position QR code within this frame
                  </div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isScanning ? 'bg-green-400 animate-pulse' : 
                isInitializing ? 'bg-yellow-400 animate-pulse' : 
                'bg-red-400'
              }`}></div>
              <span className="text-white text-sm font-medium">
                {isInitializing ? 'Starting...' : isScanning ? 'Scanning...' : 'Not Scanning'}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white p-4">
              {isInitializing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg font-semibold mb-2">Starting Camera...</p>
                  <p className="text-sm text-gray-300">Please wait while we access your camera</p>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">Camera Not Available</p>
                  <p className="text-sm text-gray-300 mb-4">{cameraError || 'Camera access is required'}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Control buttons */}
      <div className="mt-4 flex justify-center space-x-4">
        {hasCamera && !isInitializing && (
          <button
            onClick={isScanning ? stopCamera : startCamera}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isScanning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isScanning ? 'Stop Scanner' : 'Start Scanner'}
          </button>
        )}
        
        {(!hasCamera || cameraError) && !isInitializing && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Retry Camera Access
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-gray-600">
        <p className="text-sm">
          {isInitializing
            ? 'Setting up camera...'
            : hasCamera && !cameraError
            ? 'Hold the QR code steady within the frame to scan'
            : 'Camera access is required to scan QR codes'
          }
        </p>
      </div>
    </div>
  );
}

export default QRScanner;