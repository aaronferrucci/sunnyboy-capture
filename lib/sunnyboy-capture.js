var server = "https://192.168.1.140";
var login = server + "/dyn/login.json";
var getdata = server + "/dyn/getValues.json?sid=";
var logout = server + "/dyn/logout.json?sid=";
var sid = null;
var password = require('./password.js');

var request = require('request');
var key_instantaneous_power = "6100_40263F00";
const util = require('util');

var printKeyValue = function(prefix, obj) {
  console.log(prefix + util.inspect(obj, {showHidden: false, depth: null}))
}

// A handful of keys captured from the web page's periodic queries.
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
      console.log("logged in with sid '" + sid + "'");

      request.post(
        getdata + sid,
        {
          json: { "destDev": [], "keys": keys, },
          strictSSL: false, 
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            // do something with response
            for (var key in body.result) {
              for (var subkey in body.result[key]) {
                printKeyValue(subkey + ": ", body.result[key][subkey]['1'][0].val);
              }
            }
            // log out
            request.post(
              logout + sid, 
              { 
                json: {},
                strictSSL: false, 
              }, 
              function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  console.log("logging out with sid '" + sid + "'");
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

