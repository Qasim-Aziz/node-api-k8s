FROM ubuntu:18.04


RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean
RUN mkdir -p /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.19.0

RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash
RUN source ${NVM_DIR}/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH ${NVM_DIR}/v${NODE_VERSION}/lib/node_modules
ENV PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:$PATH

RUN node -v
RUN npm -v
RUN mkdir app
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g yarn
RUN npm run yarn
RUN npm install pg
EXPOSE 3000




