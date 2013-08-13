var fs = require('fs');
var should = require('should');

var start = require('../').startServerAndPing;

var TEST_PORT = 5324;
var LOGFILE = __dirname + '/err.log';

process.env['NODE_SERVER_RUNNER_ERROR_LOGFILE'] = LOGFILE;

function logfile() {
  if (!fs.existsSync(LOGFILE))
    return "";
  return fs.readFileSync(LOGFILE, "utf-8");
}

function example(filename, extra) {
  extra = extra || {};

  var port = TEST_PORT.toString();
  var options = {
    cmdline: [process.execPath, __dirname + '/example/' + filename, port],
    url: 'http://localhost:' + port,
    timeout: 15000
  };

  Object.keys(extra).forEach(function(key) {
    options[key] = extra[key];
  });

  return options;
}

describe("startServerAndPing()", function() {
  beforeEach(function() {
    if (fs.existsSync(LOGFILE))
      fs.unlinkSync(LOGFILE);
  });

  it("should work", function(done) {
    start(example('simple-server.js')).on('listening', function() {
      this.on('exit', function(code) {
        code.should.eql(0);
        done();
      });
      this.kill();
    });
  });

  it("should raise error when cmdline is invalid", function(done) {
    start(example('nonexistent.js', {
      silent: true
    })).on('error', function(err) {
      err.code.should.be.above(0);
      logfile().should.match(/Cannot find module/);
      done();
    });
  });

  it("should raise error on timeout", function(done) {
    start(example('timeout-server.js', {
      timeout: 300
    })).on('error', function(err) {
      err.message.should.eql('timeout (300ms) exceeded when pinging ' +
                             'http://localhost:' + TEST_PORT);
      done();
    });
  });
});
