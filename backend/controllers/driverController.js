const ambulanceModel = require('../models/ambulanceModel');
const emergencyModel = require('../models/emergencyModel');

async function driverDashboard(req, res) {
  try {
    const ambulance = await ambulanceModel.findAmbulanceByDriver(req.user.id);
    const requests = await emergencyModel.getDriverRequests();

    res.render('driver-dashboard', {
      user: req.user,
      ambulance,
      requests,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load driver dashboard.');
    res.redirect('/login');
  }
}

async function acceptRequest(req, res) {
  const requestId = req.params.id;

  try {
    // First try to find an ambulance assigned to this driver
    let ambulance = await ambulanceModel.findAmbulanceByDriver(req.user.id);

    // If no ambulance is assigned, use the first available ambulance
    if (!ambulance) {
      const availableAmbulances =
        await ambulanceModel.getAvailableAmbulances();

      if (availableAmbulances.length > 0) {
        ambulance = availableAmbulances[0];
      }
    }

    // If there is no ambulance at all
    if (!ambulance) {
      req.flash('error', 'No ambulance available.');
      return res.redirect('/driver');
    }

    // Accept the emergency request
    await emergencyModel.updateRequestStatus(
      requestId,
      'accepted',
      ambulance.id
    );
console.log('REQUEST ACCEPTED:', requestId);
    // Notify connected clients
    req.app.get('io').emit('emergencyStatusUpdate', {
      requestId,
      status: 'accepted'
    });

    req.flash('success', 'Emergency request accepted.');
    res.redirect('/driver');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to accept emergency request.');
    res.redirect('/driver');
  }
}

async function rejectRequest(req, res) {
  const requestId = req.params.id;

  try {
    await emergencyModel.updateRequestStatus(
      requestId,
      'rejected'
    );

    req.app.get('io').emit('emergencyStatusUpdate', {
      requestId,
      status: 'rejected'
    });

    req.flash('success', 'Emergency request rejected.');
    res.redirect('/driver');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to reject emergency request.');
    res.redirect('/driver');
  }
}

module.exports = {
  driverDashboard,
  acceptRequest,
  rejectRequest
};