document.addEventListener('DOMContentLoaded', () => {
  const hospitalMapEl = document.getElementById('hospitalMap');
  if (!hospitalMapEl || !window.L) {
    return;
  }

  const map = L.map('hospitalMap').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markers = [];
  const hospitalCards = document.querySelectorAll('.btn-directions');
  let userMarker = null;

  hospitalCards.forEach((button) => {
    button.addEventListener('click', () => {
      const lat = parseFloat(button.dataset.lat);
      const lng = parseFloat(button.dataset.lng);
      map.flyTo([lat, lng], 14);
    });
  });

  document.querySelectorAll('.call-hospital').forEach((link) => {
    link.addEventListener('click', (event) => {
      const phone = (link.dataset.phone || '').trim();
      console.log('Hospital call button clicked', { hospital: link.dataset.name, phone });

      if (!phone) {
        event.preventDefault();
        alert('This hospital does not have a phone number on file.');
        return;
      }
    });
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log('Hospital finder GPS captured', { latitude, longitude });
      userMarker = L.marker([latitude, longitude], { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) }).addTo(map).bindPopup('Your Location').openPopup();
      map.setView([latitude, longitude], 13);
      document.querySelectorAll('.list-group-item').forEach((item) => {
        item.style.transition = 'transform 0.2s';
      });
    }, (error) => {
      console.error('Hospital finder GPS error', error);
    });
  }

  document.querySelectorAll('.list-group-item').forEach((item) => {
    const lat = item.querySelector('.btn-directions')?.dataset.lat;
    const lng = item.querySelector('.btn-directions')?.dataset.lng;
    if (lat && lng) {
      const marker = L.marker([parseFloat(lat), parseFloat(lng)], {
        icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2932/2932201.png', iconSize: [32, 32], iconAnchor: [16, 32] })
      }).addTo(map).bindPopup(item.querySelector('h6').textContent);
      markers.push(marker);
    }
  });
});
