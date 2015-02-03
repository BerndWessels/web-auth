/**
 * This endpoint is for verifying a token.
 */
/* jslint node: true */
'use strict';

/**
 * Returns a JSON Web Token.
 * @param data
 * @param secret
 * @returns {*}
 */
exports.jwt = function(data, secret){
  // https://github.com/auth0/node-jsonwebtoken
  var jwt = require('jsonwebtoken');
  var token = jwt.sign(data, secret);
  return token;
};

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function (len) {
  var buf = [];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
