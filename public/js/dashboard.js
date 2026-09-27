document.addEventListener('DOMContentLoaded', () => {
  const locationInput = document.getElementById('currentLocation');
  const sosButton = document.getElementById('sosButton');

  if (!locationInput && !sosButton) {
    return;
  }

  if (locationInput && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      locationInput.value = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
    }, () => {
      locationInput.value = 'Location access denied.';
    });
  }

  if (sosButton) {
    sosButton.addEventListener('click', async () => {
      console.log('Dashboard SOS button clicked');
      if (!confirm('Send SOS emergency request now?')) return;
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(async (position) => {
        const data = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          emergency_type: 'Medical'
        };
        console.log('Dashboard SOS GPS captured', data);
        const response = await fetch('/request-ambulance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          alert('SOS emergency request submitted.');
          window.location.reload();
        } else {
          alert('Unable to submit SOS request.');
        }
      }, () => {
        alert('Unable to get your current location.');
      });
    });
  }
});
