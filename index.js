var pingUntilReady = require('./lib/ping-until-ready');

function env(values) {
  var envCopy = JSON.parse(JSON.stringify(process.env));
  Object.keys(values).forEach(function(key) {
    envCopy[key] = values[key];
  });
  return envCopy;
}

module.exports = function(options) {
  if (!options) options = {};

  var timeout = options.timeout || 15000;
  var port = (options.port || '4444').toString();
  var execPath = options.execPath || 'phantomjs';
  var statusUrl = 'http://localhost:' + port + '/status';
  var runnerPath = __dirname + '/lib/phantom-runner.js';
  var runner = require('child_process').fork(runnerPath, [], {
    env: env({
      PORT: port,
      PHANTOMJS: execPath
    })
  });
  runner.on('exit', function(code) {
    if (code)
      runner.emit('error',
                  new Error('phantomjs runner exited with code ' + code));
  });
  pingUntilReady(statusUrl, timeout, function(err) {
    if (err) return runner.emit('error', err);
    runner.emit('listening');
  });

  return runner;
};

if (!module.parent)
  module.exports().on("listening", function() {
    console.log("PhantomJS webdriver server ready! Exiting...");
    this.kill();
  });
