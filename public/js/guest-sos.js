document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('guestSosForm');
  const locationField = document.getElementById('guestLocation');
  const latitudeField = document.getElementById('guestLatitude');
  const longitudeField = document.getElementById('guestLongitude');
  const submitButton = document.getElementById('guestSosSubmit');

  if (!form || !locationField) return;

  const showLocationMessage = (message) => {
    locationField.value = message;
  };

  if (!navigator.geolocation) {
    showLocationMessage('Geolocation is not supported in this browser.');
    if (submitButton) {
      submitButton.disabled = true;
    }
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Fetching location...';
  }
  showLocationMessage('Fetching your location...');

  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    latitudeField.value = String(latitude);
    longitudeField.value = String(longitude);
    locationField.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    console.log('SOS GPS coordinates captured', { latitude, longitude });

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Emergency Request';
    }
  }, (error) => {
    console.error('SOS GPS permission error', error);
    showLocationMessage('Location access denied. Please enable location services and refresh the page.');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Location unavailable';
    }
  }, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const phone = document.getElementById('guestPhone').value.trim();
    if (!phone) {
      alert('Phone number is required.');
      document.getElementById('guestPhone').focus();
      return;
    }

    const latitude = Number(latitudeField.value);
    const longitude = Number(longitudeField.value);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      alert('Location is unavailable. Please allow location access and try again.');
      return;
    }

    const payload = {
      guest_name: document.getElementById('guestName').value.trim(),
      guest_phone: phone,
      latitude,
      longitude,
      emergency_type: 'Medical'
    };

    console.log('SOS form submitted', payload);

    try {
      const response = await fetch('/request-ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to submit SOS request.');
      }

      console.log('SOS request API response', result);
      window.location.href = result.statusUrl || `/emergency-status/${result.requestId}`;
    } catch (error) {
      console.error('SOS form submission error', error);
      alert(error.message || 'Unable to submit SOS request.');
    }
  });
});
