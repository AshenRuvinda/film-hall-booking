function loadUserDashboard() {
    fetch('/api/user/movies')
      .then(res => res.json())
      .then(movies => {
        let html = '<div class="grid grid-cols-3 gap-4">';
        movies.forEach(movie => {
          html += movieCard(movie); // from components/movieCard.js
        });
        html += '</div>';
        document.getElementById('app').innerHTML = html;
      });
  }