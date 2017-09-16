var request = require('request-promise');
var datetimeutils = require('./datetimeutils.js');

var transformData = function(body, response, resolveWithFullResponse) {
  var mysteryConstant = 0.012; // To convert inverter power data to kW
  var response = {};
  response.headers = ["date", "time", "power (kW)", "raw"];
  response.data = [];
  for (var key in body.result) {
    var data = body.result[key];
    var i, len;
    for (len = data.length, i = 1; i < len; i++) {
      var sec = data[i]['t'];
      var date = new Date(sec * 1000);
      var raw = data[i]['v'];
      var prev_raw = data[i - 1]['v']; 
      // Calculate power as the delta between raw results
      // Sometimes the raw value is null; fall back on power=0
      // in that case.
      var power = 0.0;
      if (raw != null && prev_raw != null) {
        var delta = raw - prev_raw;
        power = (delta * mysteryConstant).toFixed(3);
      }
      response.data.push({
        date: date.toDateString(),
        time: date.toTimeString(),
        power: power,
        raw: raw
      });
    }
  }
  return response;
};

// function SunnyCapture(server, date, password, handler) {
function SunnyCapture(options) {
  var _password = options.password;
  var _date = options.date;
  var _server = options.server;
  var _handler = options.handler;

  var _sid = null;
  var _data = null;

  this.login = function login() {
    return request({
      method: "POST", 
      uri: _server + "/dyn/login.json",
      body: {
        right: "usr",
        pass: _password
      },
      json: true,
      strictSSL: false,
    }).then(function(body) {
      _sid = body.result.sid;
      console.log("logged in with sid: " + _sid);
    });
  };

  this.logger = function logger() {
    var datetime = datetimeutils.dateRange(_date);
    return request({
      method: "POST", 
      uri: _server + "/dyn/getLogger.json?sid=" + _sid,
      body: {
        "destDev": [],
        "key": 28672,
        "tStart": datetime.start,
        "tEnd": datetime.end,
      },
      transform: transformData,
      strictSSL: false,
      json: true,
    }).then(function(transformedBody) {
      _data = transformedBody;
      _handler(_data);
    });
  };

  this.logout = function logout() {
    console.log("logout: server: " + _server + "; sid: " + _sid);
    return request({
      method: "POST", 
      uri: _server + "/dyn/logout.json?sid=" + _sid,
      body: {},
      strictSSL: false,
      json: true,
    }).then(function(body) {
      console.log("logged out sid: " + _sid);
      _sid = null;
      return true;
    });
  };

  this.data = function data() { return _data; };
}

module.exports = SunnyCapture;

