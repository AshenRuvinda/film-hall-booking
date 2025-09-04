function loadMyBookings() {
    fetch('/api/user/bookings')
      .then(res => res.json())
      .then(bookings => {
        let html = '';
        bookings.forEach(b => html += bookingCard(b));
        document.getElementById('app').innerHTML = html;
      });
  }