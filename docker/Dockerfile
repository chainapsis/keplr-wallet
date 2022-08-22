FROM ubuntu:20.04

# Install dependencies for build
RUN apt-get update && apt -y install build-essential libusb-1.0-0-dev curl unzip watchman

# Install node 14
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt -y install nodejs

# Install yarn
RUN npm install --global yarn

# Install lerna
RUN yarn global add lerna

# Install protobuf v21.3
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.3/protoc-21.3-linux-$(if [ $(uname -m) = "aarch64" ]; then echo aarch_64; else echo x86_64; fi).zip
RUN unzip protoc-21.3-linux-$(if [ $(uname -m) = "aarch64" ]; then echo aarch_64; else echo x86_64; fi).zip -d $HOME/protoc
RUN cp -r $HOME/protoc/include /usr/local
RUN cp -r $HOME/protoc/bin /usr/local

RUN useradd user
RUN mkdir /home/user
RUN usermod -d /home/user user
RUN chown -Rh user:user /home/user

COPY ./ /home/user/app
RUN chown -Rh user:user /home/user/app

USER user

WORKDIR /home/user/app

# Remove all .DS_Store fils which exist only in OSX
RUN find . -name .DS_Store -exec rm {} \;

# Clean before installing to ensure the same environment
RUN yarn clean

RUN cd packages/extension/src/keplr-torus-signin && yarn install --frozen-lockfile
RUN yarn install --frozen-lockfile

RUN yarn build

USER root

VOLUME /data

WORKDIR /data

CMD mkdir -p ./build && cd ./build && find . -type f -delete && cp -r /home/user/app/packages/extension/build /data
