function loadScanTicket() {
    document.getElementById('app').innerHTML = qrScanner(); // from components/qrScanner.js
  }
  
  // Example scan function
  function scanQR(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      fetch('/api/operator/scan', {
        method: 'POST',
        body: JSON.stringify({ qrData: code.data }),
      }).then(res => res.json()).then(booking => {
        // Display booking details
        alert(JSON.stringify(booking));
      });
    }
  }