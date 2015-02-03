/**
 * This is the authorization site setup.
 */
/* jslint node: true */
'use strict';

/**
 * External dependencies.
 */
var passport = require('passport');
var login = require('connect-ensure-login');

/**
 * The default index page.
 */
exports.index = function (req, res) {
  if (!req.query.code) {
    res.render('index');
  } else {
    res.render('index-with-code');
  }
};

/**
 * The login form page.
 */
exports.loginForm = function (req, res) {
  res.render('login');
};

/**
 * The login POST processing.
 */
exports.login = [
  passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: '/login'})
];

/**
 * The logout POST processing.
 */
exports.logout = function (req, res) {
  req.logout();
  console.log('session.destroy');
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect('/');
};

/**
 * The account info page.
 */
exports.account = [
  login.ensureLoggedIn(),
  function (req, res) {
    res.render('account', {user: req.user});
  }
];
