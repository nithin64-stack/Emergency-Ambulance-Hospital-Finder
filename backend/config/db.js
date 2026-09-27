const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  filename: process.env.DB_PATH || path.join(__dirname, '../../database/emergency_system.sqlite')
};

module.exports = { dbConfig };
