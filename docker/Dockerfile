FROM node:lts-alpine

ARG LOG4BRAINS_VERSION
# npm reads this during the install; the release pipeline's dry runs point it at a local registry
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

USER node
WORKDIR /workdir
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN npm install -g @awarded/log4brains@${LOG4BRAINS_VERSION}

EXPOSE 4004
ENTRYPOINT [ "log4brains" ]
