function qrScanner() {
    return `
      <video id="video" width="300" height="200"></video>
      <button onclick="startScanner()">Start Scan</button>
    `;
  }
  
  function startScanner() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        setInterval(() => scanQR(video), 1000);
      });
  }