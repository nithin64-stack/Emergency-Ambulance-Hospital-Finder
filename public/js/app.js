const socket = io();

socket.on('newEmergencyRequest', (payload) => {
  console.log('New emergency request:', payload);
});

socket.on('emergencyStatusUpdate', (payload) => {
  console.log('Emergency status update:', payload);
});

function attachPasswordToggles() {
  const passwordFields = document.querySelectorAll('input[type="password"]');

  passwordFields.forEach((field) => {
    if (field.dataset.passwordToggleBound === 'true') {
      return;
    }

    const parent = field.parentElement;
    if (!parent) {
      return;
    }

    let toggleButton;

    if (parent.classList.contains('input-group')) {
      toggleButton = parent.querySelector('.password-toggle-btn');
    }

    if (!toggleButton) {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-group';

      parent.insertBefore(wrapper, field);
      wrapper.appendChild(field);

      toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'btn btn-outline-secondary password-toggle-btn';
      toggleButton.setAttribute('aria-label', 'Show password');
      toggleButton.innerHTML = '👁️';
      toggleButton.style.minWidth = '48px';
      toggleButton.style.borderLeft = '0';
      wrapper.appendChild(toggleButton);
    }

    toggleButton.addEventListener('click', () => {
      const shouldShow = field.type === 'password';
      field.type = shouldShow ? 'text' : 'password';
      toggleButton.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
      toggleButton.innerHTML = shouldShow ? '🙈' : '👁️';
      field.focus();
    });

    field.dataset.passwordToggleBound = 'true';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachPasswordToggles();
});
