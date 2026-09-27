document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.request-ambulance-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const button = form.querySelector('.request-ambulance');
      const ambulanceId = form.dataset.ambulanceId || form.querySelector('input[name="ambulance_id"]').value;
      console.log('Ambulance request clicked', { ambulanceId });

      if (!navigator.geolocation) {
        alert('Geolocation is not supported in this browser.');
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Requesting...';
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const payload = {
          ambulance_id: ambulanceId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          emergency_type: 'Medical'
        };

        console.log('Submitting ambulance request', payload);

        try {
          const response = await fetch('/request-ambulance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to submit ambulance request.');
          }

          console.log('Ambulance request API response', result);
          alert(result.message || 'Ambulance request submitted.');
          window.location.href = result.statusUrl || `/emergency-status/${result.requestId}`;
        } catch (error) {
          console.error('Ambulance request submission error', error);
          alert(error.message || 'Unable to submit ambulance request.');
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = 'Request Ambulance';
          }
        }
      }, (error) => {
        console.error('Ambulance finder GPS error', error);
        alert('Unable to access your location. Please allow geolocation and try again.');
        if (button) {
          button.disabled = false;
          button.textContent = 'Request Ambulance';
        }
      }, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });
  });
});
