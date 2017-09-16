var request = require('request-promise');
var datetimeutils = require('./datetimeutils.js');

// static data transform function
// To do: use request-promise transform option?
var printDateTimePower = function(obj) {
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
};

function SunnyCapture(server, date, password) {
  var _password = password;
  var _date = date;
  var _server = server;

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
      strictSSL: false,
      json: true,
    }).then(function(body) {
      printDateTimePower(body);
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

}

module.exports = SunnyCapture;

