// Include libraries
const express = require('express')
const bodyParser = require('body-parser')
const bitbucket = require('bitbucket-hook')

module.exports = function (config) {
  const events = {
    push: (repo, ref) => {},
  };

  var app = express()
  // Set this to enable X-Forwarded-For behind reverse proxy
  app.set('trust proxy', 'loopback');
  // Assign JSON body parser
  app.use(bodyParser.json());

  // Create web hook
  config.repositories.forEach((repo) => {
    app.post(config.path, bitbucket(repo, 'master'), function () {
      events.push(repo, 'master');
    });
  });

  return {
    on: function (eventType, callback) {
      events[eventType] = callback;
    },
    listen: function () {
      // Start web server
      app.listen(config.port, config.host, function () {
        console.log(`BitBucket hook started at ${config.host}:${config.port}`);
      });
    }
  };
}
