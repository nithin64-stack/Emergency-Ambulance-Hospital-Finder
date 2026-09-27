const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel = require('../models/userModel');

async function register(req, res) {
  const { name, email, phone, password, role } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : email;
  try {
    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      req.flash('error', 'Email already registered.');
      return res.redirect('/register');
    }
    const hashed = await bcrypt.hash(password, 10);
    await userModel.createUser({ name, email: normalizedEmail, phone, password: hashed, role: role || 'patient' });
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed.');
    res.redirect('/register');
  }
}

async function setPassword(req, res) {
  const { password, confirmPassword } = req.body;

  if (!req.user.google_id || req.user.password) {
    req.flash('error', 'A local password is already set for this account.');
    return res.redirect('/dashboard');
  }

  if (!password || password.length < 8 || password !== confirmPassword) {
    req.flash('error', 'Passwords must match and be at least 8 characters long.');
    return res.redirect('/dashboard');
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await userModel.updatePassword(req.user.id, hashed);
    req.user.password = hashed;
    req.flash('success', 'Local password created. You can now log in with your email and password.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to create local password.');
  }

  res.redirect('/dashboard');
}

function login(req, res, next) {
  return passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
}

function googleAuth(req, res, next) {
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account consent'
  })(req, res, next);
}

function googleCallback(req, res, next) {
  return passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
}

function logout(req, res) {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });
}

module.exports = { register, login, setPassword, googleAuth, googleCallback, logout };
