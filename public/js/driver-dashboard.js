document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  socket.on('newEmergencyRequest', (payload) => {
    console.log('Incoming request', payload);
  });
});
