var RUNNER_PATH = __dirname + '/lib/server-runner.js';

var pingUntilReady = require('./lib/ping-until-ready');

function startServerAndPing(options) {
  var runner = require('child_process').fork(RUNNER_PATH, options.cmdline);

  runner.on('exit', function(code) {
    if (code)
      runner.emit('error',
                  new Error("'" + options.cmdline[0] +
                            "' runner exited with code " + code));
  });
  pingUntilReady(options.url, options.timeout, function(err) {
    if (err) return runner.emit('error', err);
    runner.emit('listening');
  });

  return runner;
}

function startPhantomWebdriver(options) {
  if (!options) options = {};

  var port = (options.port || '4444').toString();

  return startServerAndPing({
    timeout: options.timeout || 15000,
    url: 'http://localhost:' + port + '/status',
    cmdline: [options.execPath || 'phantomjs', '--webdriver=' + port]
  });
};

module.exports = startPhantomWebdriver;

if (!module.parent)
  startPhantomWebdriver().on("listening", function() {
    console.log("PhantomJS webdriver server ready! Exiting...");
    this.kill();
  });
