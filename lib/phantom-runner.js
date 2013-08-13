var spawn = require('child_process').spawn;

var PHANTOMJS = process.env.PHANTOMJS || 'phantomjs';
var PORT = process.env.PORT || '4444';

var stdioChunks = [];
var phantomjs = spawn(PHANTOMJS, ['--webdriver=' + PORT], {
  stdio: ['ignore', 'pipe', 'pipe']
});
var shutdown = function() {
  phantomjs.kill();
  process.exit(0);
};

phantomjs.stdout.on('data', stdioChunks.push.bind(stdioChunks));
phantomjs.stderr.on('data', stdioChunks.push.bind(stdioChunks));
phantomjs.on('error', function(err) {
  if (err.code == "ENOENT")
    throw new Error("'" + PHANTOMJS + "' binary not found");
  throw err;
});
phantomjs.on('exit', function(code) {
  if (!code) return process.exit(0);
  process.stderr.write(Buffer.concat(stdioChunks));
  process.exit(code);
});
process.on('uncaughtException', function(err) {
  process.stderr.write(err.stack);
  phantomjs.kill();
  process.exit(1);
});
process.on('disconnect', function() { phantomjs.kill(); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
