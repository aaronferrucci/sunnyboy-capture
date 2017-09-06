var server = "https://192.168.1.140";
var login = server + "/dyn/login.json";
var getdata = server + "/dyn/getValues.json?sid=";
var logout = server + "/dyn/logout.json?sid=";
var sid = null;
var password = require('./password.js');

var request = require('request');

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

      var inst_pwr_key = "6100_40263F00";
      request.post(
        getdata + sid,
        {
          json: {"destDev":[], "keys":[inst_pwr_key]},
          strictSSL: false, 
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            // do something with response
            for (var key in body.result) {
              console.log(inst_pwr_key + ": " + body.result[key][inst_pwr_key]['1'][0].val);
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

// curl -X POST -H "Connection: Keep-alive" -H "Content-Length: 37" -H "Accept: application/json" -H "Accept-Encoding: gzip, deflate" -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H '{"destDev":[],"keys":["6100_40263F00"]}' "http://[[INVERTER_IP]]/dyn/getValues.json?sid=_-s_pfe_sQO_5ce5"
