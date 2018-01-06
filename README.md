# build-manager

Github hook which automatically deploys docker services

# How does it work

The build manager runs in a container and listens to github hook. If it receives
a hook from a repo it was configured to listen to (see config/config.yml), it will
trig a **docker-compose** command to rebuild the container from the repo.
