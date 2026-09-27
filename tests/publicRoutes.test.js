const assert = require('node:assert/strict');
const dashboardRoutes = require('../backend/routes/dashboardRoutes');
const pageRoutes = require('../backend/routes/pageRoutes');

function getRoute(router, path) {
  return router.stack.find((layer) => layer.route && layer.route.path === path);
}

const hospitalRoute = getRoute(dashboardRoutes, '/hospital-finder');
const ambulanceRoute = getRoute(dashboardRoutes, '/ambulance-finder');
const sosRoute = getRoute(pageRoutes, '/guest-sos');
const statusRoute = getRoute(pageRoutes, '/emergency-status/:id');

assert.ok(hospitalRoute, 'Expected /hospital-finder route to be registered');
assert.ok(ambulanceRoute, 'Expected /ambulance-finder route to be registered');
assert.ok(sosRoute, 'Expected /guest-sos route to be registered');
assert.ok(statusRoute, 'Expected /emergency-status/:id route to be registered');

assert.ok(hospitalRoute.route.stack.some((layer) => layer.name === 'allowPublic'), 'Expected /hospital-finder to bypass auth');
assert.ok(ambulanceRoute.route.stack.some((layer) => layer.name === 'allowPublic'), 'Expected /ambulance-finder to bypass auth');
assert.ok(sosRoute.route.stack.some((layer) => layer.name === 'allowPublic'), 'Expected /guest-sos to bypass auth');
assert.ok(statusRoute.route.stack.some((layer) => layer.name === 'allowPublic'), 'Expected /emergency-status/:id to bypass auth');

console.log('Public emergency route access test passed');
