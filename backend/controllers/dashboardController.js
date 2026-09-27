const hospitalModel = require('../models/hospitalModel');
const ambulanceModel = require('../models/ambulanceModel');
const emergencyModel = require('../models/emergencyModel');

async function patientDashboard(req, res) {
  try {
    const hospitals = await hospitalModel.getHospitals(10);
    const ambulances = await ambulanceModel.getAmbulances(10);
    const requests = await emergencyModel.getLatestRequestsForPatient(req.user.id);
    res.render('dashboard', {
      user: req.user,
      hospitals,
      ambulances,
      requests,
      showSetPassword: Boolean(req.user.google_id && !req.user.password),
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load dashboard.');
    res.redirect('/');
  }
}

async function hospitalFinder(req, res) {
  try {
    const hospitals = await hospitalModel.getAllHospitals();
    res.render('hospital-finder', { user: req.user, hospitals, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load hospital finder.');
    res.redirect('/dashboard');
  }
}

async function ambulanceFinder(req, res) {
  try {
    const ambulances = await ambulanceModel.getAvailableAmbulances();
    res.render('ambulance-finder', { user: req.user, ambulances, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load ambulance finder.');
    res.redirect('/dashboard');
  }
}

module.exports = { patientDashboard, hospitalFinder, ambulanceFinder };
