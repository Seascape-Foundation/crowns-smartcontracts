# Embark.js in Docker

FROM node:14.13.1

# Install essential OS packages
RUN apt-get update
RUN apt-get install --yes build-essential inotify-tools git python g++ make

WORKDIR /home/node/app


COPY ./erc-20/package.json /home/node/app/package.json
RUN npm install
RUN npm install -g embark --unsafe

ENTRYPOINT []
