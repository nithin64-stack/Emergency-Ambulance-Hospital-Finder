const emergencyModel = require('../models/emergencyModel');

function home(req, res) {
  res.render('home', { user: req.user, messages: req.flash() });
}

function about(req, res) {
  res.render('about', { user: req.user, messages: req.flash() });
}

function contact(req, res) {
  res.render('contact', { user: req.user, messages: req.flash() });
}

function guestSos(req, res) {
  res.render('guest-sos', { user: req.user, messages: req.flash() });
}

async function emergencyStatus(req, res) {
  try {
    const request = await emergencyModel.getRequestById(req.params.id);
    if (!request) {
      req.flash('error', 'Emergency request not found.');
      return res.redirect('/');
    }

    res.render('emergency-status', {
      user: req.user,
      request,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load emergency status.');
    res.redirect('/');
  }
}

function login(req, res) {
  res.render('login', { messages: req.flash() });
}

function register(req, res) {
  res.render('register', { messages: req.flash() });
}

module.exports = {
  home,
  about,
  contact,
  guestSos,
  emergencyStatus,
  login,
  register
};
