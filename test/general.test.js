var fs = require('fs');
var should = require('should');

var ping = require('../lib/ping-until-ready').ping;
var start = require('../').startServerAndPing;

var TEST_PORT = 5324;
var TEST_URL = 'http://localhost:' + TEST_PORT;
var LOGFILE = __dirname + '/debug.log';

process.env['NODE_SERVER_RUNNER_DEBUG_LOGFILE'] = LOGFILE;

function logfile() {
  if (!fs.existsSync(LOGFILE))
    return "";
  return fs.readFileSync(LOGFILE, "utf-8");
}

function example(filename, extra) {
  extra = extra || {};

  var options = {
    cmdline: [process.execPath, __dirname + '/example/' + filename,
              TEST_PORT.toString()],
    url: TEST_URL,
    timeout: 15000
  };

  Object.keys(extra).forEach(function(key) {
    options[key] = extra[key];
  });

  return options;
}

describe("startServerAndPing()", function() {
  this.timeout(5000);

  beforeEach(function() {
    if (fs.existsSync(LOGFILE))
      fs.unlinkSync(LOGFILE);
  });

  it("should emit listening event and exit on SIGTERM", function(done) {
    start(example('simple-server.js')).on('listening', function() {
      var server = this;

      this.on('exit', function(code) {
        if (process.platform != 'win32') {
          code.should.eql(0);
          logfile().should.match(/SIGTERM received/);
        }
        ping(TEST_URL, function(err, success) {
          success.should.equal(false);
          done();
        });
      });
      ping(TEST_URL, function(err, success) {
        success.should.equal(true);
        server.kill();
      });
    });
  });

  it("should raise error when cmdline arg is invalid", function(done) {
    start(example('nonexistent.js', {
      silent: true
    })).on('error', function(err) {
      err.code.should.be.above(0);
      logfile().should.match(/Cannot find module/);
      done();
    });
  });

  it("should raise error when executable is invalid", function(done) {
    start({
      silent: true,
      url: 'http://localhost',
      cmdline: ['lolololol']
    }).on('error', function(err) {
      err.code.should.be.above(0);
      logfile().should.match(/'lolololol' binary not found/);
      done();
    });
  });

  it("should raise error on timeout", function(done) {
    start(example('timeout-server.js', {
      timeout: 300
    })).on('error', function(err) {
      err.message.should.eql('timeout (300ms) exceeded when pinging ' +
                             TEST_URL);
      done();
    });
  });

  it("should kill process on parent disconnect", function(done) {
    start(example('timeout-server.js')).on('exit', function(code) {
      code.should.eql(0);
      logfile().should.match(/disconnect received/);
      done();
    }).disconnect();
  });
});
