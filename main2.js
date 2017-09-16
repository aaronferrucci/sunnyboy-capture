var sunny_capture = require('./lib/sunnyboy-capture.js');
var password = require('./password.js');
var server = "https://192.168.1.140";
var SunnyCapture = require('./lib/classTest.js');

var dataHandler = function(resp) {
  console.log("dataHandler()");
  console.log(resp.headers.join(", "));
  var i, len;
  for (len = resp.data.length, i = 0; i < len; i++) {
    console.log([
      resp.data[i].date,
      resp.data[i].time,
      resp.data[i].power,
      resp.data[i].raw
    ].join(", "));
  }
}

function main(params) {
  var sc = new SunnyCapture({
    server: server,
    date: params.date,
    password: params.password,
    handler: dataHandler,
  });

  var result = sc.login()
    .then(sc.logger.bind(sc))
    .finally(sc.logout.bind(sc));
}

main({
  password: password.password,
  date: process.argv[2],
});

