function loadStaffLogin() {
    document.getElementById('app').innerHTML = `
      <div class="container mx-auto p-4">
        <h1 class="text-2xl">Staff Login</h1>
        <input id="email" placeholder="Email" class="border p-2">
        <input id="password" type="password" placeholder="Password" class="border p-2">
        <select id="role">
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
        </select>
        <button onclick="login(document.getElementById('email').value, document.getElementById('password').value, document.getElementById('role').value)" class="bg-blue-500 text-white p-2">Login</button>
      </div>
    `;
  }