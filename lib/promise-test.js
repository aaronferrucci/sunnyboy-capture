var request = require('request-promise');
var password = require('./password.js');
var server = "https://192.168.1.140";
var login_uri = server + "/dyn/login.json";
var logger_uri = server + "/dyn/getLogger.json?sid=";
var logout_uri = server + "/dyn/logout.json?sid=";

const util = require('util');

var printKeyValue = function(prefix, obj) {
  console.log(prefix + util.inspect(obj, {showHidden: false, depth: null}))
}

var sunny_capture = {
  password: null,
  login_uri: null,
  logger_uri: null,
  logout_uri: null,
  sid: null,

  // Expect:
  // { 'result':
  //   { '013A-769D9CF0': 
  //     [ { t: 1503644100, v: 11383 },
  //       { t: 1503644400, v: 11383 },
  //        ...,
  //     ]
  //   }
  // }
  // 
  printDateTimePower: function(obj) {
    var mysteryConstant = 0.012; // To convert inverter power data to kW
    // console.log(util.inspect(obj, {showHidden: false, depth: null}))
    console.log(["date", "time", "kW", "raw"].join(", "));
    for (var key in obj.result) {
      var data = obj.result[key];
      var i, len;
      for (len = data.length, i = 1; i < len; i++) {
        var sec = data[i]['t'];
        var date = new Date(sec * 1000);
        var raw = data[i]['v'];
        var delta = raw - data[i - 1]['v']; 
        var power = (delta * mysteryConstant).toFixed(3);
        console.log(
          [date.toDateString(), date.toTimeString(), power, raw].join(", ")
        );
      }
    }
  },

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

  logger: function() {
    var full_logger_uri = sunny_capture.logger_uri + sunny_capture.sid;
    return request({
      method: "POST", 
      uri: full_logger_uri,
      body: {            "destDev": [],
        "key": 28672,
        "tStart": 1504940100,
        "tEnd": 1505026500,
      },
      strictSSL: false,
      json: true,
    }).then(function(body) {
      // printKeyValue("data: ", body);
      sunny_capture.printDateTimePower(body);
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
  sunny_capture.logger_uri = params.logger_uri;
  sunny_capture.logout_uri = params.logout_uri;
  return sunny_capture.login()
    .then(sunny_capture.logger)
    .then(sunny_capture.logout);
}

main(
  {
    "password": password.password,
    "login_uri": login_uri,
    "logger_uri": logger_uri,
    "logout_uri": logout_uri,
  }
);

