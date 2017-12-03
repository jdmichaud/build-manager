const fs = require('fs');
const tmp = require('tmp');
const githubhook = require('githubhook');
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
  failIfUndefined(config, 'repositories');
  failIfUndefined(config, 'hook');
  return config;
}

const config = validateConfig(YAML.parse(fs.readFileSync('/config/config.yml').toString()));

const handler = githubhook(config.hook);

handler.on('push', (repo, ref) => {
 if (config.repositories.indexOf(repo) !== -1 && ref === 'refs/heads/master') {
   const command = `
     cd $DOCKER_COMPOSE_PATH &&
     docker-compose build --no-cache ${repo.toLowerCase()} &&
     docker-compose up -d &&
     docker system prune -f`;
   ssh(command, config.ssh).pipe(process.stdout);
 }
});

handler.listen();
