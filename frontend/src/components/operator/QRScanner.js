import React, { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
      video.srcObject = stream;
      video.play();

      const scan = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) onScan(code.data);
        }
        requestAnimationFrame(scan);
      };
      scan();
    });

    return () => {
      video.srcObject?.getTracks().forEach((track) => track.stop());
    };
  }, [onScan]);

  return (
    <div>
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}

export default QRScanner;