const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { allowPublic } = require('../middleware/auth');

router.get('/', pageController.home);
router.get('/about', pageController.about);
router.get('/contact', pageController.contact);
router.get('/guest-sos', allowPublic, pageController.guestSos);
router.get('/emergency-status/:id', allowPublic, pageController.emergencyStatus);
router.get('/login', pageController.login);
router.get('/register', pageController.register);

module.exports = router;
