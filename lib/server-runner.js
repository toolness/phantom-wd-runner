var spawn = require('child_process').spawn;

var execPath = process.argv[2];
var cmdlineArgs = process.argv.slice(3);
var stdioChunks = [];
var server = spawn(execPath, cmdlineArgs, {
  stdio: ['ignore', 'pipe', 'pipe']
});
var shutdown = function() {
  server.kill();
  process.exit(0);
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
  process.stderr.write(Buffer.concat(stdioChunks));
  process.exit(code);
});
process.on('uncaughtException', function(err) {
  process.stderr.write(err.stack);
  server.kill();
  process.exit(1);
});
process.on('disconnect', function() { server.kill(); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
