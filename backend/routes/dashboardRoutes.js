const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { allowPublic, ensureAuth, ensureRole } = require('../middleware/auth');

router.get('/dashboard', ensureAuth, dashboardController.patientDashboard);
router.get('/hospital-finder', allowPublic, dashboardController.hospitalFinder);
router.get('/ambulance-finder', allowPublic, dashboardController.ambulanceFinder);

module.exports = router;
