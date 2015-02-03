/**
 * This is the default environment configuration.
 */
/* jslint node: true */
'use strict';

/**
 * External dependencies.
 */
var path = require('path');
var _ = require('lodash');

/**
 * Set the default node environment to development.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * The default configurations.
 */
var all = {
  /**
   * The node environment.
   */
  env: process.env.NODE_ENV,

  /**
   * Root path of the server.
   */
  root: path.normalize(__dirname + '/../..'),

  /**
   * The Server port.
   */
  port: process.env.PORT || 3000,

  /**
   * Session configuration.
   *
   * secret - The session secret that you should change to what you want.
   */
  session: {
    type: "RedisStore",
    name: "authorization.sid",
    secret: "A Secret That Should Be Changed",
    expiresIn: 60 * 60, // seconds
    redisdb: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      prefix: 'authsession:'
    }
  },

  /**
   * Database configuration for access and refresh tokens.
   */
  db: {
    type: "redisStore",
    redisdb: {
      host: '127.0.0.1',
      port: 6379,
      db: 1
    }
  },

  /**
   * Configuration of access tokens.
   */
  accessToken: {
    expiresIn: 60, // seconds
    calculateExpirationDate: function () {
      return new Date(new Date().getTime() + (this.expiresIn * 1000));
    }
  },

  /**
   * Configuration of refresh token.
   */
  refreshToken: {
    expiresIn: 60 * 60 * 24 * 7, // seconds
    calculateExpirationDate: function () {
      return new Date(new Date().getTime() + (this.expiresIn * 1000));
    }
  },

  /**
   * Configuration of access code.
   */
  accessCode: {
    expiresIn: 30, // seconds
    calculateExpirationDate: function () {
      return new Date(new Date().getTime() + (this.expiresIn * 1000));
    },
    accessCodeLength: 16
  }

};

/**
 * Export the config object based on the NODE_ENV.
 */
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {}
);
