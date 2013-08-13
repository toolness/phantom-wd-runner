This is a simple library that makes it easy to launch
PhantomJS with its built-in WebDriver server, and deal with
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
* `port` - Port to serve the PhantomJS WebDriver server on.

This function returns a [child process][] instance.

#### Events

All child process events are emitted, along with the following:

* `listening` - Triggered when the PhantomJS WebDriver server is ready.

#### Error Handling

The library tries to make it easy to debug errors without being 
spammy. By default, no output from the PhantomJS process is sent to
stdio; however, if the PhantomJS process exits abnormally for any reason,
its buffered output is sent to stderr.

If an uncaught exception occurs in the calling process, the PhantomJS
server is automatically killed.

When the calling process exits, the PhantomJS server is also terminated
if necessary.

## License

[BSD][].

  [child process]: http://nodejs.org/api/child_process.html
  [BSD]: http://opensource.org/licenses/BSD-2-Clause
