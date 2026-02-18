# multi-stage docker for build and then run
ARG BUILD_ENV=prod
ARG NGINX_CONF=nginx.conf
ARG REACT_APP_API_BASE_URL="/api"

FROM node:18.14.0-alpine as builder

ARG BUILD_ENV
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# this will be temporary working directory
WORKDIR /app/frontend

# use docker caching for node_modules
COPY package*.json ./

# install all dependences
RUN npm install

COPY . .

# build the executable
RUN npm run build-${BUILD_ENV}

# delete dev dependencies
RUN npm prune --production

# install node-prune globally
RUN npm install -g node-prune

# install bash shell in docker
RUN apk update && apk add bash

# run node prune script, remove all unused or required files from node_modules
RUN /usr/local/bin/node-prune

# remove more unused dependencies
RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs/_esm2015/
RUN rm -rf node_modules/swagger-ui-dist/*.map

# final stage
FROM nginx:alpine

ARG NGINX_CONF
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY ./${NGINX_CONF} /etc/nginx/templates/default.conf.template

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# copy all the compiled production code to nginx html file from react
COPY --from=builder /app/frontend/dist /usr/share/nginx/html/dist
COPY --from=builder /app/frontend/node_modules /usr/share/nginx/html/node_modules

EXPOSE 80 443

# envsubst replaces ${DOMAIN}, ${SSL_CERT_PATH}, ${SSL_KEY_PATH} in nginx template at startup
# $$host etc. are preserved (nginx variables use $ too, so we only substitute our vars)
CMD ["/bin/sh", "-c", "envsubst '${DOMAIN} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
