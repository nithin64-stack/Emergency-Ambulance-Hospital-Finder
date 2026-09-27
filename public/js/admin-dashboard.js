document.addEventListener('DOMContentLoaded', () => {
  const chartCtx = document.getElementById('statsChart');
  if (!chartCtx) return;

  const data = {
    labels: ['Total Users', 'Hospitals', 'Ambulances', 'Active Emergencies', 'Completed Emergencies'],
    datasets: [{
      label: 'Emergency System Overview',
      data: [
        parseInt(chartCtx.dataset.users, 10),
        parseInt(chartCtx.dataset.hospitals, 10),
        parseInt(chartCtx.dataset.ambulances, 10),
        parseInt(chartCtx.dataset.active, 10),
        parseInt(chartCtx.dataset.completed, 10)
      ],
      backgroundColor: ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1']
    }]
  };

  new Chart(chartCtx, { type: 'doughnut', data });
});
