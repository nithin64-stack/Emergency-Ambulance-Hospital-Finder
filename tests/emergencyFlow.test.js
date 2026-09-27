const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');

const hospitalView = fs.readFileSync(path.join(projectRoot, 'views/hospital-finder.ejs'), 'utf8');
const sosView = fs.readFileSync(path.join(projectRoot, 'views/guest-sos.ejs'), 'utf8');
const ambulanceView = fs.readFileSync(path.join(projectRoot, 'views/ambulance-finder.ejs'), 'utf8');

assert.match(hospitalView, /href="tel:/, 'Hospital call links should use tel: URIs');
assert.match(sosView, /id="guestLocation"/, 'SOS page should expose a location field');
assert.match(sosView, /id="guestLatitude"|id="guestLongitude"/, 'SOS page should include latitude and longitude hidden fields');
assert.match(ambulanceView, /request-ambulance-form|Request Ambulance/, 'Ambulance page should include a working ambulance request form/button');

console.log('Emergency flow regression checks passed');
