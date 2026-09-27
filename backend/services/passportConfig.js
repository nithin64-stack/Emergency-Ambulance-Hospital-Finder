const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { createConnection } = require('./dbService');
const userModel = require('../models/userModel');

module.exports = function(passport) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

  if (!googleClientId || !googleClientSecret) {
    console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env before using /auth/google.');
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return done(null, false, { message: 'Incorrect email or password.' });
      if (!user.password) return done(null, false, { message: 'Incorrect email or password.' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });
      return done(null, user);
    } catch (err) {
      console.error('Passport LocalStrategy DB error:', err);
      return done(null, false, { message: 'Authentication failed due to database error.' });
    }
  }));

  if (googleClientId && googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      passReqToCallback: false
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length ? profile.emails[0].value.toLowerCase() : null;
      if (!email) {
        return done(null, false, { message: 'Google account email is required.' });
      }

      const user = await userModel.findOrCreateGoogleUser({
        googleId: profile.id,
        name: profile.displayName || profile.name?.givenName || 'Google User',
        email,
        profilePicture: profile.photos && profile.photos.length ? profile.photos[0].value : null
      });

      return done(null, user);
    } catch (err) {
      console.error('Passport GoogleStrategy DB error:', err);
      return done(err);
    }
  }));
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const conn = await createConnection();
      const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [id]);
      await conn.end();
      return done(null, rows[0]);
    } catch (err) {
      console.error('Passport deserialize DB error:', err);
      return done(null, false);
    }
  });
};
