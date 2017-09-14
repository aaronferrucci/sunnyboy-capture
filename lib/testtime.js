var datetimeutils = require('./datetimeutils.js');

function main(params) {
  var test = datetimeutils.dateRange(params.date);
  console.log(new Date(test.start * 1000));
  console.log(new Date(test.end * 1000));
}

main(
  {
    date: process.argv[2],
  }
);
