FROM alpine:latest

RUN apk add --update --no-cache bash nodejs nodejs-npm

RUN node --version

RUN mkdir app
ADD package.json /app
ADD server.js /app

WORKDIR /app

RUN npm install --production && \
  chmod 700 server.js

CMD ["node", "server.js"]
