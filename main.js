var SunnyCapture = require('./lib/sunnyboy-capture.js');
var password = require('./password.js');
var server = "https://192.168.1.140";

const util = require('util');
var printKeyValue = function(prefix, obj) {
  console.log(prefix + util.inspect(obj, {showHidden: false, depth: null}))
}

var dataHandler = function(resp) {
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

var infoHandler = function(resp) {
  printKeyValue("info: ", resp);
}

function main(params) {
  var sc = new SunnyCapture({
    server: server,
    date: params.date,
    password: params.password,
    dataHandler: dataHandler,
    infoHandler: infoHandler,
  });

  var result = sc.login()
    .then(sc.devinfo)
    .then(sc.logger)
    .finally(sc.logout);
}

main({
  password: password.password,
  date: process.argv[2],
});

