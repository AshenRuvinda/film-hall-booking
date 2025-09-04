function loadBookingSummary(bookingData) {
    document.getElementById('app').innerHTML = `
      <div>Booking Summary</div>
      <!-- Use bookingCard -->
      ${bookingCard(bookingData)}
      <button onclick="downloadTicket(bookingData)">Download Ticket</button>
    `;
  }
  
  function downloadTicket(booking) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`Movie: ${booking.movie}`, 10, 10);
    // Generate QR
    const qrData = { bookingId: booking.id }; // Stringify as needed
    const qr = new QRCode(document.createElement('div'), { text: JSON.stringify(qrData) });
    // Add QR to PDF (simplified, need to convert canvas to image)
    doc.save('ticket.pdf');
  }