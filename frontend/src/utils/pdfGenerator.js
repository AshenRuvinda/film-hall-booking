import jsPDF from 'jspdf';

export const generatePDF = (booking) => {
  const doc = new jsPDF();
  doc.text(`Booking ID: ${booking._id}`, 10, 10);
  doc.text(`Showtime: ${new Date(booking.showtimeId.startTime).toLocaleString()}`, 10, 20);
  doc.text(`Seats: ${booking.seats.join(', ')}`, 10, 30);
  doc.text(`Total: $${booking.totalPrice}`, 10, 40);
  doc.addImage(booking.qrCode, 'PNG', 10, 50, 50, 50);
  doc.save(`ticket_${booking._id}.pdf`);
};