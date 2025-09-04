function loadMovieDetail(movieId) {
    fetch(`/api/user/showtimes/${movieId}`)
      .then(res => res.json())
      .then(showtimes => {
        // Display showtimes, link to seatSelection
        document.getElementById('app').innerHTML = 'Movie Details and Showtimes...';
      });
  }