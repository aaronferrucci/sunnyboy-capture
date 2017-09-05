var request = require('request');
var login = "https://192.168.1.140/dyn/login.json";
var logout = "https://192.168.1.140/dyn/logout.json?sid=";
var sid = null;
var password = require('./password.js');

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
      console.log("Error: " + error);
    }
  }
);


