var server = "https://192.168.1.140";
var login = server + "/dyn/login.json";
var getdata = server + "/dyn/getValues.json?sid=";
var logout = server + "/dyn/logout.json?sid=";
var sid = null;
var password = require('./password.js');

var request = require('request');
var key_instantaneous_power = "6100_40263F00";

// A handful of keys captured from the web page's periodic queries.
// To be deciphered.
var keys = [
  "6100_004F4E00",
  "6800_0883D800",
  "6100_002F7A00",
  "6800_0883D900",
  "6400_00432200",
  "6100_00543100",
  "6800_008AA200",
  "6100_40263F00",
  "6800_00832A00",
  "6180_08214800",
  "6180_08414900",
  "6180_08522F00",
  "6400_00543A00",
  "6400_00260100",
  "6100_402F2000",
  "6100_402F1E00",
  "6800_088F2000",
  "6800_088F2100",
  "6800_08811F00",
  "6400_00462E00",
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
                console.log(subkey + ": " + body.result[key][subkey]['1'][0].val);
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

