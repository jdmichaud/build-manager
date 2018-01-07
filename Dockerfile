FROM alpine:latest

RUN apk add --update --no-cache bash nodejs nodejs-npm

RUN mkdir app
COPY . /app

WORKDIR /app

RUN npm install --production && \
  chmod 700 server.js

CMD ["node", "server.js"]
