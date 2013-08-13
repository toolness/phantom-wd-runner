var spawn = require('child_process').spawn;

var execPath = process.argv[2];
var cmdlineArgs = process.argv.slice(3);
var stdioChunks = [];
var server = spawn(execPath, cmdlineArgs, {
  stdio: ['ignore', 'pipe', 'pipe']
});
var writeDebug = function(data) {
  var logfile = process.env['NODE_SERVER_RUNNER_DEBUG_LOGFILE'];

  if (logfile) try {
    require('fs').appendFileSync(logfile, data);
  } catch (e) {}
};
var writeError = function(data, cb) {
  writeDebug(data);
  process.stderr.write(data, cb);
};

server.stdout.on('data', stdioChunks.push.bind(stdioChunks));
server.stderr.on('data', stdioChunks.push.bind(stdioChunks));
server.on('error', function(err) {
  if (err.code == "ENOENT")
    throw new Error("'" + execPath + "' binary not found");
  throw err;
});
server.on('exit', function(code) {
  if (!code) return process.exit(0);
  stdioChunks.push(new Buffer('\n'));
  writeError(Buffer.concat(stdioChunks), function() {
    process.exit(code);
  });
});
process.on('uncaughtException', function(err) {
  writeError(err.stack, function() {
    server.kill();
    process.exit(1);
  });
});
['disconnect', 'SIGINT', 'SIGTERM'].forEach(function(eventName) {
  process.on(eventName, function() {
    writeDebug(eventName + " received, exiting cleanly.\n");
    server.kill();
    process.exit(0);
  });
});
