var request = require('request-promise');
var datetimeutils = require('./datetimeutils.js');

var transformData = function(body, response, resolveWithFullResponse) {
  var mysteryConstant = 0.012; // To convert inverter power data to kW
  var transformedData = {};
  transformedData.headers = ["date", "time", "power (kW)", "raw"];
  transformedData.data = [];
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
      transformedData.data.push({
        date: date.toDateString(),
        time: date.toTimeString(),
        power: power,
        raw: raw
      });
    }
  }
  return transformedData;
};

var transformDevInfo = function(body, response, resolveWithFullResponse) {
  var transformedDevInfo = {};
  for (var key in body.result) {
    var data = body.result[key];
    for (var key2 in data) {
      var deeply_buried_value = data[key2][1][0].val;
      if (key2 === "6800_00A21E00") {
        transformedDevInfo["serial number"] = deeply_buried_value;
      } else if (key2 == "6800_00823400") {
        var maj = deeply_buried_value >> 24;
        var submaj = (deeply_buried_value >> 16) & 0xFF;
        var min = (deeply_buried_value >> 8) & 0xFF;
        var submin = deeply_buried_value & 0xFF;
        transformedDevInfo["firmware version"] =
          [maj, submaj, min, submin].join(".");
      } else if (key2 === "6180_104A9A00") {
        transformedDevInfo["ip address"] = deeply_buried_value;
      }
    }
  }

  return transformedDevInfo;
};

function SunnyCapture(options) {
  var _password = options.password;
  var _date = options.date;
  var _server = options.server;
  var _dataHandler = options.dataHandler;
  var _infoHandler = options.infoHandler;

  var _sid = null;

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
      console.error("logged in with sid: " + _sid);
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
      _dataHandler(transformedBody);
    });
  };

  this.devinfo = function devinfo() {
    return request({
      method: "POST", 
      uri: _server + "/dyn/getValues.json?sid=" + _sid,
      body: {
        "destDev": [],
        "keys": [
          "6800_00A21E00", // serial number
          "6800_00823400", // firmware version
          "6180_104A9A00", // ip address
        ],
      },
      transform: transformDevInfo,
      strictSSL: false,
      json: true,
    }).then(function(body) {
      _infoHandler(body);
    });
  };

  this.logout = function logout() {
    return request({
      method: "POST", 
      uri: _server + "/dyn/logout.json?sid=" + _sid,
      body: {},
      strictSSL: false,
      json: true,
    }).then(function(body) {
      console.error("logged out sid: " + _sid);
      _sid = null;
      return true;
    });
  };
}

module.exports = SunnyCapture;

