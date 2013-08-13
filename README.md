[![Build Status](https://travis-ci.org/toolness/phantom-wd-runner.png?branch=master)](https://travis-ci.org/toolness/phantom-wd-runner)

This is a simple library that makes it easy to launch
[PhantomJS][] with its built-in [WebDriver][] server, and deal with
unexpected errors.

## Example

```javascript
var phantomWdRunner = require('phantom-wd-runner');

phantomWdRunner().on('listening', function() {
  console.log('Phantom Webdriver server is ready!');

  /* ... do stuff ... */

  this.kill();
});
```

## API

### phantomWdRunner([options])

Launch the PhantomJS WebDriver server.

`options` is optional and can have the following keys:

* `timeout` - Number of milliseconds to wait for PhantomJS and its
  WebDriver server to start. Defaults to 15000.
* `execPath` - Executable used to create the PhantomJS process. Defaults
  to `phantomjs`.
* `port` - Port to serve the PhantomJS WebDriver server on. Defaults to
  4444.

This function returns a [child process][] instance.

#### Events

All child process events are emitted, along with the following:

* `listening` - Triggered when the PhantomJS WebDriver server is ready.
* `error` - Like the child process event, but also emitted if the
  PhantomJS WebDriver server terminates with a nonzero exit code.

#### Error Handling

The library tries to make it easy to debug errors without being 
spammy. By default, no output from the PhantomJS process is sent to
stdio; however, if the PhantomJS process exits abnormally for any reason,
its buffered output is sent to stderr.

If an uncaught exception occurs in the calling process, the PhantomJS
server is automatically killed.

When the calling process exits, the PhantomJS server is also terminated
if necessary.

## Limitations

The only intended use for this library is within test suites. Don't
use it for long-running server processes, as all stdout/stderr from
the server is buffered in memory!

## License

[BSD][].

  [PhantomJS]: http://phantomjs.org/
  [WebDriver]: https://github.com/detro/ghostdriver
  [child process]: http://nodejs.org/api/child_process.html
  [BSD]: http://opensource.org/licenses/BSD-2-Clause
