const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { dbConfig } = require('../config/db');

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function initializeDatabase() {
  ensureDirectoryExists(dbConfig.filename);

  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const seedPath = path.join(__dirname, '../../database/seed.sql');
  const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';
  const seedSql = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf8') : '';

  const db = new sqlite3.Database(dbConfig.filename);

  try {
    await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          db.exec(schemaSql, (schemaErr) => {
            if (schemaErr) {
              reject(schemaErr);
              return;
            }

            if (seedSql.trim()) {
              db.exec(seedSql, (seedErr) => {
                seedErr ? reject(seedErr) : resolve();
              });
              return;
            }

            resolve();
          });
          return;
        }

        resolve();
      });
    });

    const tableInfo = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });

    const columns = new Set(tableInfo.map((column) => column.name));
    const migrationStatements = [];

    const passwordColumn = tableInfo.find((column) => column.name === 'password');
    if (passwordColumn && passwordColumn.notnull === 1) {
      await new Promise((resolve, reject) => {
        db.exec(`
          CREATE TABLE users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            password TEXT,
            google_id TEXT,
            profile_picture TEXT,
            role TEXT NOT NULL DEFAULT 'patient' CHECK(role IN ('patient','driver','admin')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          INSERT INTO users_new (id, name, email, phone, password, google_id, profile_picture, role, created_at, updated_at)
          SELECT id, name, email, phone, password, google_id, profile_picture, role, created_at, updated_at FROM users;
          DROP TABLE users;
          ALTER TABLE users_new RENAME TO users;
        `, (err) => (err ? reject(err) : resolve()));
      });
    }

    const refreshedUsersInfo = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const refreshedColumns = new Set(refreshedUsersInfo.map((column) => column.name));

    if (!refreshedColumns.has('google_id')) {
      migrationStatements.push('ALTER TABLE users ADD COLUMN google_id TEXT');
    }

    if (!refreshedColumns.has('profile_picture')) {
      migrationStatements.push('ALTER TABLE users ADD COLUMN profile_picture TEXT');
    }

    const emergencyTableExists = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='emergency_requests'", (err, row) => {
        if (err) reject(err);
        else resolve(Boolean(row));
      });
    });

    if (emergencyTableExists) {
      const emergencyTableInfo = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(emergency_requests)', (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows || []);
        });
      });

      const emergencyColumns = new Set(emergencyTableInfo.map((column) => column.name));

      if (!emergencyColumns.has('guest_name')) {
        migrationStatements.push('ALTER TABLE emergency_requests ADD COLUMN guest_name TEXT');
      }

      if (!emergencyColumns.has('guest_phone')) {
        migrationStatements.push('ALTER TABLE emergency_requests ADD COLUMN guest_phone TEXT');
      }

      const patientIdColumn = emergencyTableInfo.find((column) => column.name === 'patient_id');
      if (patientIdColumn && patientIdColumn.notnull === 1) {
        await new Promise((resolve, reject) => {
          db.exec(`
            CREATE TABLE emergency_requests_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              patient_id INTEGER,
              guest_name TEXT,
              guest_phone TEXT,
              ambulance_id INTEGER,
              hospital_id INTEGER,
              emergency_type TEXT DEFAULT 'Medical',
              latitude REAL,
              longitude REAL,
              status TEXT DEFAULT 'pending',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO emergency_requests_new (id, patient_id, guest_name, guest_phone, ambulance_id, hospital_id, emergency_type, latitude, longitude, status, created_at, updated_at)
            SELECT id, patient_id, NULL, NULL, ambulance_id, hospital_id, emergency_type, latitude, longitude, status, created_at, updated_at FROM emergency_requests;
            DROP TABLE emergency_requests;
            ALTER TABLE emergency_requests_new RENAME TO emergency_requests;
          `, (err) => (err ? reject(err) : resolve()));
        });
      }
    }

    for (const sql of migrationStatements) {
      await new Promise((resolve) => {
        db.exec(sql, (err) => {
          if (err && !/duplicate column|already exists/i.test(err.message)) {
            console.error('Database migration error:', err.message);
            return resolve();
          }
          resolve();
        });
      });
    }

    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET password = NULL WHERE google_id IS NOT NULL AND password LIKE 'google-%'",
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise((resolve, reject) => {
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL', (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  } finally {
    await new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

async function createConnection() {
  await initializeDatabase();

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbConfig.filename, (err) => {
      if (err) {
        reject(err);
        return;
      }

      const wrapped = {
        execute(sql, params = []) {
          const values = Array.isArray(params) ? params : [params];
          const command = (sql.trim().split(/\s+/)[0] || '').toUpperCase();

          if (['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'REPLACE', 'BEGIN', 'COMMIT', 'ROLLBACK'].includes(command)) {
            return new Promise((resolveQuery, rejectQuery) => {
              db.run(sql, values, function runCallback(err) {
                if (err) {
                  rejectQuery(err);
                  return;
                }
                resolveQuery([{ insertId: this.lastID, changes: this.changes }]);
              });
            });
          }

          return new Promise((resolveQuery, rejectQuery) => {
            db.all(sql, values, (err, rows) => {
              if (err) {
                rejectQuery(err);
                return;
              }
              resolveQuery([rows]);
            });
          });
        },
        end() {
          return new Promise((resolveEnd, rejectEnd) => {
            db.close((closeErr) => {
              if (closeErr) {
                rejectEnd(closeErr);
                return;
              }
              resolveEnd();
            });
          });
        }
      };

      resolve(wrapped);
    });
  });
}

module.exports = { createConnection };
