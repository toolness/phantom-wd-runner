var port = process.argv[2];

if (port)
  require('http').createServer(function(req, res) {
    return res.end('HI');
  }).listen(port);
