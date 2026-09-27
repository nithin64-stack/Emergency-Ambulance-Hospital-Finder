const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/request-ambulance', requestController.requestAmbulance);

module.exports = router;
