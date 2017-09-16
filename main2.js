var sunny_capture = require('./lib/sunnyboy-capture.js');
var password = require('./password.js');
var server = "https://192.168.1.140";
var SunnyCapture = require('./lib/classTest.js');

function main(params) {
  var sc = new SunnyCapture(server, params.date, params.password);

  return sc.login()
    .then(sc.logger.bind(sc))
    .finally(sc.logout.bind(sc));
}

main({
  password: password.password,
  date: process.argv[2],
});

