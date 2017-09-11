var server = "https://192.168.1.140";
var login = server + "/dyn/login.json";
var getdata = server + "/dyn/getValues.json?sid=";
var getlogger = server + "/dyn/getLogger.json?sid=";
var logout = server + "/dyn/logout.json?sid=";
var sid = null;
var password = require('./password.js');

var request = require('request');
var key_instantaneous_power = "6100_40263F00";
const util = require('util');

var printKeyValue = function(prefix, obj) {
  console.log(prefix + util.inspect(obj, {showHidden: false, depth: null}))
}

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
var printDateTimePower = function(obj) {
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
}

// A handful of keys captured from the web page's periodic queries.
// 31 B
// 6800_008AA200
//
// 129 B
// 6400_00260100
// 6400_00543A00
// 6800_00832A00
// 6800_008AA200
//
// 496 B
// 6800_00A21E00
// 6800_00823400
// 6180_104A9A00
// 6180_104AB700
// 6180_084ABC00
// 6180_084A9600
// 6180_084A9800
// 6100_004AB600
// 6800_088A4D00
//
// destDev	[]
// key	28672
// tStart	1503644100
// tEnd	1503730500
// returns 288 t, v pairs. "time, value (total power)"?
// 143	t: 1504896600 v: 194237
// 144	t: 1504896900 v: 194340
//
var keys = [
  "6100_004F4E00", // null
  "6800_0883D800", // tag: 302
  "6100_002F7A00", // null
  "6800_0883D900", // tag: 302
  "6400_00432200", // null
  "6100_00543100", // no response
  "6800_008AA200", // no response
  "6100_40263F00", // instantaneous power
  "6800_00832A00", // 3000
  "6180_08214800", // tag: 307
  "6180_08414900", // tag: 886
  "6180_08522F00", // tag: 303
  "6400_00543A00", // no response
  "6400_00260100", // total power (W)
  "6100_402F2000", // null
  "6100_402F1E00", // null
  "6800_088F2000", // tag: 1438
  "6800_088F2100", // tag: 1438
  "6800_08811F00", // tag: 1129
  "6400_00462E00", // 647074
];

var keys2 = [
  "6800_00A21E00", // serial number
  "6800_00823400", // firmware version
  "6180_104A9A00", // IP address
  "6180_104AB700", // '   '
  "6180_084ABC00", // tag: 303
  "6180_084A9600", // tag: 307
  "6180_084A9800", // tag: 1725
  "6100_004AB600", // 0
  "6800_088A4D00", // tag: 1130
];

request.post(
  login,
  { 
    json: {
      right: "usr",
      pass: password.password
    },
    strictSSL: false,
  },
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      sid = body.result.sid;
      // console.log("logged in with sid '" + sid + "'");

      request.post(
        getlogger + sid,
        // {
        //   json: { "destDev": [], "keys": keys, },
        //   strictSSL: false, 
        // },
        {
          json: {
            "destDev": [],
            "key": 28672,
            "tStart": 1504940100,
            "tEnd": 1505026500,
          },
          strictSSL: false, 
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            // do something with response
            printDateTimePower(body);
            // log out
            request.post(
              logout + sid, 
              { 
                json: {},
                strictSSL: false, 
              }, 
              function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  // console.log("logging out with sid '" + sid + "'");
                } else {
                  console.log("error: " + error);
                  console.log("response: " + response.statusCode);
                }
              }
            );
          } else {
            console.log("error: " + error);
            console.log("response: " + response.statusCode);
          }
        }
      );

    } else {
      console.log("Error: " + error);
    }
  }
);

