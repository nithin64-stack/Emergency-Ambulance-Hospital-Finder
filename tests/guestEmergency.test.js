const assert = require('node:assert/strict');
const emergencyModel = require('../backend/models/emergencyModel');

(async () => {
  try {
    const requestId = await emergencyModel.createEmergencyRequest({
      patient_id: null,
      guest_name: 'Guest User',
      guest_phone: '9876543210',
      emergency_type: 'Medical',
      latitude: 12.9716,
      longitude: 77.5946,
      status: 'pending'
    });

    const requests = await emergencyModel.getDriverRequests();
    const created = requests.find((entry) => entry.id === requestId);

    assert.ok(requestId, 'Expected emergency request ID');
    assert.ok(created, 'Expected guest emergency request to appear in driver queue');
    assert.equal(created.guest_phone, '9876543210');
    assert.equal(created.patient_name, 'Guest User');
    console.log('Guest emergency request test passed');
    process.exit(0);
  } catch (error) {
    console.error('Guest emergency request test failed:', error);
    process.exit(1);
  }
})();
