function loadReports() {
    fetch('/api/admin/reports')
      .then(res => res.json())
      .then(data => {
        document.getElementById('app').innerHTML = `Total Revenue: ${data.total}`;
      });
  }