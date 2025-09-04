function loadUserLogin() {
    document.getElementById('app').innerHTML = `
      <div class="container mx-auto p-4">
        <h1 class="text-2xl">User Login</h1>
        <input id="email" placeholder="Email" class="border p-2">
        <input id="password" type="password" placeholder="Password" class="border p-2">
        <button onclick="login(document.getElementById('email').value, document.getElementById('password').value, 'user')" class="bg-blue-500 text-white p-2">Login</button>
        <button onclick="register('Name', document.getElementById('email').value, document.getElementById('password').value, 'user')" class="bg-green-500 text-white p-2">Register</button>
      </div>
    `;
  }