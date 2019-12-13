var UnauthorizedError = require('./errors/UnauthorizedError');
var unless = require('express-unless');
var dateFormat = require('dateformat');
const uuidv4 = require('uuid/v4');

function getToken(authHeader, next){
  var token;
  var header = authHeader.split(' ');
  if (header.length == 2) {
    var scheme = header[0];
    var credentials = header[1];

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }else {
      return new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
    }
  }else {
    return new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' });
  }

  if (!token) {
    return new UnauthorizedError('credentials_required', { message: 'No authorization token was found' });
  } else {
      return token;
  }
}

function setHeaders(res, statusCode){
  var now = new Date();
  res.statusCode = statusCode;
  res.removeHeader('X-Powered-By');
  res.removeHeader('Date');
  res.removeHeader('Connection');
  res.header("Content-Type", "application/json");
  res.header("Global-Message-ID", uuidv4());
  res.header("Global-Timestamp", dateFormat(now, "ddd, d mmm yyyy, HH:MM:ss Z"));
  res.header("Content-Encoding", "gzip");
  return res;
}

module.exports.unless = unless;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.getToken = getToken;
module.exports.setHeaders = setHeaders;
