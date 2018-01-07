const fs = require('fs');
const tmp = require('tmp');
const githubhook = require('githubhook');
const bitbuckethook = require('./bitbuckethook');
const ssh = require('ssh-exec');
const YAML = require('yamljs');

function failIfUndefined(object, field) {
  if (object[field] === undefined) {
    console.error(`missing ${field} in configuration`);
    process.exit(0);
  }
}

function validateConfig(config) {
  failIfUndefined(config, 'ssh');
  failIfUndefined(config.ssh, 'host');
  failIfUndefined(config.ssh, 'port');
  failIfUndefined(config.ssh, 'user');
  failIfUndefined(config, 'hooks');
  failIfUndefined(config.hooks, 'github');
  failIfUndefined(config.hooks, 'bitbucket');
  failIfUndefined(config, 'compose');
  failIfUndefined(config.compose, 'path');
  return config;
}

const config = validateConfig(YAML.parse(fs.readFileSync('config/config.yml').toString()));

// Github
const handler = githubhook(config.hooks.github);

handler.on('push', (repo, ref) => {
 if (config.hooks.github.repositories.indexOf(repo) !== -1 && ref === 'refs/heads/master') {
   const command = `
     cd ${config.compose.path} &&
     docker-compose build --no-cache ${repo.toLowerCase()} &&
     docker-compose up -d &&
     docker system prune -f`;
   ssh(command, config.ssh).pipe(process.stdout);
 }
});

handler.listen();

// Bitbucket
const bbhandler = bitbuckethook(config.hooks.bitbucket);

bbhandler.on('push', (repo, ref) => {
 if (config.hooks.bitbucket.repositories.indexOf(repo) !== -1 && ref === 'master') {
   const command = `
     cd ${config.compose.path} &&
     docker-compose build --no-cache ${repo.toLowerCase()} &&
     docker-compose up -d &&
     docker system prune -f`;
   ssh(command, config.ssh).pipe(process.stdout);
 }
});

bbhandler.listen();
