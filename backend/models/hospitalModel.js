const { createConnection } = require('../services/dbService');

async function getHospitals(limit = 10) {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT * FROM hospitals LIMIT ?', [limit]);
  await conn.end();
  return rows;
}

async function getAllHospitals() {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT * FROM hospitals');
  await conn.end();
  return rows;
}

async function addHospital(data) {
  const conn = await createConnection();
  await conn.execute(
    'INSERT INTO hospitals (name, address, phone, latitude, longitude, emergency_available, icu_available, blood_bank_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.name, data.address, data.phone, data.latitude, data.longitude, data.emergency_available ? 1 : 0, data.icu_available ? 1 : 0, data.blood_bank_available ? 1 : 0]
  );
  await conn.end();
}

async function deleteHospital(id) {
  const conn = await createConnection();
  await conn.execute('DELETE FROM hospitals WHERE id = ?', [id]);
  await conn.end();
}

module.exports = {
  getHospitals,
  getAllHospitals,
  addHospital,
  deleteHospital
};
