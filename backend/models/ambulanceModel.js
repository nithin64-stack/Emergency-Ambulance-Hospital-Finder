const { createConnection } = require('../services/dbService');

async function getAvailableAmbulances() {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT a.*, u.name AS driver_name FROM ambulances a LEFT JOIN users u ON a.driver_id = u.id WHERE a.status = "available"');
  await conn.end();
  return rows;
}

async function getAmbulances(limit = 10) {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT a.*, u.name AS driver_name FROM ambulances a LEFT JOIN users u ON a.driver_id = u.id LIMIT ?', [limit]);
  await conn.end();
  return rows;
}

async function findAmbulanceByDriver(driverId) {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT * FROM ambulances WHERE driver_id = ? LIMIT 1', [driverId]);
  await conn.end();
  return rows[0];
}

module.exports = {
  getAvailableAmbulances,
  getAmbulances,
  findAmbulanceByDriver
};
