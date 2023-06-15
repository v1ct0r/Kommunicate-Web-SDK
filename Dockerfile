FROM node:lts-alpine3.12

ENV APP_PATH /usr/local/chat
ENV NPM_CONFIG_LOGLEVEL info
ENV PATH=/usr/local/chat/node_modules/.bin:$PATH


RUN apk update && apk upgrade && \
    apk add --no-cache \
    git
COPY . $APP_PATH/

WORKDIR $APP_PATH

RUN npm install && npm cache clean --force

# navigate to app directory
WORKDIR $APP_PATH/server

