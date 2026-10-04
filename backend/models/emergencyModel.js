const { createConnection } = require('../services/dbService');

async function getLatestRequestsForPatient(patientId) {
  const conn = await createConnection();
  const [rows] = await conn.execute(
    'SELECT er.*, h.name AS hospital_name, u.name AS driver_name FROM emergency_requests er LEFT JOIN hospitals h ON er.hospital_id = h.id LEFT JOIN users u ON er.ambulance_id = u.id WHERE er.patient_id = ? ORDER BY er.created_at DESC LIMIT 10',
    [patientId]
  );
  await conn.end();
  return rows;
}

async function createEmergencyRequest(data = {}) {
  const conn = await createConnection();
  const guestName = data.guest_name || data.name || null;
  const guestPhone = data.guest_phone ?? data.phone ?? null;
  const [result] = await conn.execute(
    'INSERT INTO emergency_requests (patient_id, guest_name, guest_phone, ambulance_id, hospital_id, emergency_type, latitude, longitude, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
    [
      data.patient_id ?? null,
      guestName,
      guestPhone,
      data.ambulance_id || null,
      data.hospital_id || null,
      data.emergency_type || 'Medical',
      data.latitude,
      data.longitude,
      data.status || 'pending'
    ]
  );
  await conn.end();
  return result.insertId;
}

async function createRequest(data) {
  return createEmergencyRequest(data);
}

async function getRequestById(requestId) {
  const conn = await createConnection();
  const [rows] = await conn.execute(
    'SELECT er.*, COALESCE(u.name, er.guest_name, "Guest") AS patient_name, h.name AS hospital_name FROM emergency_requests er LEFT JOIN users u ON er.patient_id = u.id LEFT JOIN hospitals h ON er.hospital_id = h.id WHERE er.id = ?',
    [requestId]
  );
  await conn.end();
  return rows[0] || null;
}

async function getDriverRequests() {
  const conn = await createConnection();
  const [rows] = await conn.execute(
    'SELECT er.*, COALESCE(u.name, er.guest_name, "Guest") AS patient_name, er.guest_phone, h.name AS hospital_name FROM emergency_requests er LEFT JOIN users u ON er.patient_id = u.id LEFT JOIN hospitals h ON er.hospital_id = h.id WHERE er.status IN ("pending", "accepted", "on_the_way") ORDER BY er.created_at DESC'
  );
  await conn.end();
  return rows;
}

async function updateRequestStatus(requestId, status, ambulanceId = null) {
  const conn = await createConnection();
  const [result] = await conn.execute('UPDATE emergency_requests SET ambulance_id = ?, status = ? WHERE id = ?', [ambulanceId, status, requestId]);
  await conn.end();
  return result;
}

async function getAllRequests() {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT er.*, u.name AS patient_name, a.ambulance_number, h.name AS hospital_name FROM emergency_requests er LEFT JOIN users u ON er.patient_id = u.id LEFT JOIN ambulances a ON er.ambulance_id = a.id LEFT JOIN hospitals h ON er.hospital_id = h.id ORDER BY er.created_at DESC LIMIT 10');
  await conn.end();
  return rows;
}

module.exports = {
  getLatestRequestsForPatient,
  createEmergencyRequest,
  createRequest,
  getRequestById,
  getDriverRequests,
  updateRequestStatus,
  getAllRequests
};
