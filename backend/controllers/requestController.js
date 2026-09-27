const emergencyModel = require('../models/emergencyModel');
const ambulanceModel = require('../models/ambulanceModel');

async function requestAmbulance(req, res) {
  const { latitude, longitude, emergency_type, hospital_id, ambulance_id, guest_name, guest_phone, name, phone } = req.body;
  const isGuestRequest = !req.user || !req.user.id;
  const patientName = isGuestRequest ? (guest_name || name || 'Guest').trim() : req.user.name;
  const patientPhone = isGuestRequest ? (guest_phone || phone || '').trim() : (req.user.phone || '').trim();

  console.log('requestAmbulance payload', {
    isGuestRequest,
    patientName,
    patientPhone,
    ambulance_id,
    hospital_id,
    emergency_type,
    latitude,
    longitude,
    body: req.body
  });

  if (isGuestRequest && !patientPhone) {
    const errorMessage = 'Phone number is required to send an emergency request.';
    if (req.accepts('json') || req.is('application/json')) {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    req.flash('error', errorMessage);
    return res.redirect('/guest-sos');
  }

  try {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      const errorMessage = 'GPS coordinates are required to submit an emergency request.';
      if (req.accepts('json') || req.is('application/json')) {
        return res.status(400).json({ success: false, message: errorMessage });
      }
      req.flash('error', errorMessage);
      return res.redirect(req.user ? '/dashboard' : '/guest-sos');
    }

    const availableAmbulances = await ambulanceModel.getAvailableAmbulances();
    const selectedAmbulanceId = ambulance_id || (availableAmbulances.length > 0 ? availableAmbulances[0].id : null);
    const requestPayload = {
      patient_id: req.user ? req.user.id : null,
      guest_name: isGuestRequest ? patientName : null,
      guest_phone: isGuestRequest ? patientPhone : null,
      ambulance_id: selectedAmbulanceId,
      hospital_id: hospital_id || null,
      emergency_type: emergency_type || 'Medical',
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      status: 'pending'
    };

    console.log('requestAmbulance requestPayload', requestPayload);
    const requestId = await emergencyModel.createEmergencyRequest(requestPayload);
    console.log('requestAmbulance DB insert result', { requestId, requestPayload });

    req.app.get('io').emit('newEmergencyRequest', {
      requestId,
      patientId: req.user ? req.user.id : null,
      guestName: patientName,
      guestPhone: patientPhone,
      emergencyType: emergency_type,
      latitude,
      longitude
    });

    if (req.accepts('json') || req.is('application/json')) {
      return res.status(201).json({
        success: true,
        requestId,
        status: 'pending',
        statusUrl: `/emergency-status/${requestId}`,
        message: 'Ambulance request created.'
      });
    }

    req.flash('success', 'Ambulance request created.');
    return res.redirect(`/emergency-status/${requestId}`);
  } catch (err) {
    console.error('requestAmbulance error', err);
    const errorMessage = 'Unable to create ambulance request.';
    if (req.accepts('json') || req.is('application/json')) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    req.flash('error', errorMessage);
    return res.redirect(req.user ? '/dashboard' : '/guest-sos');
  }
}

module.exports = { requestAmbulance };
