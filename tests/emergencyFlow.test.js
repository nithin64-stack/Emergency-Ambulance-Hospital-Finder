const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const emergencyModel = require('../backend/models/emergencyModel');

const projectRoot = path.join(__dirname, '..');

const hospitalView = fs.readFileSync(path.join(projectRoot, 'views/hospital-finder.ejs'), 'utf8');
const sosView = fs.readFileSync(path.join(projectRoot, 'views/guest-sos.ejs'), 'utf8');
const ambulanceView = fs.readFileSync(path.join(projectRoot, 'views/ambulance-finder.ejs'), 'utf8');

(async () => {
  assert.match(hospitalView, /tel:/, 'Hospital call links should contain tel: URIs in the template');
  assert.match(sosView, /id="guestLocation"/, 'SOS page should expose a location field');
  assert.match(sosView, /id="guestLatitude"|id="guestLongitude"/, 'SOS page should include latitude and longitude hidden fields');
  assert.match(ambulanceView, /request-ambulance-form|Request Ambulance/, 'Ambulance page should include a working ambulance request form/button');
  assert.match(ambulanceView, /name="phone"/, 'Ambulance page should include a phone input for request submissions');
  assert.match(ambulanceView, /type="tel"/, 'Ambulance page phone field should use tel input type');

  const requestId = await emergencyModel.createRequest({
    guest_name: 'Ambulance Flow Test',
    phone: '9876543210',
    emergency_type: 'Medical',
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'pending'
  });

  const queuedRequests = await emergencyModel.getDriverRequests();
  const createdRequest = queuedRequests.find((entry) => entry.id === requestId);

  assert.ok(requestId, 'Expected request ID to be created for ambulance flow');
  assert.ok(createdRequest, 'Expected ambulance request to appear in driver dashboard queue');
  assert.equal(createdRequest.guest_phone, '9876543210', 'Expected the phone number to persist in the database');

  console.log('Emergency flow regression checks passed');
  process.exit(0);
})().catch((error) => {
  console.error('Emergency flow regression checks failed:', error);
  process.exit(1);
});
