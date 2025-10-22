FROM alpine:latest

RUN apk add --update --no-cache bash nodejs npm

RUN mkdir app
COPY . /app

WORKDIR /app

# Allow the container to ssh without knowing the host
RUN mkdir -p /etc/ssh/ && \
  cat ssh_config >> /etc/ssh/ssh_config

RUN npm install --production && \
  chmod 700 server.js

CMD ["node", "server.js"]
