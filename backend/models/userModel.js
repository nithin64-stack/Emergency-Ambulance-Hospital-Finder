const { createConnection } = require('../services/dbService');

async function findByEmail(email) {
  const conn = await createConnection();
  const normalizedEmail = email ? email.trim().toLowerCase() : email;
  const [rows] = await conn.execute('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
  await conn.end();
  return rows[0];
}

async function findById(id) {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [id]);
  await conn.end();
  return rows[0];
}

async function findByGoogleId(googleId) {
  const conn = await createConnection();
  const [rows] = await conn.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);
  await conn.end();
  return rows[0];
}

async function createUser({ name, email, phone, password, role, google_id, profile_picture }) {
  const conn = await createConnection();
  const query = google_id
    ? 'INSERT INTO users (name, email, phone, password, role, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)'
    : 'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';

  const params = google_id
    ? [name, email, phone, password, role, google_id, profile_picture]
    : [name, email, phone, password, role];

  await conn.execute(query, params);
  await conn.end();
}

async function updateGoogleUser(id, { name, email, profile_picture }) {
  const conn = await createConnection();
  await conn.execute(
    'UPDATE users SET name = ?, email = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, email, profile_picture, id]
  );
  await conn.end();
}

async function updatePassword(id, password) {
  const conn = await createConnection();
  await conn.execute(
    'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [password, id]
  );
  await conn.end();
}

async function findOrCreateGoogleUser({ googleId, name, email, profilePicture }) {
  const normalizedEmail = email ? email.toLowerCase() : null;

  let user = await findByGoogleId(googleId);
  if (user) {
    if (user.email !== normalizedEmail || user.name !== name || user.profile_picture !== profilePicture) {
      await updateGoogleUser(user.id, { name, email: normalizedEmail, profile_picture: profilePicture });
      user = await findById(user.id);
    }
    return user;
  }

  user = await findByEmail(normalizedEmail);
  if (user) {
    if (!user.google_id) {
      const conn = await createConnection();
      await conn.execute(
        'UPDATE users SET google_id = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [googleId, profilePicture, user.id]
      );
      await conn.end();
      user = await findById(user.id);
    }
    return user;
  }

  await createUser({
    name,
    email: normalizedEmail,
    phone: null,
    password: null,
    role: 'patient',
    google_id: googleId,
    profile_picture: profilePicture
  });

  return findByGoogleId(googleId);
}

module.exports = {
  findByEmail,
  findById,
  findByGoogleId,
  createUser,
  updateGoogleUser,
  updatePassword,
  findOrCreateGoogleUser
};
