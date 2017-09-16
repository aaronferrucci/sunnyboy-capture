var sunny_capture = require('./lib/sunnyboy-capture.js');
var password = require('./password.js');

var server = "https://192.168.1.140";

function main(params) {
  sunny_capture.sunny_capture.server = server;
  sunny_capture.sunny_capture.password = params.password;
  sunny_capture.sunny_capture.date = params.date;

  return sunny_capture.sunny_capture.login()
    .then(sunny_capture.sunny_capture.logger)
    .then(sunny_capture.sunny_capture.logout);
}

main({
  password: password.password,
  date: process.argv[2],
});

