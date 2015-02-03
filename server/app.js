/**
 * This is the authorization server entry-point.
 */
/* jslint node: true */
'use strict';

/**
 * External dependencies.
 */
var bodyParser = require('body-parser');
var compression = require('compression');
var connectRedis = require('connect-redis');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var express = require('express');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var morgan = require('morgan');
var path = require('path');
var passport = require('passport');
var serveFavicon = require('serve-favicon');

/**
 * Internal dependencies.
 */
var config = require('./config');
var oauth2 = require('./oauth2');
var site = require('./site');
var token = require('./token');

/**
 * Create and configure the authorization server.
 */
// Create the application.
var app = express();
// Get the current environment.
var env = app.get('env');
// Set the listening port.
app.set('port', config.port);
// Set the view engine.
app.set('view engine', 'ejs');

/**
 * Add the common middleware.
 */
// Compress every response.
app.use(compression());
// Serve the favicon.
app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.ico')));
// Serve static files.
app.use(express.static(path.join(__dirname, 'public')));
// Development environment.
if (env === 'development' || env === 'test') {
  // Use logging.
  app.use(morgan('dev'));
}
// Parse JSON request bodies.
app.use(bodyParser.json({}));
// Parse URL encoded request bodies.
app.use(bodyParser.urlencoded({extended: true}));
// Parse the cookies.
app.use(cookieParser());
// Create the session storage.
var sessionStorage;
// Use the memory store only for development.
if (config.session.type === 'MemoryStore') {
  // Log.
  console.log('Using Memory Store for the Session');
  // Get the memory store.
  var MemoryStore = expressSession.MemoryStore;
  // Create a new instance.
  sessionStorage = new MemoryStore();
}
// Use the redis store in production.
else if (config.session.type === 'RedisStore') {
  // Log.
  console.log('Using Redis Store for the Session');
  // Get the redis store.
  var redisStore = connectRedis(expressSession);
  // Create a new instance.
  sessionStorage = new redisStore({
    host: config.session.redisdb.host,
    port: config.session.redisdb.port,
    db: config.session.redisdb.db,
    prefix: config.session.redisdb.prefix,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: (1000 * config.session.expiresIn),
      expires: new Date(Date.now() + (1000 * config.session.expiresIn))
    },
    ttl: config.session.expiresIn
  });
}
else {
  //We have no idea here.
  throw new Error("Within config/index.js the session.type is unknown: " + config.session.type);
}
// Create the session.
app.use(expressSession({
  name: config.session.name,
  resave: false,
  saveUninitialized: false,
  secret: config.session.secret,
  store: sessionStorage
}));

/**
 * Create and configure the passport authentication.
 */
app.use(passport.initialize());
// Add passport session support.
app.use(passport.session());
// Configure the passport middleware.
require('./passport');

/**
 * Add the routes.
 */
// Server authentication.
app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);
// OAuth2 authentication.
app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', function (req, res, next) {
  console.log('session.destroy');
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    next();
  });
}, oauth2.token);
// Mimicking google's token info endpoint from
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
app.get('/api/tokeninfo', token.info);

/**
 * Run the web-site application server.
 */
// Handle errors.
if (env === 'development' || env === 'test') app.use(errorHandler());
// Start listening.
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
