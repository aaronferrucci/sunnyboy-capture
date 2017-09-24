# sunnyboy-capture
Capture data from a Sunny Boy inverter

* Installation notes (ubuntu 16.04):
  * Node stuff
    1) `% sudo apt install nodejs` 
    1) `% sudo apt install npm`
  * Dependencies 
    * (local)
      1) `% npm install request`
      1) `% npm install request-promise`
    * (global)
      1) `% npm install -g request`
      1) `% npm install -g request-promise`
      1) `% npm link request`
      1) `% npm link request-promise`

* Usage example:
  * `% nodejs main.js 9/1/2017`

The output is a few inverter parameters - firmware version, serial number, ip address - and then the data for the requested date, from 4AM to 10PM.
