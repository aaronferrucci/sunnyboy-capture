var request = require('request-promise');
var password = require('./password.js');
var server = "https://192.168.1.140";
var login_uri = server + "/dyn/login.json";
var logout_uri = server + "/dyn/logout.json?sid=";

const util = require('util');

var printKeyValue = function(prefix, obj) {
  console.log(prefix + util.inspect(obj, {showHidden: false, depth: null}))
}

var sunny_capture = {
  password: null,
  login_uri: null,
  logout_uri: null,
  sid: null,

  login: function() {
    return request({
      method: "POST", 
      uri: sunny_capture.login_uri,
      body: {
        right: "usr",
        pass: sunny_capture.password
      },
      json: true,
      strictSSL: false,
      // resolveWithFullResponse: true,
    }).then(function(body) {
      sunny_capture.sid = body.result.sid;
      console.log("logged in with sid: " + sunny_capture.sid)
    }).catch(function(err) {
      console.log("err: " + err);
    });
  },

  logout: function() {
    var full_logout_uri = sunny_capture.logout_uri + sunny_capture.sid;
    return request({
      method: "POST", 
      uri: full_logout_uri,
      body: {},
      strictSSL: false,
      json: true,
    }).then(function(body) {
      console.log("logged out sid: " + sunny_capture.sid);
      sunny_capture.sid = null;
      return true;
    });
  },
}

function main(params) {
  sunny_capture.password = params.password;
  sunny_capture.login_uri = params.login_uri;
  sunny_capture.logout_uri = params.logout_uri;
  return sunny_capture.login()
    .then(sunny_capture.logout);
}

main(
  {
    "password": password.password,
    "login_uri": login_uri,
    "logout_uri": logout_uri,
  }
);

