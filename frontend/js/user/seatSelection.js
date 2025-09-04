function loadSeatSelection(showtimeId) {
    // Fetch seats for showtime
    // Use seatMap component
    document.getElementById('app').innerHTML = seatMap(); // from components/seatMap.js
  }