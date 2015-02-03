/**
 * This is the passport authentication database access.
 *
 * The authorization codes.
 * You will use these to get the access codes to get to the data in your endpoints as outlined
 * in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
 * (http://tools.ietf.org/html/rfc6750)
 */
/* jslint node: true */
'use strict';

/**
 * Internal dependencies.
 */
var config = require('../../../config');
var redisClient = require('../../redis').redisClient;

/**
 * Returns an authorization code if it finds one, otherwise returns
 * null if one is not found.
 * @param key The key to the authorization code
 * @param done The function to call next
 * @returns The authorization code if found, otherwise returns null
 */
exports.find = function (key, done) {
  redisClient.select(config.db.redisdb.db, function (err) {
    if (err) {
      console.log('Error ' + err);
    }
  });
  redisClient.get('authcode:' + key, function (err, code) {
    if (err) {
      console.log(err);
      return done(err, null);
    }
    return done(null, JSON.parse(code));
  });
};

/**
 * Saves a authorization code, client id, redirect uri, user id, and scope.
 * @param code The authorization code (required)
 * @param clientID The client ID (required)
 * @param userID The user ID (required)
 * @param redirectURI The redirect URI of where to send access tokens once exchanged (required)
 * @param scope The scope (optional)
 * @param clientSecret The client secret (required)
 * @param done Calls this with null always
 * @returns returns this with null
 */
exports.save = function (code, clientID, redirectURI, userID, scope, clientSecret, done) {
  redisClient.select(config.db.redisdb.db, function (err) {
    if (err) {
      console.log('Error ' + err);
    }
  });
  redisClient.set('authcode:' + code, JSON.stringify(
      {
        clientID: clientID,
        redirectURI: redirectURI,
        userID: userID,
        scope: scope,
        clientSecret: clientSecret
      }),
    function (err) {
      if (err) {
        console.log(err);
        return done(err, null);
      }
      redisClient.expire('authcode:' + code, config.accessCode.expiresIn, function (err) {
        if (err) {
          console.log(err);
          return done(err, null);
        }
        return done(null);
      });
    }
  );
};

/**
 * Deletes an authorization code
 * @param key The authorization code to delete
 * @param done Calls this with null always
 */
exports.delete = function (key, done) {
  redisClient.select(config.db.redisdb.db, function (err) {
    if (err) {
      console.log('Error ' + err);
    }
  });
  redisClient.del('authcode:' + key);
  return done(null);
};
