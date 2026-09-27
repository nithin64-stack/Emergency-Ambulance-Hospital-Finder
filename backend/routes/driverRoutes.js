const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { ensureRole } = require('../middleware/auth');

router.get('/driver', ensureRole('driver'), driverController.driverDashboard);
router.post('/driver/request/:id/accept', ensureRole('driver'), driverController.acceptRequest);
router.post('/driver/request/:id/reject', ensureRole('driver'), driverController.rejectRequest);

module.exports = router;
