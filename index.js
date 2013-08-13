var RUNNER_PATH = __dirname + '/lib/server-runner.js';

var pingUntilReady = require('./lib/ping-until-ready');

function startServerAndPing(options) {
  var runner = require('child_process').fork(RUNNER_PATH, options.cmdline, {
    silent: !!options.silent
  });

  runner.on('exit', function(code) {
    if (code) {
      var err = new Error("'" + options.cmdline[0] +
                          "' runner exited with code " + code);
      err.code = code;
      runner.emit('error', err);
    }
  });
  pingUntilReady(options.url, options.timeout, function(err) {
    if (err) {
      runner.kill();
      return runner.emit('error', err);
    }
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
module.exports.startServerAndPing = startServerAndPing;

if (!module.parent)
  startPhantomWebdriver().on("listening", function() {
    console.log("PhantomJS webdriver server ready! Exiting...");
    this.kill();
  });
