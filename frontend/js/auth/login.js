function login(email, password, role) {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.role) {
        localStorage.setItem('userRole', data.role);
        window.location.hash = `${data.role}/dashboard`;
      }
    })
    .catch(err => console.error(err));
  }
  
  function register(name, email, password, role) {
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    .then(res => res.json())
    .then(() => alert('Registered'))
    .catch(err => console.error(err));
  }