const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureRole } = require('../middleware/auth');

router.get('/admin', ensureRole('admin'), adminController.adminDashboard);
router.get('/admin/hospitals', ensureRole('admin'), adminController.adminHospitals);
router.post('/admin/hospitals/add', ensureRole('admin'), adminController.addHospital);
router.post('/admin/hospitals/delete/:id', ensureRole('admin'), adminController.deleteHospital);

module.exports = router;
