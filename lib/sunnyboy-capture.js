var request = require('request-promise');
var datetimeutils = require('./datetimeutils.js');

const util = require('util');

var sunny_capture = {
  password: null,
  date: null,
  server: null,
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

  login_uri: function() {
    return sunny_capture.server + "/dyn/login.json";
  },

  logger_uri: function() {
    return sunny_capture.server +
      "/dyn/getLogger.json?sid=" +
      sunny_capture.sid;
  },

  logout_uri: function() {
    return sunny_capture.server +
      "/dyn/logout.json?sid=" +
      sunny_capture.sid;
  },

  login: function() {
    return request({
      method: "POST", 
      uri: sunny_capture.login_uri(),
      body: {
        right: "usr",
        pass: sunny_capture.password
      },
      json: true,
      strictSSL: false,
    }).then(function(body) {
      sunny_capture.sid = body.result.sid;
      console.log("logged in with sid: " + sunny_capture.sid)
    }).catch(function(err) {
      console.log("err: " + err);
    });
  },

  logger: function() {
    var full_logger_uri = sunny_capture.logger_uri();
    var datetime = datetimeutils.dateRange(sunny_capture.date);
    return request({
      method: "POST", 
      uri: full_logger_uri,
      body: {
        "destDev": [],
        "key": 28672,
        "tStart": datetime.start,
        "tEnd": datetime.end,
      },
      strictSSL: false,
      json: true,
    }).then(function(body) {
      sunny_capture.printDateTimePower(body);
    });
  },

  logout: function() {
    var full_logout_uri = sunny_capture.logout_uri();
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

// function main(params) {
//   sunny_capture.password = params.password;
//   sunny_capture.date = params.date;
// 
//   sunny_capture.login_uri = login_uri;
//   sunny_capture.logger_uri = logger_uri;
//   sunny_capture.logout_uri = logout_uri;
//   return sunny_capture.login()
//     .then(sunny_capture.logger)
//     .then(sunny_capture.logout);
// }
// 
// main({
//   password: password.password,
//   date: process.argv[2],
// });

module.exports = { sunny_capture: sunny_capture, };

