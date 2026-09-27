const hospitalModel = require('../models/hospitalModel');
const emergencyModel = require('../models/emergencyModel');
const { createConnection } = require('../services/dbService');

async function adminDashboard(req, res) {
  try {
    const conn = await createConnection();
    const [[{ totalUsers }]] = await conn.execute('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalHospitals }]] = await conn.execute('SELECT COUNT(*) AS totalHospitals FROM hospitals');
    const [[{ totalAmbulances }]] = await conn.execute('SELECT COUNT(*) AS totalAmbulances FROM ambulances');
    const [[{ availableAmbulances }]] = await conn.execute('SELECT COUNT(*) AS availableAmbulances FROM ambulances WHERE status = "available"');
    const [[{ activeEmergencies }]] = await conn.execute('SELECT COUNT(*) AS activeEmergencies FROM emergency_requests WHERE status IN ("pending", "accepted", "on_the_way")');
    const [[{ completedEmergencies }]] = await conn.execute('SELECT COUNT(*) AS completedEmergencies FROM emergency_requests WHERE status = "completed"');
    const requests = await emergencyModel.getAllRequests();
    await conn.end();
    res.render('admin-dashboard', { user: req.user, stats: { totalUsers, totalHospitals, totalAmbulances, availableAmbulances, activeEmergencies, completedEmergencies }, requests, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load admin dashboard.');
    res.redirect('/login');
  }
}

async function adminHospitals(req, res) {
  try {
    const hospitals = await hospitalModel.getAllHospitals();
    res.render('admin-hospitals', { user: req.user, hospitals, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load hospitals.');
    res.redirect('/admin');
  }
}

async function addHospital(req, res) {
  try {
    await hospitalModel.addHospital(req.body);
    res.redirect('/admin/hospitals');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/hospitals');
  }
}

async function deleteHospital(req, res) {
  try {
    await hospitalModel.deleteHospital(req.params.id);
    res.redirect('/admin/hospitals');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/hospitals');
  }
}

module.exports = { adminDashboard, adminHospitals, addHospital, deleteHospital };
