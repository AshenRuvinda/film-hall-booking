function movieCard(movie) {
    return `
      <div class="border p-4">
        <img src="${movie.poster_url}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p>${movie.description}</p>
      </div>
    `;
  }