
var dateRange = function(mmddyyyy) {
  var d0 = new Date(mmddyyyy);
  var d_start = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 3, 55);
  var d_end = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 22, 0);

  return {
    start: Math.floor(d_start.getTime() / 1000),
    end: Math.floor(d_end.getTime() / 1000),
  };
}

module.exports = { dateRange: dateRange, };
